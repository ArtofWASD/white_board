/**
 * API модуль для работы с пользователями (admin функции).
 *
 * @example
 * ```ts
 * import { usersApi } from '@/lib/api/users'
 * const users = await usersApi.getAll()
 * ```
 */

import { apiClient } from "./apiClient"
import { User, StrengthWorkoutResult } from "../../types"

export const usersApi = {
  /** Получить всех пользователей */
  getAll: () => apiClient.get<User[]>("/api/users"),

  /** Получить пользователя по ID */
  getById: (userId: string) => apiClient.get<User>(`/api/users/${userId}`),

  /** Получить список атлетов (для добавления в команду) */
  getAthletes: () => apiClient.get<User[]>("/api/auth/athletes"),

  /** Обновить роль пользователя */
  updateRole: (userId: string, role: string) =>
    apiClient.patch<User>(`/api/users/${userId}/role`, { role }),

  /** Заблокировать/разблокировать пользователя */
  toggleBlock: (userId: string, isBlocked: boolean) =>
    apiClient.patch<User>(`/api/users/${userId}`, { isBlocked }),

  /** Удалить пользователя */
  deleteUser: (userId: string) => apiClient.delete<void>(`/api/users/${userId}`),
}

// ─── Упражнения ────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  [key: string]: unknown
}

export interface StrengthRecord {
  id: string
  weight: number
  reps: number
  date: string
  [key: string]: unknown
}

export const exercisesApi = {
  /** Получить упражнения пользователя */
  getUserExercises: (userId: string) =>
    apiClient.get<Exercise[]>("/api/exercises", { userId }),

  /** Создать упражнение */
  createExercise: (data: { name: string; userId: string }) =>
    apiClient.post<Exercise>("/api/exercises", data),

  /** Удалить упражнение */
  deleteExercise: (exerciseId: string) =>
    apiClient.delete<void>(`/api/exercises/${exerciseId}`),

  /** Получить записи силовых результатов */
  getRecords: (exerciseId: string) =>
    apiClient.get<StrengthRecord[]>(`/api/exercises/${exerciseId}/records`),

  /** Добавить запись силового результата */
  addRecord: (exerciseId: string, data: { weight: number; reps: number; date: string }) =>
    apiClient.post<StrengthRecord>(`/api/exercises/${exerciseId}/records`, data),
}

// ─── Силовые результаты ────────────────────────────────────────────────────────

export const strengthResultsApi = {
  /** Получить силовые результаты пользователя */
  getUserResults: (userId: string) =>
    apiClient.get<StrengthWorkoutResult[]>("/api/strength-results", { userId }),
}

// ─── Контент (Blog) ────────────────────────────────────────────────────────────

interface ContentExercise {
  id: string
  name: string
  [key: string]: unknown
}

interface WOD {
  id: string
  title: string
  [key: string]: unknown
}

interface NewsItem {
  id: string
  title: string
  [key: string]: unknown
}

export const contentApi = {
  /** Получить WODs для блога */
  getWods: () => apiClient.get<WOD[]>("/api/wods"),

  /** Получить конкретный WOD */
  getWod: (wodId: string) => apiClient.get<WOD>(`/api/wods/${wodId}`),

  /** Получить контентные упражнения */
  getContentExercises: () => apiClient.get<ContentExercise[]>("/api/content-exercises"),

  /** Получить конкретное контентное упражнение */
  getContentExercise: (exerciseId: string) =>
    apiClient.get<ContentExercise>(`/api/content-exercises/${exerciseId}`),

  /** Оценить контентное упражнение */
  rateContentExercise: (exerciseId: string, rating: number) =>
    apiClient.post<void>(`/api/content-exercises/${exerciseId}/rate`, { rating }),

  /** Получить новости */
  getNews: (limit?: number) =>
    apiClient.get<NewsItem[]>("/api/news", limit ? { limit: String(limit) } : undefined),
}

// ─── Настройки ─────────────────────────────────────────────────────────────────

export const settingsApi = {
  /** Получить публичные настройки */
  getPublic: () => apiClient.get<Record<string, unknown>>("/api/settings/public"),

  /** Получить настройку по ключу */
  getByKey: (key: string) => apiClient.get<unknown>(`/api/settings/${key}`),

  /** Обновить настройку */
  updateSetting: (key: string, value: unknown) =>
    apiClient.put<void>(`/api/settings/${key}`, { value }),
}

// ─── Организация ───────────────────────────────────────────────────────────────

export const organizationApi = {
  /** Получить статистику организации */
  getStats: <T = unknown>(trainerId: string) =>
    apiClient.get<T>("/api/organization/stats", { trainerId }),

  /** Заблокировать/разблокировать организацию */
  toggleBlock: (orgId: string, isBlocked: boolean) =>
    apiClient.patch<void>(`/api/organization/${orgId}/block`, { isBlocked }),

  /** Получить все организации (для супер-админа) */
  getAll: () => apiClient.get<any[]>("/api/organization/admin/all"),
}

// ─── Статистика ────────────────────────────────────────────────────────────────

export const statisticsApi = {
  /** Получить статистику для дашборда */
  getDashboard: () => apiClient.get<unknown>("/api/statistics/dashboard"),

  /** Получить статистику регистраций */
  getRegistrations: () => apiClient.get<unknown>("/api/statistics/registrations"),

  /** Получить статистику по ролям */
  getRoles: () => apiClient.get<unknown>("/api/statistics/roles"),
}
