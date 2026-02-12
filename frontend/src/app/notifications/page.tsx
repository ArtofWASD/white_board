"use client"

import React, { useEffect, useState } from "react"
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
import { Modal } from "../../components/ui/Modal"
import { ChatWindow } from "../../components/chat/ChatWindow"

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

    // Initialize socket for notifications page
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

  const [chatId, setChatId] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    )
    setNotifications(updatedNotifications)
    // Force refresh unread count in header via event or similar if possible,
    // or just rely on websocket/polling if implemented
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }

    if (notification.type === "CHAT_MESSAGE" && (notification.data as any)?.chatId) {
      setChatId((notification.data as any).chatId)
      setIsChatOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header onRightMenuClick={() => {}} onLeftMenuClick={() => {}} navItems={[]} />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Уведомления</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
              <CheckCheck className="w-4 h-4 mr-1" />
              Прочитать все
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
            Нет новых уведомлений
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start p-4 bg-white rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  notification.isRead
                    ? "border-gray-200"
                    : "border-blue-200 bg-blue-50/30"
                }`}>
                <div
                  className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                    notification.type === "LIKE"
                      ? "bg-pink-100 text-pink-500"
                      : "bg-blue-100 text-blue-500"
                  }`}>
                  {notification.type === "LIKE" ? (
                    <Heart className="w-5 h-5 fill-current" />
                  ) : (
                    <MessageSquare className="w-5 h-5 fill-current" />
                  )}
                </div>

                <div className="ml-4 flex-1">
                  <p
                    className={`text-base leading-relaxed ${notification.isRead ? "text-gray-700" : "text-gray-900 font-medium"}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>

                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          setChatId(null)
        }}
        title="Чат"
        size="lg">
        {chatId ? (
          <ChatWindow
            chatId={chatId}
            className="!h-[500px] !border-none !shadow-none !bg-gray-50"
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NotificationsPage
