"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TimerLayout } from "../../components/timer/TimerLayout"
import { TimerSetup } from "../../components/timer/TimerSetup"
import { TimerDisplay } from "../../components/timer/TimerDisplay"
import { useWODTimer, TimerConfig, TimerMode, RoundRecord } from "../../hooks/useWODTimer"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { apiClient } from "../../lib/api/apiClient"

// Wrapper for Suspense boundary required by useSearchParams
export default function TimerPage() {
  return (
    <Suspense
      fallback={
        <TimerLayout>
          <div>Loading...</div>
        </TimerLayout>
      }>
      <TimerPageContent />
    </Suspense>
  )
}

import { NavItem } from "../../types"
import Image from "next/image"

function TimerPageContent() {
  const [config, setConfig] = useState<TimerConfig | null>(null)
  const [selectedMode, setSelectedMode] = useState<TimerMode | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const modeParam = searchParams.get("mode")
    if (modeParam && !config) {
      const initialConfig: TimerConfig = {
        mode: modeParam as TimerMode,
        rounds: Number(searchParams.get("rounds")) || 1,
        timeCap: Number(searchParams.get("timeCap")) || undefined,
        duration: Number(searchParams.get("duration")) || undefined,
        intervalWork: Number(searchParams.get("intervalWork")) || undefined,
        intervalRest: Number(searchParams.get("intervalRest")) || undefined,
      }
      setConfig(initialConfig)

      const eId = searchParams.get("eventId")
      if (eId) setEventId(eId)
    }
  }, [searchParams, config])

  // We need user info to save result
  // But useWODTimer doesn't provide user.
  // We need to fetch it from store?
  // TimerPageContent is child of TimerPage which is client component.
  // We can use useAuthStore here.

  // Wait, I need to import useAuthStore first.

  const { user, logout } = useAuthStore()

  // Navigation Items (Same as dashboard/calendar)
  const navItems = React.useMemo<NavItem[]>(() => {
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
        label: "Управление",
        href: "/dashboard/organization",
        icon: <Image src="/menegment.png" alt="Management" width={32} height={32} />,
        tooltip: "Управление",
      })

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
  }, [user, logout])

  const handleSaveResult = async (
    resultVal: string,
    comment?: string,
    value?: number,
  ) => {
    if (!eventId || !user) return

    try {
      await apiClient.post(`/api/events/${eventId}/results`, {
        time: resultVal,
        notes: comment || undefined,
        value: value,
        userId: user.id,
        username: user.name,
      })
      router.push("/calendar")
    } catch {
      alert("Ошибка при сохранении результата")
    }
  }

  return (
    <TimerLayout navItems={navItems}>
      {!config ? (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center mb-8 gap-4">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">
                WOD Таймер
              </h1>
              {selectedMode && (
                <p className="mt-4 text-2xl font-bold text-gray-700 dark:text-gray-300 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-2 duration-300">
                  {selectedMode.replace("_", " ")}
                </p>
              )}
            </div>
          </div>
          <TimerSetup onStart={setConfig} onModeSelect={setSelectedMode} />
        </div>
      ) : (
        <ActiveTimer
          config={config}
          onBack={() => {
            setConfig(null)
            setEventId(null)
            router.replace("/timer") // clear params
          }}
          onSaveResult={eventId ? handleSaveResult : undefined}
        />
      )}
    </TimerLayout>
  )
}

// Separate component to ensure hook is initialized with fresh config when mounted
const ActiveTimer: React.FC<{
  config: TimerConfig
  onBack: () => void
  onSaveResult?: (val: string, comment?: string, value?: number) => void
}> = ({ config, onBack, onSaveResult }) => {
  const { state, start, pause, reset, skipWarmup, addRound } = useWODTimer(config)

  React.useEffect(() => {
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = () => {
    reset()
    onBack()
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const formatResult = () => {
    if (config.mode === "AMRAP") {
      const completed = state.roundTimes.length
      return `AMRAP: ${completed} раунд(а) за ${formatTime((config.duration || 0) * 1000)}`
    }
    if (config.mode === "FOR_TIME") {
      const completed = state.roundTimes.length
      const timeStr = formatTime(state.elapsedTime)
      return completed > 0
        ? `FOR TIME: ${timeStr} — ${completed} раунд(а)`
        : `FOR TIME: ${timeStr}`
    }
    return "Done"
  }

  // Числовое значение для сортировки в лидерборде
  const getResultValue = (): number | undefined => {
    if (config.mode === "AMRAP") {
      return state.roundTimes.length // кол-во завершённых раундов
    }
    if (config.mode === "FOR_TIME") {
      return Math.ceil(state.elapsedTime / 1000) // секунды (меньше = лучше)
    }
    return undefined
  }

  const formatComment = () => {
    if (state.roundTimes.length === 0) return ""
    return state.roundTimes
      .map((rec: RoundRecord, idx: number) => {
        const prevMs = idx === 0 ? 0 : state.roundTimes[idx - 1].elapsedMs
        const roundDuration = rec.elapsedMs - prevMs
        const totalStr = formatTime(rec.elapsedMs)
        const lapStr = formatTime(roundDuration)
        return `Раунд ${rec.round}: ${lapStr} (общее ${totalStr})`
      })
      .join("\n")
  }

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={handleReset}
        className="mb-6 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
        ← Назад к настройкам
      </button>

      <TimerDisplay
        state={state}
        config={config}
        onPause={pause}
        onResume={start}
        onReset={handleReset}
        onSkipWarmup={skipWarmup}
        onAddRound={addRound}
        onAddResult={
          onSaveResult
            ? () => onSaveResult(formatResult(), formatComment(), getResultValue())
            : undefined
        }
      />

      <div className="mt-8 text-center text-gray-600 dark:text-gray-400 font-mono text-sm">
        Режим: {config.mode} • Раунды: {config.rounds || 1} • Время:{" "}
        {Math.floor((config.intervalWork || config.duration || config.timeCap || 0) / 60)}{" "}
        мин
      </div>
    </div>
  )
}
