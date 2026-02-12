/**
 * API модуль для работы с уведомлениями.
 *
 * @example
 * ```ts
 * import { notificationsApi } from '@/lib/api/notifications'
 * const notifications = await notificationsApi.getAll()
 * ```
 */

import { apiClient } from "./apiClient"

export interface Notification {
  id: string
  userId: string
  type: string // 'LIKE' | 'COMMENT'
  title?: string
  message: string
  isRead: boolean
  createdAt: string
  data?: any
}

export const notificationsApi = {
  /** Получить все уведомления */
  getAll: async (): Promise<Notification[]> => {
    try {
      const data = await apiClient.get<Notification[]>("/api/notifications")
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  /** Получить количество непрочитанных */
  getUnreadCount: async (): Promise<number> => {
    try {
      const data = await apiClient.request<{ count: number }>(
        "/api/notifications/unread-count",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        },
      )
      return data.count
    } catch {
      return 0
    }
  },

  /** Отметить уведомление как прочитанное */
  markAsRead: (notificationId: string) =>
    apiClient.patch<void>(`/api/notifications/${notificationId}/read`),

  /** Отметить все уведомления как прочитанные */
  markAllAsRead: () => apiClient.patch<void>("/api/notifications/read-all"),
}

// Re-export для обратной совместимости
export const getNotifications = notificationsApi.getAll
export const getUnreadNotificationCount = notificationsApi.getUnreadCount
export const markNotificationAsRead = notificationsApi.markAsRead
export const markAllNotificationsAsRead = notificationsApi.markAllAsRead
