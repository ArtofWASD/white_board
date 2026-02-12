/**
 * Централизованный клиент для серверных route handlers (Next.js API Routes).
 *
 * Автоматически обеспечивает:
 * - BACKEND_URL из environment
 * - Проброс cookies из Next.js request к NestJS backend
 * - CSRF header injection для мутирующих запросов
 * - Обработка connection errors (503)
 * - Проброс Set-Cookie headers обратно клиенту
 *
 * @example
 * ```ts
 * // Простой проброс запроса:
 * export async function GET(request: NextRequest) {
 *   return BackendClient.forwardRequest(request, '/teams/user/123')
 * }
 *
 * // С телом запроса:
 * export async function POST(request: NextRequest) {
 *   const body = await request.json()
 *   return BackendClient.forwardRequest(request, '/teams/create', {
 *     method: 'POST',
 *     body,
 *   })
 * }
 *
 * // Ручной контроль (для auth routes с Set-Cookie):
 * export async function POST(request: NextRequest) {
 *   const response = await BackendClient.request(request, '/auth/login', {
 *     method: 'POST',
 *     body: await request.json(),
 *   })
 *   const data = await response.json()
 *   const nextResponse = NextResponse.json(data)
 *   BackendClient.forwardCookies(response, nextResponse.headers)
 *   return nextResponse
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server"
import {
  createBackendHeaders,
  createBackendHeadersWithCsrf,
  forwardSetCookieHeaders,
} from "./cookieHelpers"

// ─── Типы ──────────────────────────────────────────────────────────────────────

interface BackendRequestOptions {
  method?: string
  body?: unknown
  /** Нужен ли CSRF header (для POST, PUT, PATCH, DELETE) */
  withCsrf?: boolean
  /** Дополнительные headers */
  headers?: Record<string, string>
}

// Мутирующие HTTP методы, для которых нужен CSRF
const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

// ─── Клиент ────────────────────────────────────────────────────────────────────

export class BackendClient {
  private static readonly baseUrl = process.env.BACKEND_URL || "http://localhost:3001"

  /**
   * Выполняет запрос к NestJS backend с пробросом cookies.
   * Возвращает сырой Response для ручной обработки.
   */
  static async request(
    nextRequest: NextRequest,
    endpoint: string,
    options: BackendRequestOptions = {},
  ): Promise<Response> {
    const method = (options.method || "GET").toUpperCase()
    const needsCsrf =
      options.withCsrf !== undefined ? options.withCsrf : CSRF_METHODS.has(method)

    // Формируем headers с пробросом cookies
    const baseHeaders = needsCsrf
      ? await createBackendHeadersWithCsrf(nextRequest)
      : await createBackendHeaders(nextRequest)

    const headers: Record<string, string> = {
      ...(baseHeaders as Record<string, string>),
      ...(options.headers || {}),
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      ...(options.body !== undefined && {
        body: JSON.stringify(options.body),
      }),
    }

    const url = `${this.baseUrl}${endpoint}`

    try {
      return await fetch(url, fetchOptions)
    } catch (error) {
      // Обёртка для connection errors
      throw new BackendConnectionError(endpoint, error)
    }
  }

  /**
   * Пробрасывает запрос к backend и возвращает NextResponse.
   * Автоматически обрабатывает connection errors (503) и проброс cookies.
   */
  static async forwardRequest(
    nextRequest: NextRequest,
    endpoint: string,
    options: BackendRequestOptions = {},
  ): Promise<NextResponse> {
    try {
      const response = await this.request(nextRequest, endpoint, options)

      let data: unknown
      const contentType = response.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      const nextResponse = NextResponse.json(data, {
        status: response.status,
      })

      // Пробрасываем Set-Cookie headers от backend
      forwardSetCookieHeaders(response, nextResponse.headers)

      return nextResponse
    } catch (error) {
      if (error instanceof BackendConnectionError) {
        return NextResponse.json(
          {
            error: "Сервис недоступен. Пожалуйста, убедитесь, что сервер запущен.",
          },
          { status: 503 },
        )
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return NextResponse.json(
        { error: `Ошибка сервера: ${errorMessage}` },
        { status: 500 },
      )
    }
  }

  /**
   * Утилита для проброса Set-Cookie из backend response в frontend response.
   */
  static forwardCookies(backendResponse: Response, frontendHeaders: Headers): void {
    forwardSetCookieHeaders(backendResponse, frontendHeaders)
  }
}

// ─── Ошибка соединения ─────────────────────────────────────────────────────────

class BackendConnectionError extends Error {
  constructor(endpoint: string, cause: unknown) {
    super(`Backend connection error for ${endpoint}`)
    this.name = "BackendConnectionError"
    this.cause = cause
  }
}
