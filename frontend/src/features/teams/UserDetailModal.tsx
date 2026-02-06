import React, { useState, useEffect } from "react"
import { Modal } from "../../components/ui/Modal"
import { User, StrengthWorkoutResult, UserEventResult } from "../../types"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { Loader } from "../../components/ui/Loader"
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
  const { token, user: currentUser } = useAuthStore()

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData()
      // Initialize chat if opening
      initialiseChat()
    }
  }, [isOpen, user])

  const initialiseChat = async () => {
    if (!user) return
    try {
      const response = await fetch("/api/chats/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: user.id }),
      })

      if (response.ok) {
        const chat = await response.json()
        setChatId(chat.id)
      }
    } catch (error) {
      console.error("Failed to init chat", error)
    }
  }

  const fetchUserData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [strengthRes, eventsRes] = await Promise.all([
        fetch(`/api/strength-results?userId=${user.id}`, { headers }),
        fetch(`/api/events/results/user/${user.id}`, { headers }),
      ])

      if (strengthRes.ok) {
        const data = await strengthRes.json()
        setStrengthResults(data)
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json()
        setEventResults(data)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
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
        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.name} {user.lastName}
            </h2>
            <p className="text-blue-600 font-medium uppercase tracking-wider text-xs bg-blue-50 inline-block px-2 py-1 rounded-md mt-1">
              {user.role === "TRAINER"
                ? "Тренер"
                : user.role === "ATHLETE"
                  ? "Атлет"
                  : user.role}
            </p>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              {user.height && (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700">{user.height}</span>
                  <span>см</span>
                </div>
              )}
              {user.weight && (
                <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                  <span className="font-bold text-gray-700">{user.weight}</span>
                  <span>кг</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                <span className="font-medium text-gray-400">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("strength")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "strength"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Силовые
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "events"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Эвенты
          </button>
          {!isSelf && (
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
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
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">
                            {result.exercise?.name}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {new Date(result.date).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-blue-600">
                            {result.weight}
                          </span>
                          <span className="text-gray-400 font-bold mb-1">кг</span>
                          <span className="text-gray-300 mx-2">|</span>
                          <span className="text-gray-900 font-bold">{result.reps}</span>
                          <span className="text-gray-400 text-sm mb-0.5">повт.</span>
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
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500 border border-gray-100">
                            <span className="text-[10px] font-bold uppercase leading-none">
                              {new Date(result.event?.eventDate || "").toLocaleDateString(
                                "ru-RU",
                                { month: "short" },
                              )}
                            </span>
                            <span className="text-lg font-black leading-none">
                              {new Date(result.event?.eventDate || "").getDate()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {result.event?.title}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {result.event?.exerciseType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-blue-600">
                            {result.time}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">
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
                  className="h-full">
                  {chatId ? (
                    <ChatWindow
                      chatId={chatId}
                      className="!h-[400px] !border-none !shadow-none !bg-gray-50"
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
