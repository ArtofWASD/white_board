/**
 * API модуль для аутентификации.
 *
 * @example
 * ```ts
 * import { authApi } from '@/lib/api/auth'
 * const { user } = await authApi.login('email@example.com', 'password')
 * ```
 */

import { apiClient } from "./apiClient"
import { User } from "../../types"

interface LoginResponse {
  user: User
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: "TRAINER" | "ATHLETE" | "ORGANIZATION_ADMIN"
  gender?: string
  userType?: string
  lastName?: string
  organizationName?: string | null
}

interface ProfileData {
  name?: string
  lastName?: string
  height?: number
  weight?: number
  dashboardLayout?: string[]
  dashboardLayoutMode?: string
}

export const authApi = {
  /** Получить CSRF токен (вызывать перед login/register) */
  getCsrfToken: () => apiClient.get<{ csrfToken: string }>("/api/csrf/token"),

  /** Авторизация */
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/api/auth/login", { email, password }),

  /** Регистрация */
  register: (data: RegisterData) =>
    apiClient.post<LoginResponse>("/api/auth/register", data),

  /** Выход */
  logout: () => apiClient.post<void>("/api/auth/logout"),

  /** Обновить access_token */
  refreshToken: () =>
    apiClient.request<LoginResponse>("/api/auth/refresh", {
      method: "POST",
      skipAuthRetry: true, // Не делать retry на refresh endpoint
    }),

  /** Проверить текущего пользователя */
  verifyUser: async (userId: string): Promise<boolean> => {
    try {
      await apiClient.get(`/api/auth/user/${userId}`)
      return true
    } catch {
      return false
    }
  },

  /** Получить профиль пользователя */
  getProfile: (userId: string) =>
    apiClient.get<{ user: User }>(`/api/auth/user/${userId}`),

  /** Обновить профиль пользователя */
  updateProfile: (userId: string, data: ProfileData) =>
    apiClient.put<{ user: User }>(`/api/auth/profile/${userId}`, data),

  /** Загрузить аватар пользователя */
  uploadAvatar: async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append("file", file)

    // Using native fetch for FormData, or apiClient depending on your client wrapper.
    // apiClient often assumes JSON body if not handled explicitly.
    // However, if apiClient handles FormData properly:
    // Please note if apiClient doesn't automatically drop Content-Type for FormData, native fetch is required.
    const response = await apiClient.post<{ avatarUrl: string }>(
      `/api/users/${userId}/avatar`,
      formData,
    )
    return response
  },

  /** Получить список атлетов */
  getAthletes: () => apiClient.get<User[]>("/api/auth/athletes"),
}
