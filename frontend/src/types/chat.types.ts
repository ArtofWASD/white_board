import { User } from "./index"

export interface Chat {
  id: string
  type: "direct" | "group"
  name?: string
  createdAt: string
  updatedAt: string
  participants: ChatParticipant[]
  messages: Message[]
  teamId?: string
  team?: {
    name: string
  }
}

export interface ChatParticipant {
  id: string
  chatId: string
  userId: string
  role?: string
  joinedAt: string
  user: {
    id: string
    name: string
    lastName?: string
    role: string
  }
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: "text" | "image" | "video_link"
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    lastName?: string
  }
}
