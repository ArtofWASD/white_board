import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TimerConfig, TimerMode } from "../../hooks/useWODTimer"
import { timerConfigSchema, TimerConfigFormData } from "../../lib/validators/timer"

interface TimerSetupProps {
  onStart: (config: TimerConfig) => void
  onModeSelect?: (mode: TimerMode | null) => void
}

const MODES: { id: TimerMode; label: string; desc: string }[] = [
  { id: "FOR_TIME", label: "For Time", desc: "Закончить задание как можно быстрее" },
  { id: "AMRAP", label: "AMRAP", desc: "Как можно больше раундов/повторений" },
  { id: "EMOM", label: "EMOM", desc: "Каждую минуту в начале минуты" },
  { id: "TABATA", label: "Tabata", desc: "Высокоинтенсивные интервалы" },
  { id: "INTERVALS", label: "Intervals", desc: "Настраиваемые интервалы" },
]

export const TimerSetup: React.FC<TimerSetupProps> = ({ onStart, onModeSelect }) => {
  const [selectedMode, setSelectedMode] = React.useState<TimerMode | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TimerConfigFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(timerConfigSchema) as any,
    defaultValues: {
      timeCapMinutes: 20,
      durationMinutes: 10,
      emomInterval: 60,
      emomRounds: 10,
      workBytes: 20,
      restBytes: 10,
      rounds: 8,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })

  // Set mode in form when user selects it
  useEffect(() => {
    if (onModeSelect) {
      onModeSelect(selectedMode)
    }
    if (selectedMode) {
      reset(undefined, { keepDefaultValues: true })
    }
  }, [selectedMode, reset, onModeSelect])

  const onSubmit = (data: TimerConfigFormData) => {
    if (!selectedMode) return

    const config: TimerConfig = { mode: selectedMode }

    switch (selectedMode) {
      case "FOR_TIME":
        config.timeCap = (data.timeCapMinutes || 0) * 60
        break
      case "AMRAP":
        config.duration = (data.durationMinutes || 0) * 60
        break
      case "EMOM":
        config.intervalWork = data.emomInterval
        config.rounds = data.emomRounds
        break
      case "TABATA":
        config.intervalWork = data.workBytes
        config.intervalRest = data.restBytes
        config.rounds = data.rounds
        break
      case "INTERVALS":
        config.intervalWork = data.workBytes
        config.intervalRest = data.restBytes
        config.rounds = data.rounds
        break
    }

    onStart(config)
  }

  if (!selectedMode) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 w-full max-w-5xl mx-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl shadow-md transition-all hover:scale-105 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 group">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {m.label}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center">{m.desc}</p>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mt-12">
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Настройка</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {selectedMode === "FOR_TIME" && (
          <div>
            <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2">
              Лимит времени (минуты)
            </label>
            <input
              type="number"
              {...register("timeCapMinutes")}
              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-2xl text-center transition-all"
            />
            {errors.timeCapMinutes && (
              <p className="text-red-500 text-sm mt-1">{errors.timeCapMinutes.message}</p>
            )}
          </div>
        )}

        {selectedMode === "AMRAP" && (
          <div>
            <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2">
              Длительность (минуты)
            </label>
            <input
              type="number"
              {...register("durationMinutes")}
              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-2xl text-center transition-all"
            />
            {errors.durationMinutes && (
              <p className="text-red-500 text-sm mt-1">
                {errors.durationMinutes.message}
              </p>
            )}
          </div>
        )}

        {selectedMode === "EMOM" && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2">
                Интервал (секунды)
              </label>
              <input
                type="number"
                {...register("emomInterval")}
                className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-2xl text-center transition-all"
              />
              {errors.emomInterval && (
                <p className="text-red-500 text-sm mt-1">{errors.emomInterval.message}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-2">Раунды</label>
              <input
                type="number"
                {...register("emomRounds")}
                className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-2xl text-center transition-all"
              />
              {errors.emomRounds && (
                <p className="text-red-500 text-sm mt-1">{errors.emomRounds.message}</p>
              )}
            </div>
          </div>
        )}

        {(selectedMode === "TABATA" || selectedMode === "INTERVALS") && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2">
                  Работа (сек)
                </label>
                <input
                  type="number"
                  {...register("workBytes")}
                  className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl border border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-blue-900 outline-none text-2xl text-center font-bold transition-all"
                />
                {errors.workBytes && (
                  <p className="text-red-500 text-sm mt-1">{errors.workBytes.message}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2">
                  Отдых (сек)
                </label>
                <input
                  type="number"
                  {...register("restBytes")}
                  className="w-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-blue-900 outline-none text-2xl text-center font-bold transition-all"
                />
                {errors.restBytes && (
                  <p className="text-red-500 text-sm mt-1">{errors.restBytes.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2">
                Раунды
              </label>
              <input
                type="number"
                {...register("rounds")}
                className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-2xl text-center transition-all"
              />
              {errors.rounds && (
                <p className="text-red-500 text-sm mt-1">{errors.rounds.message}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            type="submit"
            className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none order-1 sm:order-2">
            НАЧАТЬ ТАЙМЕР
          </button>

          <button
            onClick={() => setSelectedMode(null)}
            type="button"
            className="flex-1 py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xl transition-colors shadow-lg shadow-red-200 dark:shadow-none order-2 sm:order-1">
            СМЕНИТЬ РЕЖИМ
          </button>
        </div>
      </form>
    </div>
  )
}
