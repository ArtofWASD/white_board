import React, { useState, useEffect } from "react"
import { Modal } from "../../components/ui/Modal"
import { User, StrengthWorkoutResult, UserEventResult } from "../../types"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { logApiError } from "../../lib/logger"
import { Loader } from "../../components/ui/Loader"
import { chatApi } from "../../lib/api/chat"
import { strengthResultsApi } from "../../lib/api/users"
import { eventsApi } from "../../lib/api/events"
import { motion, AnimatePresence } from "framer-motion"
import { ChatWindow } from "../../components/chat/ChatWindow"

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

type TabType = "strength" | "events" | "chat"

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("strength")
  const [strengthResults, setStrengthResults] = useState<StrengthWorkoutResult[]>([])
  const [eventResults, setEventResults] = useState<UserEventResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const { user: currentUser } = useAuthStore()

  useEffect(() => {
    if (isOpen && user) {
      // Reset state for new user
      setActiveTab("strength")
      setChatId(null)
      
      fetchUserData()
      initialiseChat()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user])

  const initialiseChat = async () => {
    if (!user) return
    try {
      const chat = await chatApi.createDirectChat(user.id)
      if (chat) {
        setChatId(chat.id)
      }
    } catch (error) {
      logApiError("/api/chat/init", error)
    }
  }

  const fetchUserData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [strengthRes, eventsRes] = await Promise.all([
        strengthResultsApi.getUserResults(user.id),
        eventsApi.getUserResults(user.id),
      ])

      setStrengthResults(strengthRes || [])
      setEventResults(eventsRes || [])
    } catch (error) {
      logApiError(`/api/users/${user.id}/records`, error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const initials = `${user.name.charAt(0)}${user.lastName?.charAt(0) || ""}`
  const isSelf = currentUser?.id === user.id

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Детали профиля" size="xl">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200 dark:shadow-none">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.name} {user.lastName}
            </h2>
            <p className="text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider text-xs bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded-md mt-1">
              {user.role === "TRAINER"
                ? "Тренер"
                : user.role === "ATHLETE"
                  ? "Атлет"
                  : user.role}
            </p>
            <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              {user.height && (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{user.height}</span>
                  <span>см</span>
                </div>
              )}
              {user.weight && (
                <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700 pl-4">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{user.weight}</span>
                  <span>кг</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700 pl-4">
                <span className="font-medium text-gray-400 dark:text-gray-500">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("strength")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "strength"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            Силовые
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "events"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            Эвенты
          </button>
          {!isSelf && (
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              Чат
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {isLoading && activeTab !== "chat" ? (
            <div className="flex justify-center items-center h-64">
              <Loader size="lg" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "strength" ? (
                <motion.div
                  key="strength"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strengthResults.length > 0 ? (
                    strengthResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {result.exercise?.name}
                          </h4>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(result.date).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {result.weight}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 font-bold mb-1">кг</span>
                          <span className="text-gray-300 dark:text-gray-600 mx-2">|</span>
                          <span className="text-gray-900 dark:text-white font-bold">{result.reps}</span>
                          <span className="text-gray-400 dark:text-gray-500 text-sm mb-0.5">повт.</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-400">
                      Нет данных о силовых достижениях
                    </div>
                  )}
                </motion.div>
              ) : activeTab === "events" ? (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3">
                  {eventResults.length > 0 ? (
                    eventResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-600">
                            <span className="text-[10px] font-bold uppercase leading-none">
                              {new Date(result.event?.eventDate || "").toLocaleDateString(
                                "ru-RU",
                                { month: "short" },
                              )}
                            </span>
                            <span className="text-lg font-black leading-none text-gray-700 dark:text-gray-300">
                              {new Date(result.event?.eventDate || "").getDate()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {result.event?.title}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {result.event?.exerciseType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                            {result.time}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">
                            Результат
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      Нет результатов в эвентах
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full -mx-6 -mb-6 mt-4 relative">
                  {chatId ? (
                    <ChatWindow
                      chatId={chatId}
                      className="!h-[500px] !border-none !shadow-none !rounded-none rounded-b-xl"
                    />
                  ) : (
                    <div className="flex justify-center items-center h-64">
                      <Loader size="sm" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Modal>
  )
}
