"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { MessageSquare } from "lucide-react"

import { useAuthStore } from "../lib/store/useAuthStore"
import { useTeamStore } from "../lib/store/useTeamStore"
import { NavItem } from "../types"
import { createDirectChat } from "../lib/api/chat"
import { logApiError } from "../lib/logger"
import { Modal } from "../components/ui/Modal"
import { ChatWindow } from "../components/chat/ChatWindow"
import { ChatList } from "../components/chat/ChatList"

export function useNavigation() {
  const { user, logout } = useAuthStore()
  const { teams, selectedTeam } = useTeamStore()

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

  const navItems = useMemo<NavItem[]>(() => {
    if (!user) return []

    const items: NavItem[] = [
      {
        label: "Личный кабинет",
        href: "/dashboard",
        icon: <Image src="/home_icon.png" alt="Home" width={32} height={32} />,
        tooltip: "Личный кабинет",
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
        label: "Активности",
        href:
          user.role === "TRAINER"
            ? "/dashboard/team-activities"
            : "/dashboard/organization",
        icon: <Image src="/menegment.png" alt="Activities" width={32} height={32} />,
        tooltip: "Активности",
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

    if (user.role === "ATHLETE") {
      items.push({
        label: "Активность команд",
        href: "/dashboard/team-activities",
        icon: <Image src="/menegment.png" alt="Team Activities" width={32} height={32} />,
        tooltip: "Активность команд",
      })
    }

    if (user.role === "SUPER_ADMIN") {
      items.push({
        label: "Админ",
        href: "/admin",
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
        onClick: async () => {
          await logout()
          window.location.href = "/"
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, logout, selectedTeam, teams])

  const chatModal = user ? (
    <Modal
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
      title={activeChatId ? "Чат" : "Ваши чаты"}
      size="lg"
      noPadding={!!activeChatId}>
      {activeChatId ? (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
          {user?.role !== "ATHLETE" && (
            <button
              onClick={() => setActiveChatId(null)}
              className="self-start m-4 mb-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              ← Назад к списку
            </button>
          )}
          <ChatWindow
            chatId={activeChatId}
            className="flex-1 !border-none !shadow-none !rounded-none"
          />
        </div>
      ) : (
        <ChatList onSelectChat={setActiveChatId} />
      )}
    </Modal>
  ) : null

  return { navItems, chatModal }
}
