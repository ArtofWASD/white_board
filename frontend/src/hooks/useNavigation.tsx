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

export function useNavigation() {
  const { user, logout } = useAuthStore()
  const { teams, selectedTeam } = useTeamStore()

  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleChatClick = async () => {
    // The logic has been moved to /chat page client component
    // We just return here as the Link href handles the navigation
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

    if (user.role === "TRAINER" || user.role === "SUPER_ADMIN") {
      items.push({
        label: "Занятия",
        href: "/dashboard/activities",
        icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
        tooltip: "Занятия",
      })
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
        href: "/chat",
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

  const chatModal = null

  return { navItems, chatModal }
}
