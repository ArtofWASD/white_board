import React from "react"
import {
  TimerState,
  TimerPhase,
  TimerStatus,
  TimerConfig,
  RoundRecord,
} from "../../hooks/useWODTimer"

interface TimerDisplayProps {
  state: TimerState
  config: TimerConfig
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkipWarmup: () => void
  onAddRound: () => void
  onAddResult?: () => void
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

const getPhaseColor = (phase: TimerPhase, status: TimerStatus) => {
  if (status === "FINISHED") return "text-gray-400 dark:text-gray-500"
  switch (phase) {
    case "WARMUP":
      return "text-yellow-600 dark:text-yellow-400"
    case "WORK":
      return "text-green-600 dark:text-green-400"
    case "REST":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-gray-900 dark:text-white"
  }
}

const getPhaseLabel = (phase: TimerPhase, status: TimerStatus) => {
  if (status === "FINISHED") return "ГОТОВО"
  switch (phase) {
    case "WARMUP":
      return "РАЗМИНКА"
    case "WORK":
      return "РАБОТА"
    case "REST":
      return "ОТДЫХ"
    default:
      return ""
  }
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  state,
  config,
  onPause,
  onResume,
  onReset,
  onSkipWarmup,
  onAddRound,
  onAddResult,
}) => {
  const { timeLeft, phase, status, currentRound, totalRounds, roundTimes } = state

  const showRoundButton =
    (config.mode === "AMRAP" || config.mode === "FOR_TIME") &&
    status === "RUNNING" &&
    phase === "WORK"

  // "Завершить" button visibility:
  // - mode is FOR_TIME
  // - status is PAUSED
  // - OR reached required rounds
  const showFinishButton =
    config.mode === "FOR_TIME" &&
    (status === "PAUSED" ||
      (config.rounds && config.rounds > 0 && currentRound >= config.rounds))

  const displayRounds =
    config.mode === "AMRAP" || config.mode === "FOR_TIME"
      ? `Раунд ${currentRound}${config.rounds ? ` / ${config.rounds}` : ""}`
      : `${currentRound} / ${totalRounds}`

  const hasRoundTimes = roundTimes && roundTimes.length > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 space-y-8">
      {/* Информация в заголовке */}
      <div className="flex w-full justify-between items-end px-4 text-gray-500 font-mono">
        <div className="flex flex-col items-start">
          <span className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Фаза
          </span>
          <span className={`text-2xl font-bold ${getPhaseColor(phase, status)}`}>
            {getPhaseLabel(phase, status)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Раунды
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">
            {displayRounds}
          </span>
        </div>
      </div>

      {/* Основной таймер */}
      <div
        className={`text-[7rem] sm:text-[9rem] md:text-[11rem] leading-none font-bold tabular-nums tracking-tighter transition-colors duration-300 ${getPhaseColor(phase, status)}`}>
        {formatTime(timeLeft)}
      </div>

      {/* Управление */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {status === "RUNNING" && (
          <button
            onClick={onPause}
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-yellow-200 dark:shadow-none">
            ПАУЗА
          </button>
        )}

        {showRoundButton && (
          <button
            onClick={onAddRound}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-200 dark:shadow-none">
            РАУНД +1
          </button>
        )}

        {showFinishButton && onAddResult && (
          <button
            onClick={onAddResult}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none">
            ЗАВЕРШИТЬ
          </button>
        )}

        {(status === "PAUSED" || status === "IDLE") && (
          <button
            onClick={onResume}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-200 dark:shadow-none">
            {status === "IDLE" ? "СТАРТ" : "ПРОДОЛЖИТЬ"}
          </button>
        )}

        {(status === "PAUSED" || status === "FINISHED") && (
          <button
            onClick={onReset}
            className="px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-xl text-xl font-bold transition-all active:scale-95">
            СБРОС
          </button>
        )}

        {phase === "WARMUP" && status === "RUNNING" && (
          <button
            onClick={onSkipWarmup}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none">
            ПРОПУСТИТЬ
          </button>
        )}

        {status === "FINISHED" && onAddResult && (
          <button
            onClick={onAddResult}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none">
            ЗАПИСАТЬ РЕЗУЛЬТАТ
          </button>
        )}
      </div>

      {/* Лог времён раундов */}
      {hasRoundTimes && (
        <div className="w-full mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <h3 className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 text-center">
            Время по раундам
          </h3>
          <div className="flex flex-col gap-2">
            {[...roundTimes].reverse().map((rec: RoundRecord) => {
              // Находим оригинальный индекс для вычисления длительности
              const originalIdx = roundTimes.findIndex((r) => r.round === rec.round)
              const currentSeconds = Math.ceil(rec.elapsedMs / 1000)
              const prevSeconds =
                originalIdx === 0
                  ? 0
                  : Math.ceil(roundTimes[originalIdx - 1].elapsedMs / 1000)
              const roundDurationSeconds = currentSeconds - prevSeconds

              return (
                <div
                  key={rec.round}
                  className="flex justify-between items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="font-bold text-purple-700 dark:text-purple-400">
                    Раунд {rec.round}
                  </span>
                  <div className="flex gap-4 text-sm text-gray-600 font-mono">
                    <span title="Время этого раунда">
                      ⏱ {formatTime(roundDurationSeconds * 1000)}
                    </span>
                    <span title="Общее время с начала" className="text-gray-400">
                      ({formatTime(rec.elapsedMs)} общее)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
