"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useRouter } from "next/navigation"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "../../lib/api/notifications"
import Header from "../../components/layout/Header"
import { Heart, MessageSquare, CheckCheck } from "lucide-react"

type GroupedNotification = Notification & { groupIds?: string[], unreadGroupIds?: string[] }

const NotificationsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.id) {
      import("../../lib/socket").then(({ initializeSocket }) => {
        initializeSocket(user.id)
      })
    }

    const fetchNotifications = async () => {
      const data = await getNotifications()
      setNotifications(data)
      setLoading(false)
    }

    fetchNotifications()

    return () => {
      if (user?.id) {
        import("../../lib/socket").then(({ disconnectSocket }) => {
          disconnectSocket()
        })
      }
    }
  }, [isAuthenticated, router, user?.id])

  // Group notifications
  const groupedNotifications = useMemo(() => {
    const result: GroupedNotification[] = []
    const chatGroups = new Map<string, GroupedNotification>()

    notifications.forEach((notif) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (notif.type === "CHAT_MESSAGE" && (notif.data as any)?.chatId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cId = (notif.data as any).chatId
        const existingGroup = chatGroups.get(cId)

        if (existingGroup) {
          existingGroup.groupIds?.push(notif.id)
          if (!notif.isRead) {
            existingGroup.isRead = false // mark group as unread if at least one is unread
            existingGroup.unreadGroupIds?.push(notif.id)
          }
        } else {
          const newGroup: GroupedNotification = {
            ...notif,
            groupIds: [notif.id],
            unreadGroupIds: notif.isRead ? [] : [notif.id],
          }
          chatGroups.set(cId, newGroup)
          result.push(newGroup)
        }
      } else {
        result.push(notif)
      }
    })

    return result
  }, [notifications])

  const handleMarkAsRead = async (id: string, groupIds?: string[], unreadGroupIds?: string[]) => {
    // If it's a group, mark all unread members of the group as read
    const idsToMark = unreadGroupIds && unreadGroupIds.length > 0 ? unreadGroupIds : [id]

    try {
      await Promise.all(idsToMark.map((i) => markNotificationAsRead(i)))

      setNotifications((prev) =>
        prev.map((n) => {
          if (idsToMark.includes(n.id)) {
            return { ...n, isRead: true }
          }
          return n
        }),
      )
    } catch (e) {
      console.error("Failed to mark notifications as read", e)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = async (notif: GroupedNotification) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id, notif.groupIds, notif.unreadGroupIds)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (notif.type === "CHAT_MESSAGE" && (notif.data as any)?.chatId) {
      // Store the active chat ID in localStorage so the chat page knows which one to open initially
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        localStorage.setItem("activeChatId", (notif.data as any).chatId)
      } catch (e) {
        console.error("Failed to save activeChatId", e)
      }
      router.push("/chat")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm dark:border-b dark:border-gray-700">
        <Header onRightMenuClick={() => {}} onLeftMenuClick={() => {}} navItems={[]} />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Уведомления</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              <CheckCheck className="w-4 h-4 mr-1" />
              Прочитать все
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : groupedNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            Нет новых уведомлений
          </div>
        ) : (
          <div className="space-y-3">
            {groupedNotifications.map((notification) => {
              const count = notification.groupIds?.length || 1

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    notification.isRead
                      ? "border-gray-200 dark:border-gray-700"
                      : "border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20"
                  }`}>
                  <div
                    className={`mt-1 p-2 rounded-full flex-shrink-0 relative ${
                      notification.type === "LIKE"
                        ? "bg-pink-100 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400"
                    }`}>
                    {notification.type === "LIKE" ? (
                      <Heart className="w-5 h-5 fill-current" />
                    ) : (
                      <MessageSquare className="w-5 h-5 fill-current" />
                    )}
                    {count > 1 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
                        {count}
                      </span>
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    {/* Render Sender Name from title, if it exists */}
                    {notification.title && (
                      <h4
                         className={`text-sm mb-0.5 ${
                          notification.isRead
                            ? "text-gray-600 dark:text-gray-400 font-medium"
                            : "text-gray-900 dark:text-white font-bold"
                        }`}>
                        {notification.title}
                      </h4>
                    )}
                    <p
                      className={`text-sm leading-relaxed ${
                        notification.isRead
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-gray-800 dark:text-gray-200"
                      }`}>
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 ml-2"></div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificationsPage
