/**
 * API модуль для работы с чатом.
 *
 * @example
 * ```ts
 * import { chatApi } from '@/lib/api/chat'
 * const chats = await chatApi.getUserChats()
 * ```
 */

import { apiClient } from "./apiClient"
import { Chat, Message } from "../../types/chat.types"

export const chatApi = {
  /** Получить все чаты пользователя */
  getUserChats: () => apiClient.get<Chat[]>("/api/chats"),

  /** Получить командный чат */
  getTeamChat: (teamId: string) => apiClient.get<Chat>(`/api/chats/team/${teamId}`),

  /** Создать личный чат */
  createDirectChat: (targetUserId: string) =>
    apiClient.post<Chat>("/api/chats/direct", { targetUserId }),

  /** Получить сообщения чата */
  getMessages: (chatId: string, limit = 50, skip = 0) =>
    apiClient.get<Message[]>(`/api/chats/${chatId}/messages`, {
      limit: String(limit),
      skip: String(skip),
    }),

  /** Отправить сообщение */
  sendMessage: (
    chatId: string,
    content: string,
    type: "text" | "image" | "video_link" = "text",
  ) => apiClient.post<Message>(`/api/chats/${chatId}/messages`, { content, type }),
}

// Re-export для обратной совместимости
export const getUserChats = chatApi.getUserChats
export const getTeamChat = chatApi.getTeamChat
export const createDirectChat = chatApi.createDirectChat
export const getMessages = chatApi.getMessages
export const sendMessage = chatApi.sendMessage
