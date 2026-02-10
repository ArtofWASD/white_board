import { useAuthStore } from "../store/useAuthStore"
import { logApiError, logApiSuccess } from "../logger"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// No longer need auth headers - using cookies
const getAuthHeader = (): Record<string, string> => {
  return { "Content-Type": "application/json" }
}

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

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: getAuthHeader(),
    })

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data)) {
        return data
      } else {
        logApiError("/api/notifications", new Error("Unexpected response format"), {
          data,
        })
        return []
      }
    } else {
      logApiError("/api/notifications", new Error("Failed to fetch"), {
        status: response.status,
      })
      return []
    }
  } catch (error) {
    logApiError("/api/notifications", error)
    return []
  }
}

export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: getAuthHeader(),
    })
    if (response.ok) {
      const data = await response.json()
      return data.count
    }
    return 0
  } catch (error) {
    logApiError("/api/notifications/unread-count", error)
    return 0
  }
}

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: getAuthHeader(),
    })
  } catch (error) {
    logApiError(`/api/notifications/${notificationId}/read`, error)
  }
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: getAuthHeader(),
    })
  } catch (error) {
    logApiError("/api/notifications/read-all", error)
  }
}
