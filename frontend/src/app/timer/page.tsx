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

function TimerPageContent() {
  const [config, setConfig] = useState<TimerConfig | null>(null)
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

  const { user } = useAuthStore()

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
    <TimerLayout>
      {!config ? (
        <TimerSetup onStart={setConfig} />
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
