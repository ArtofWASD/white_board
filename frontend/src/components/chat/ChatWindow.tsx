import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { Chat, Message } from "../../types/chat.types"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

interface ChatWindowProps {
  chatId: string
  onClose?: () => void
  title?: string
  className?: string
}

const MESSAGES_PER_PAGE = 20

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  onClose,
  title,
  className = "",
}) => {
  const { user, token } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  // Store scroll height to adjust position after loading old messages
  const prevScrollHeightRef = useRef<number>(0)
  const isFirstLoadRef = useRef(true)

  // Listen for socket events
  // Listen for socket events
  useEffect(() => {
    // Defines the listener variable outside the promise scope so cleanup can access it?
    // No, cleanup runs when component unmounts. But the listener is created inside the promise.
    // We need a ref to hold the listener for cleanup.

    let socketInstance: any = null
    let listenerRef: any = null

    import("../../lib/socket").then(({ getSocket }) => {
      const socket = getSocket()
      socketInstance = socket

      if (!socket) {
        return
      }

      const handleNewNotification = async (notification: any) => {
        const isMatch =
          notification.type === "CHAT_MESSAGE" && notification.data?.chatId === chatId

        if (isMatch) {
          try {
            const response = await fetch(`/api/chats/${chatId}/messages?limit=1&skip=0`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (response.ok) {
              const newMessages = await response.json()

              if (newMessages.length > 0) {
                const incomingMsg = newMessages[0]

                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === incomingMsg.id)
                  if (exists) {
                    return prev
                  }
                  return [...prev, incomingMsg]
                })

                setTimeout(() => {
                  if (scrollContainerRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } =
                      scrollContainerRef.current
                    if (scrollHeight - scrollTop - clientHeight < 300) {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
                    }
                  }
                }, 100)
              }
            }
          } catch (e) {
            console.error("ChatWindow: Failed to fetch new message", e)
          }
        }
      }

      listenerRef = handleNewNotification
      socket.on("newNotification", handleNewNotification)
    })

    return () => {
      if (socketInstance && listenerRef) {
        socketInstance.off("newNotification", listenerRef)
      }
    }
  }, [chatId, token])

  const fetchMessages = async (offset: number, isLoadMore: boolean = false) => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/chats/${chatId}/messages?limit=${MESSAGES_PER_PAGE}&skip=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.ok) {
        const data = await response.json()

        if (data.length < MESSAGES_PER_PAGE) {
          setHasMore(false)
        }

        setMessages((prev) => {
          if (isLoadMore) {
            return [...data, ...prev]
          } else {
            return data
          }
        })
      }
    } catch (error) {
      console.error("Failed to fetch messages", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    if (
      container.scrollTop === 0 &&
      hasMore &&
      !isLoading &&
      messages.length >= MESSAGES_PER_PAGE
    ) {
      prevScrollHeightRef.current = container.scrollHeight
      const nextSkip = skip + MESSAGES_PER_PAGE
      setSkip(nextSkip)
      fetchMessages(nextSkip, true)
    }
  }

  // Adjust scroll position when messages change
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    if (isFirstLoadRef.current) {
      // Initial load: scroll to bottom
      if (messages.length > 0) {
        container.scrollTop = container.scrollHeight
        isFirstLoadRef.current = false
      }
    } else if (prevScrollHeightRef.current > 0) {
      // History load: maintain relative position
      const newScrollHeight = container.scrollHeight
      container.scrollTop = newScrollHeight - prevScrollHeightRef.current
      prevScrollHeightRef.current = 0
    } else {
      // New message added: scroll to bottom if was at bottom or if it's my message
      // For simplicity, auto-scroll to bottom on new message send (handled in sendMessage)
      // or if we just received one and were closely at bottom.
      // Here we rely on explicit scroll actions mainly.
    }
  }, [messages])

  useEffect(() => {
    // Reset state on chat change
    setMessages([])
    setSkip(0)
    setHasMore(true)
    isFirstLoadRef.current = true
    fetchMessages(0, false)

    // Polling is tricky with pagination. For now, we can perhaps just poll for very new messages?
    // Or disable it to avoid complications in this iteration as user requested lazy load logic.
    // Let's keep it simple and rely on manual refresh or socket events in future.
  }, [chatId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage, type: "text" }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages((prev) => [...prev, message])
        setNewMessage("")
        // Scroll to bottom
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
          }
        }, 50)
      }
    } catch (error) {
      console.error("Failed to send message", error)
    }
  }

  return (
    <div
      className={`flex flex-col h-[500px] w-full bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div className="font-bold text-gray-800">{title || "Чат"}</div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {isLoading && skip > 0 && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                }`}>
                {!isMe && (
                  <div className="text-[10px] text-gray-400 font-bold mb-1">
                    {msg.sender.name} {msg.sender.lastName?.charAt(0)}.
                  </div>
                )}
                <p className="text-sm">{msg.content}</p>
                <div
                  className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-3 border-t border-gray-100 bg-white rounded-b-lg relative">
        <div className="flex gap-2">
          {/* Emoji Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-2 z-50">
              <div className="shadow-xl rounded-lg overflow-hidden border border-gray-200">
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: any) => {
                    setNewMessage((prev) => prev + emoji.native)
                    setShowEmojiPicker(false)
                  }}
                  theme="light"
                  set="native"
                />
              </div>
              {/* Click outside backdrop (transparent) */}
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setShowEmojiPicker(false)}></div>
            </div>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
