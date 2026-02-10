"use client"

import React, { useState, useEffect } from "react"
import { Chat } from "../../types/chat.types"
import { getUserChats } from "../../lib/api/chat"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { MessageSquare, Users } from "lucide-react"
import { logApiError } from "../../lib/logger"

interface ChatListProps {
  onSelectChat: (chatId: string) => void
  className?: string
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, className = "" }) => {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await getUserChats()
        setChats(data)
      } catch (error) {
        logApiError("/api/chats", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [])

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-64 text-gray-400 ${className}`}>
        <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
        <p>У вас пока нет чатов</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {chats.map((chat) => {
        const otherParticipant = chat.participants.find(
          (p) => p.userId !== user?.id,
        )?.user
        const lastMessage = chat.messages[0]
        const name =
          chat.type === "group"
            ? chat.team?.name
              ? `Команда: ${chat.team.name}`
              : "Групповой чат"
            : otherParticipant
              ? `${otherParticipant.name} ${otherParticipant.lastName || ""}`
              : "Чат"

        return (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100 transition-all">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                chat.type === "group"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-blue-100 text-blue-600"
              }`}>
              {chat.type === "group" ? (
                <Users size={20} />
              ) : (
                <span className="font-bold text-sm">
                  {otherParticipant?.name?.charAt(0) || "?"}
                </span>
              )}
            </div>

            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 truncate">{name}</span>
                {lastMessage && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(lastMessage.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {lastMessage && (
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {lastMessage.senderId === user?.id ? "Вы: " : ""}
                  {lastMessage.type === "image" ? "Изображение" : lastMessage.content}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
