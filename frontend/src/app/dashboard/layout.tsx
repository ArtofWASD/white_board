"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useTeamStore } from "../../lib/store/useTeamStore"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useRouter } from "next/navigation"
import Header from "../../components/layout/Header"
import LeftMenu from "../../components/layout/LeftMenu"
import { NavItem } from "../../types"
import { Modal } from "../../components/ui/Modal"
import { ChatWindow } from "../../components/chat/ChatWindow"
import { ChatList } from "../../components/chat/ChatList"
import { createDirectChat } from "../../lib/api/chat"
import { logApiError } from "../../lib/logger"
import { MessageSquare } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, isLoading, verifyUser } = useAuthStore()
  const { fetchTeams, teams, selectedTeam } = useTeamStore()
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false)
  const router = useRouter()

  // Initialize Socket
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      import("../../lib/socket").then(({ initializeSocket, disconnectSocket }) => {
        initializeSocket(user.id)
      })
    }

    return () => {
      import("../../lib/socket").then(({ disconnectSocket }) => {
        disconnectSocket()
      })
    }
  }, [user])

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const handleChatClick = async () => {
    if (user?.role === "ATHLETE") {
      const team = selectedTeam || teams[0]
      if (team && team.ownerId) {
        try {
          const chat = await createDirectChat(team.ownerId)
          setActiveChatId(chat.id)
          setIsChatOpen(true)
        } catch (error) {
          logApiError("/api/chats/direct", error, { targetUserId: team.ownerId })
        }
      }
    } else {
      setActiveChatId(null)
      setIsChatOpen(true)
    }
  }

  const navItems = React.useMemo<NavItem[]>(() => {
    if (!user) return []

    const items: NavItem[] = [
      {
        label: "Главная",
        href: "/dashboard",
        icon: <Image src="/home_icon.png" alt="Home" width={32} height={32} />,
        tooltip: "Главная",
      },
      {
        label: "Команды",
        href: "/dashboard/teams",
        icon: <Image src="/teams_icon.png" alt="Teams" width={32} height={32} />,
        tooltip: "Команды",
      },
      {
        label: "Лидерборд",
        href: "/dashboard/leaderboard",
        icon: <Image src="/leaderboard.png" alt="Leaderboard" width={32} height={32} />,
        tooltip: "Лидерборд",
      },
    ]

    if (
      user.role === "TRAINER" ||
      user.role === "ORGANIZATION_ADMIN" ||
      user.role === "SUPER_ADMIN"
    ) {
      items.push({
        label: "Управление",
        href: "/dashboard/organization",
        icon: <Image src="/menegment.png" alt="Management" width={32} height={32} />,
        tooltip: "Управление",
      })
    }

    if (
      user.role === "TRAINER" ||
      user.role === "ORGANIZATION_ADMIN" ||
      user.role === "SUPER_ADMIN"
    ) {
      items.push({
        label: "Атлеты",
        href: "/dashboard/athletes",
        icon: <Image src="/athlet_icon.png" alt="Athletes" width={32} height={32} />,
        tooltip: "Атлеты",
      })

      if (user.role === "TRAINER" || user.role === "SUPER_ADMIN") {
        items.push({
          label: "Занятия",
          href: "/dashboard/activities",
          icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
          tooltip: "Занятия",
        })
      }
    }

    if (user.role === "SUPER_ADMIN") {
      items.push({
        label: "Админ",
        href: "/admin",
        // No icon for now, or use a generic one
        icon: <Image src="/admin-panel.png" alt="Admin" width={32} height={32} />,
        tooltip: "Админ",
      })
    }

    items.push({
      label: "Таймер",
      href: "/timer",
      icon: <Image src="/stopwatch.png" alt="Timer" width={32} height={32} />,
      tooltip: "Таймер",
    })

    items.push(
      {
        label: "Календарь",
        href: "/calendar",
        icon: <Image src="/calendar_icon.png" alt="Calendar" width={32} height={32} />,
        tooltip: "Календарь",
      },
      {
        label: "Чат",
        href: "#",
        onClick: handleChatClick,
        icon: <MessageSquare className="w-8 h-8 text-white" />,
        tooltip: "Чат",
      },
      {
        label: "Выйти",
        href: "#",
        onClick: () => {
          logout()
        },
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        ),
        tooltip: "Выйти",
      },
    )

    return items
  }, [user, logout])

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user) {
      fetchTeams()
      verifyUser()
    }
  }, [user, isAuthenticated, router, isLoading, fetchTeams, verifyUser])

  if (!isAuthenticated || !user) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        onRightMenuClick={() => {}}
        onLeftMenuClick={() => setIsLeftMenuOpen(true)}
        navItems={navItems}
      />

      <LeftMenu
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
        showAuth={false}
        toggleAuth={() => {}}
        events={[]}
        onShowEventDetails={() => {}}
        navItems={navItems}
      />

      <main className="flex-grow container mx-auto p-2 sm:p-4 lg:px-8 lg:py-8">
        {children}
      </main>
      <Modal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title={activeChatId ? "Чат" : "Ваши чаты"}
        size="lg">
        {activeChatId ? (
          <div className="flex flex-col h-full">
            {/* Back button for trainers who can see list */}
            {user?.role !== "ATHLETE" && (
              <button
                onClick={() => setActiveChatId(null)}
                className="self-start mb-2 text-sm text-blue-600 hover:underline flex items-center">
                ← Назад к списку
              </button>
            )}
            <ChatWindow
              chatId={activeChatId}
              className="!h-[500px] !border-none !shadow-none !bg-gray-50"
            />
          </div>
        ) : (
          <ChatList onSelectChat={setActiveChatId} />
        )}
      </Modal>
    </div>
  )
}
