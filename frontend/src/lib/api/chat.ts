import { useAuthStore } from "../store/useAuthStore"
import { Chat, Message } from "../../types/chat.types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// No longer need auth headers - using cookies
const getAuthHeader = (): Record<string, string> => {
  return { "Content-Type": "application/json" }
}

export const getUserChats = async (): Promise<Chat[]> => {
  const response = await fetch(`${API_URL}/api/chats`, {
    headers: getAuthHeader(),
    credentials: "include",
  })
  if (!response.ok) throw new Error("Failed to fetch chats")
  return response.json()
}

export const getTeamChat = async (teamId: string): Promise<Chat> => {
  const response = await fetch(`${API_URL}/api/chats/team/${teamId}`, {
    headers: getAuthHeader(),
    credentials: "include",
  })
  if (!response.ok) throw new Error("Failed to fetch team chat")
  return response.json()
}

export const createDirectChat = async (targetUserId: string): Promise<Chat> => {
  const response = await fetch(`${API_URL}/api/chats/direct`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ targetUserId }),
    credentials: "include",
  })
  if (!response.ok) throw new Error("Failed to create direct chat")
  return response.json()
}

export const getMessages = async (
  chatId: string,
  limit = 50,
  skip = 0,
): Promise<Message[]> => {
  const response = await fetch(
    `${API_URL}/api/chats/${chatId}/messages?limit=${limit}&skip=${skip}`,
    {
      headers: getAuthHeader(),
      credentials: "include",
    },
  )
  if (!response.ok) throw new Error("Failed to fetch messages")
  return response.json()
}

export const sendMessage = async (
  chatId: string,
  content: string,
  type: "text" | "image" | "video_link" = "text",
): Promise<Message> => {
  const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ content, type }),
  })
  if (!response.ok) throw new Error("Failed to send message")
  return response.json()
}
