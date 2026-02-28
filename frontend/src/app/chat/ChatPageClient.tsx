"use client"

import React, { useState, useEffect } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useTeamStore } from "../../lib/store/useTeamStore"
import { createDirectChat } from "../../lib/api/chat"
import { logApiError } from "../../lib/logger"
import { ChatList } from "../../components/chat/ChatList"
import { ChatWindow } from "../../components/chat/ChatWindow"
import Header from "../../components/layout/Header"

export const ChatPageClient: React.FC = () => {
  const { user } = useAuthStore()
  const { teams, selectedTeam } = useTeamStore()
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Handle window resize to determine if mobile view is needed
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    handleResize()
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-create chat for athletes or read from notification link
  useEffect(() => {
    // 1. Check if we arrived from a notification link
    try {
      const storedChatId = localStorage.getItem("activeChatId")
      if (storedChatId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveChatId(storedChatId)
        localStorage.removeItem("activeChatId") // clear it right after reading
        return // if we have a stored chat, we don't need to auto-create
      }
    } catch (e) {
      console.error("Failed to read activeChatId from storage", e)
    }

    // 2. Fallback: auto-create chat for athletes if no chat is active
    const setupAthleteChat = async () => {
      if (user?.role === "ATHLETE" && !activeChatId) {
        const team = selectedTeam || teams[0]
        if (team && team.ownerId) {
          try {
            const chat = await createDirectChat(team.ownerId)
            setActiveChatId(chat.id)
          } catch (error) {
            logApiError("/api/chats/direct", error, { targetUserId: team.ownerId })
          }
        }
      }
    }

    setupAthleteChat()
  }, [user, teams, selectedTeam, activeChatId])

  // Determine what to show based on device and state
  const showList = !isMobile || (isMobile && !activeChatId)
  const showWindow = !isMobile || (isMobile && activeChatId)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 flex overflow-hidden lg:container lg:mx-auto lg:py-6 lg:px-4">
        <div className="flex-1 flex w-full bg-white dark:bg-gray-800 lg:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Sidebar / Chat List */}
          {showList && (
            <div className={`
              ${isMobile ? 'w-full' : 'w-1/3 min-w-[300px] max-w-[400px] border-r border-gray-200 dark:border-gray-700'}
              flex flex-col h-full bg-white dark:bg-gray-800
            `}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Чаты</h1>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ChatList 
                  onSelectChat={setActiveChatId} 
                  className="h-full"
                />
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          {showWindow && (
            <div className={`
              ${isMobile ? 'w-full' : 'flex-1'}
              flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 relative
            `}>
              {activeChatId ? (
                <>
                  {isMobile && (
                     <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center shadow-sm z-10">
                       <button
                         onClick={() => setActiveChatId(null)}
                         className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-md transition-colors"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                         </svg>
                         Назад к списку
                       </button>
                     </div>
                  )}
                  <ChatWindow
                    chatId={activeChatId}
                    className="flex-1 !border-none !shadow-none !rounded-none !h-full"
                  />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-6 text-center">
                  <div className="w-20 h-20 mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Выберите чат</h3>
                  <p className="max-w-xs">Выберите собеседника из списка слева, чтобы начать общение</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
