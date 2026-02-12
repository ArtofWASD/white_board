/**
 * Централизованный API клиент для клиентских компонентов.
 *
 * Автоматически обеспечивает:
 * - credentials: "include" на каждом запросе
 * - Content-Type: application/json для body requests
 * - Единую обработку ошибок через типизированный ApiError
 * - Интеграцию с logger (logApiError / logApiSuccess)
 * - Auto-retry при 401 через refreshToken (один раз)
 *
 * @example
 * ```ts
 * import { apiClient } from '@/lib/api/apiClient'
 *
 * const teams = await apiClient.get<Team[]>('/api/teams?userId=123')
 * await apiClient.post('/api/teams', { name: 'My Team' })
 * ```
 */

import { logApiError, logApiSuccess } from "../logger"
import { useCsrfStore } from "../store/useCsrfStore"

// ─── Типы ──────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly endpoint: string,
    public readonly data?: unknown,
  ) {
    const msg =
      typeof data === "object" && data !== null && "message" in data
        ? (data as { message: string }).message
        : `API Error ${status}: ${statusText}`
    super(msg)
    this.name = "ApiError"
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** Пропустить автоматический retry при 401 */
  skipAuthRetry?: boolean
  /** Пропустить логирование */
  skipLogging?: boolean
}

// ─── Клиент ────────────────────────────────────────────────────────────────────

class ApiClient {
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  /**
   * Основной метод запроса.
   * Все остальные методы (get, post, put, patch, delete) являются обёртками.
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, skipAuthRetry, skipLogging, ...fetchOptions } = options

    // Получаем CSRF токен для мутирующих запросов
    const method = (fetchOptions.method || "GET").toUpperCase()
    const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method)

    let csrfToken: string | null = null
    if (isMutating) {
      csrfToken = await useCsrfStore.getState().getCsrfToken()
    }

    const headers: Record<string, string> = {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(csrfToken && { "X-CSRF-Token": csrfToken }),
      ...((fetchOptions.headers as Record<string, string>) || {}),
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: "include",
      ...(body !== undefined && { body: JSON.stringify(body) }),
    }

    try {
      const response = await fetch(endpoint, config)

      // 401 — попытка обновить токен и повторить запрос
      if (response.status === 401 && !skipAuthRetry) {
        const refreshed = await this.tryRefreshToken()
        if (refreshed) {
          return this.request<T>(endpoint, { ...options, skipAuthRetry: true })
        }
        // Refresh не удался — logout и бросаем ошибку
        await this.forceLogout()
        throw new ApiError(401, "Unauthorized", endpoint)
      }

      // Пустой ответ (204 No Content)
      if (response.status === 204) {
        if (!skipLogging) logApiSuccess(endpoint)
        return undefined as T
      }

      // Парсим JSON
      let data: unknown
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const error = new ApiError(response.status, response.statusText, endpoint, data)
        if (!skipLogging) logApiError(endpoint, error, { status: response.status, data })
        throw error
      }

      if (!skipLogging) logApiSuccess(endpoint, data)
      return data as T
    } catch (error) {
      if (error instanceof ApiError) throw error

      // Сетевая ошибка или другая непредвиденная ошибка
      if (!skipLogging) logApiError(endpoint, error)
      throw error
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | undefined>,
  ): Promise<T> {
    let url = endpoint
    if (params) {
      const filtered = Object.entries(params).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      )
      if (filtered.length > 0) {
        const searchParams = new URLSearchParams(filtered)
        url += (url.includes("?") ? "&" : "?") + searchParams.toString()
      }
    }
    return this.request<T>(url, { method: "GET" })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // ─── Внутренние методы ─────────────────────────────────────────────────────

  /**
   * Пытается обновить access_token через /api/auth/refresh.
   * Гарантирует, что одновременно выполняется только один refresh.
   */
  private async tryRefreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.executeRefresh()

    try {
      return await this.refreshPromise
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async executeRefresh(): Promise<boolean> {
    try {
      // CSRF токен нужен и для refresh (POST запрос)
      const csrfToken = await useCsrfStore.getState().getCsrfToken()

      const headers: Record<string, string> = {
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers,
        credentials: "include",
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Принудительный logout при невозможности обновить токен.
   */
  private async forceLogout(): Promise<void> {
    try {
      // CSRF токен нужен и для logout (POST запрос)
      const csrfToken = await useCsrfStore.getState().getCsrfToken()

      const headers: Record<string, string> = {
        ...(csrfToken && { "X-CSRF-Token": csrfToken }),
      }

      await fetch("/api/auth/logout", {
        method: "POST",
        headers,
        credentials: "include",
      })
    } catch {
      // Игнорируем ошибки logout
    }

    // Очищаем zustand auth store через localStorage event
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage")
      window.dispatchEvent(new Event("storage"))
    }
  }
}

// ─── Синглтон ──────────────────────────────────────────────────────────────────

export const apiClient = new ApiClient()
