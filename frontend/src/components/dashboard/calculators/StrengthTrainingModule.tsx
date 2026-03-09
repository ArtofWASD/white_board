import React, { useState, useEffect } from "react"
import Button from "../../ui/Button"
import { useAuthStore } from "@/lib/store/useAuthStore"

interface Exercise {
  id: string
  name: string
  maxWeight: number
}

interface StrengthResult {
  id: string
  date: string
  week: number
  weight: number
  reps: number
}

interface StrengthTrainingModuleProps {
  exercises: Exercise[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddToCalendar: (
    title: string,
    description: string,
    scheme?: string,
    exercises?: any[],
  ) => void
  handleInputPointerDown: (e: React.PointerEvent) => void
  handleInputKeyDown: (e: React.KeyboardEvent) => void
}

export function StrengthTrainingModule({
  exercises,
  onAddToCalendar,
  handleInputPointerDown,
  handleInputKeyDown,
}: StrengthTrainingModuleProps) {
  const { user } = useAuthStore()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("")
  const [oneRepMax, setOneRepMax] = useState<number>(0)
  const [trainingMax, setTrainingMax] = useState<number>(0)
  const [history, setHistory] = useState<StrengthResult[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Состояние логирования
  const [loggingWeek, setLoggingWeek] = useState<number | null>(null)
  const [logWeight, setLogWeight] = useState<number>(0)
  const [logReps, setLogReps] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (selectedExerciseId) {
      const exercise = exercises.find((ex) => ex.id === selectedExerciseId)
      if (exercise) {
        setOneRepMax(exercise.maxWeight)
      }
      fetchHistory()
    } else {
      setHistory([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExerciseId, exercises])

  // Округление до ближайших 2.5 кг (минимальный шаг блинов на штанге: 1.25×2)
  const roundToPlates = (weight: number) => Math.round(weight / 2.5) * 2.5

  useEffect(() => {
    // Тренировочный Максимум обычно составляет 90% от 1ПМ, округлённый до 2.5 кг
    setTrainingMax(roundToPlates(oneRepMax * 0.9))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneRepMax])

  const fetchHistory = async () => {
    if (!user?.id || !selectedExerciseId) return
    setLoadingHistory(true)
    try {
      const res = await fetch(
        `/api/strength-results/${user.id}/${selectedExerciseId}`,
      )
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
    } finally {
      setLoadingHistory(false)
    }
  }

  const calculateWeight = (percentage: number) => {
    return roundToPlates(trainingMax * percentage)
  }

  const startLogging = (week: number, weight: number) => {
    setLoggingWeek(week)
    setLogWeight(weight)
    setLogReps(0)
  }

  const saveResult = async () => {
    if (!user?.id || !selectedExerciseId || loggingWeek === null) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/strength-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          exerciseId: selectedExerciseId,
          week: loggingWeek,
          weight: logWeight,
          reps: logReps,
          date: new Date(),
        }),
      })

      if (res.ok) {
        await fetchHistory()
        setLoggingWeek(null)
        setLogReps(0)
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col relative w-full">
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Упражнение
          </label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            onPointerDown={handleInputPointerDown}
            onKeyDown={handleInputKeyDown}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Выберите упражнение</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-white mb-1 whitespace-nowrap">
              1RM (Максимум)
            </label>
            <input
              type="number"
              value={oneRepMax || ""}
              onChange={(e) => setOneRepMax(Number(e.target.value))}
              onPointerDown={handleInputPointerDown}
              onKeyDown={handleInputKeyDown}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="кг"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-white mb-1 whitespace-nowrap">
              Тренировочный Вес (90%)
            </label>
            <input
              type="number"
              value={trainingMax || ""}
              onChange={(e) => setTrainingMax(Number(e.target.value))}
              onPointerDown={handleInputPointerDown}
              onKeyDown={handleInputKeyDown}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="кг"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto mb-4">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-1 py-3 w-8 text-center border-r border-gray-200 dark:border-gray-600">
                Нед
              </th>
              <th className="px-1 py-3 w-[35%] text-center border-r border-gray-200 dark:border-gray-600">
                Разминка
              </th>
              <th className="px-1 py-3 w-[35%] text-center border-r border-gray-200 dark:border-gray-600">
                Рабочие сеты
              </th>
              <th className="px-1 py-3 text-center w-[20%]">Действие</th>
            </tr>
          </thead>
          <tbody>
            {/* Неделя 1 */}
            <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 align-top">
              <td className="px-1 py-6 font-medium text-gray-900 dark:text-white text-center border-r border-gray-100 dark:border-gray-700">
                1
              </td>
              <td className="px-1 py-6 text-gray-500 dark:text-gray-300 break-words text-xs sm:text-sm border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <div>40% × 5 ({calculateWeight(0.4)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.5)}кг)</div>
                  <div>60% × 3 ({calculateWeight(0.6)}кг)</div>
                </div>
              </td>
              <td className="px-1 py-6 break-words text-xs sm:text-sm text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <div>65% × 5 ({calculateWeight(0.65)}кг)</div>
                  <div>75% × 5 ({calculateWeight(0.75)}кг)</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    85% × 5+ ({calculateWeight(0.85)}кг)
                  </div>
                </div>
              </td>
              <td className="px-1 py-6 text-right dark:bg-gray-800">
                {loggingWeek === 1 ? (
                  <div
                    className="flex flex-col items-end gap-2"
                    onPointerDown={handleInputPointerDown}
                    onKeyDown={handleInputKeyDown}>
                    <input
                      type="number"
                      className="w-full min-w-[3rem] px-1 py-1 border dark:border-gray-600 rounded text-right text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400"
                      placeholder="Reps"
                      value={logReps || ""}
                      onChange={(e) => setLogReps(Number(e.target.value))}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLoggingWeek(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 p-1">
                        Отм
                      </button>
                      <Button
                        size="sm"
                        onClick={saveResult}
                        disabled={isSubmitting}
                        className="px-2 py-1 h-8 text-xs">
                        OK
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <button
                      onClick={() => {
                        const exName =
                          exercises.find((e) => e.id === selectedExerciseId)?.name ||
                          "5/3/1"
                        const now = Date.now()
                        onAddToCalendar(`${exName} - Неделя 1`, "", "WEIGHTLIFTING", [
                          {
                            id: `ex-${now}-1`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.4)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.4)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-2`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.5)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.5)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-3`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.6)),
                            repetitions: "3",
                            rxWeight: String(calculateWeight(0.6)),
                            rxReps: "3",
                          },
                          {
                            id: `ex-${now}-4`,
                            name: `${exName} (Рабочий)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.65)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.65)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-5`,
                            name: `${exName} (Рабочий)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.75)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.75)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-6`,
                            name: `${exName} (Рабочий: Рекорд)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.85)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.85)),
                            rxReps: "5",
                          },
                        ])
                      }}
                      className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Добавить в календарь"
                      onPointerDown={handleInputPointerDown}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* Неделя 2 */}
            <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 align-top">
              <td className="px-1 py-6 font-medium text-gray-900 dark:text-white text-center border-r border-gray-100 dark:border-gray-700">
                2
              </td>
              <td className="px-1 py-6 text-gray-500 dark:text-gray-300 break-words text-xs sm:text-sm border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <div>45% × 5 ({calculateWeight(0.45)}кг)</div>
                  <div>55% × 5 ({calculateWeight(0.55)}кг)</div>
                  <div>65% × 3 ({calculateWeight(0.65)}кг)</div>
                </div>
              </td>
              <td className="px-1 py-6 break-words text-xs sm:text-sm text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <div>70% × 3 ({calculateWeight(0.7)}кг)</div>
                  <div>80% × 3 ({calculateWeight(0.8)}кг)</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    90% × 3+ ({calculateWeight(0.9)}кг)
                  </div>
                </div>
              </td>
              <td className="px-1 py-6 text-right dark:bg-gray-800">
                {loggingWeek === 2 ? (
                  <div
                    className="flex flex-col items-end gap-2"
                    onPointerDown={handleInputPointerDown}
                    onKeyDown={handleInputKeyDown}>
                    <input
                      type="number"
                      className="w-full min-w-[3rem] px-1 py-1 border rounded text-right text-sm bg-white text-gray-900"
                      placeholder="Reps"
                      value={logReps || ""}
                      onChange={(e) => setLogReps(Number(e.target.value))}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLoggingWeek(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 p-1"
                        onPointerDown={handleInputPointerDown}>
                        Отм
                      </button>
                      <Button
                        size="sm"
                        onClick={saveResult}
                        disabled={isSubmitting}
                        onPointerDown={handleInputPointerDown}
                        className="px-2 py-1 h-8 text-xs">
                        OK
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <button
                      onClick={() => {
                        const exName =
                          exercises.find((e) => e.id === selectedExerciseId)?.name ||
                          "5/3/1"
                        const now = Date.now()
                        onAddToCalendar(`${exName} - Неделя 2`, "", "WEIGHTLIFTING", [
                          {
                            id: `ex-${now}-1`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.45)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.45)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-2`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.55)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.55)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-3`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.65)),
                            repetitions: "3",
                            rxWeight: String(calculateWeight(0.65)),
                            rxReps: "3",
                          },
                          {
                            id: `ex-${now}-4`,
                            name: `${exName} (Рабочий)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.7)),
                            repetitions: "3",
                            rxWeight: String(calculateWeight(0.7)),
                            rxReps: "3",
                          },
                          {
                            id: `ex-${now}-5`,
                            name: `${exName} (Рабочий)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.8)),
                            repetitions: "3",
                            rxWeight: String(calculateWeight(0.8)),
                            rxReps: "3",
                          },
                          {
                            id: `ex-${now}-6`,
                            name: `${exName} (Рабочий: Рекорд)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.9)),
                            repetitions: "3",
                            rxWeight: String(calculateWeight(0.9)),
                            rxReps: "3",
                          },
                        ])
                      }}
                      className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Добавить в calendar"
                      onPointerDown={handleInputPointerDown}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* Неделя 3 */}
            <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 align-top">
              <td className="px-1 py-6 font-medium text-gray-900 dark:text-white text-center border-r border-gray-100 dark:border-gray-700">
                3
              </td>
              <td className="px-1 py-6 text-gray-500 dark:text-gray-300 break-words text-xs sm:text-sm border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <div>50% × 5 ({calculateWeight(0.5)}кг)</div>
                  <div>60% × 5 ({calculateWeight(0.6)}кг)</div>
                  <div>70% × 3 ({calculateWeight(0.7)}кг)</div>
                </div>
              </td>
              <td className="px-1 py-6 break-words text-xs sm:text-sm text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <div>75% × 5 ({calculateWeight(0.75)}кг)</div>
                  <div>85% × 3 ({calculateWeight(0.85)}кг)</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    95% × 1+ ({calculateWeight(0.95)}кг)
                  </div>
                </div>
              </td>
              <td className="px-1 py-6 text-right dark:bg-gray-800">
                {loggingWeek === 3 ? (
                  <div
                    className="flex flex-col items-end gap-2"
                    onPointerDown={handleInputPointerDown}
                    onKeyDown={handleInputKeyDown}>
                    <input
                      type="number"
                      className="w-full min-w-[3rem] px-1 py-1 border rounded text-right text-sm bg-white text-gray-900"
                      placeholder="Reps"
                      value={logReps || ""}
                      onChange={(e) => setLogReps(Number(e.target.value))}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLoggingWeek(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 p-1"
                        onPointerDown={handleInputPointerDown}>
                        Отм
                      </button>
                      <Button
                        size="sm"
                        onClick={saveResult}
                        disabled={isSubmitting}
                        onPointerDown={handleInputPointerDown}
                        className="px-2 py-1 h-8 text-xs">
                        OK
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <button
                      onClick={() => {
                        const exName =
                          exercises.find((e) => e.id === selectedExerciseId)?.name ||
                          "5/3/1"
                        const now = Date.now()
                        onAddToCalendar(`${exName} - Неделя 3`, "", "WEIGHTLIFTING", [
                          {
                            id: `ex-${now}-1`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.5)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.5)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-2`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.6)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.6)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-3`,
                            name: `${exName} (Разминка)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.7)),
                            repetitions: "3",
                            rxWeight: String(calculateWeight(0.7)),
                            rxReps: "3",
                          },
                          {
                            id: `ex-${now}-4`,
                            name: `${exName} (Рабочий)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.75)),
                            repetitions: "5",
                            rxWeight: String(calculateWeight(0.75)),
                            rxReps: "5",
                          },
                          {
                            id: `ex-${now}-5`,
                            name: `${exName} (Рабочий)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.85)),
                            repetitions: "3",
                            rxWeight: String(calculateWeight(0.85)),
                            rxReps: "3",
                          },
                          {
                            id: `ex-${now}-6`,
                            name: `${exName} (Рабочий: Рекорд)`,
                            measurement: "weight",
                            weight: String(calculateWeight(0.95)),
                            repetitions: "1",
                            rxWeight: String(calculateWeight(0.95)),
                            rxReps: "1",
                          },
                        ])
                      }}
                      className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Добавить в календарь"
                      onPointerDown={handleInputPointerDown}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </td>
            </tr>

            {/* Неделя 4 (Разгрузка) */}
            <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 align-top">
              <td className="px-1 py-6 font-medium text-gray-900 dark:text-white text-center border-r border-gray-100 dark:border-gray-700">
                4
              </td>
              <td className="px-1 py-6 text-gray-500 dark:text-gray-300 break-words text-xs sm:text-sm border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <div>40% × 5 ({calculateWeight(0.4)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.5)}кг)</div>
                  <div>60% × 5 ({calculateWeight(0.6)}кг)</div>
                </div>
              </td>
              <td className="px-1 py-6 break-words text-xs sm:text-sm text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1 text-gray-500">
                  <div>40% × 5 ({calculateWeight(0.4)}кг)</div>
                  <div>50% × 5 ({calculateWeight(0.5)}кг)</div>
                  <div>60% × 5 ({calculateWeight(0.6)}кг)</div>
                </div>
              </td>
              <td className="px-1 py-6 text-right dark:bg-gray-800">
                <div className="flex justify-center items-center h-full">
                  <span className="text-xs text-gray-400">Deload</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setShowHistory(true)}
          onPointerDown={handleInputPointerDown}>
          История
        </Button>
      </div>

      {/* Модальное окно истории */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm p-4 flex flex-col rounded-lg animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">История</h3>
            <button
              onClick={() => setShowHistory(false)}
              onPointerDown={handleInputPointerDown}
              className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {loadingHistory ? (
              <div className="text-center py-4 text-gray-500">Загрузка...</div>
            ) : history.length > 0 ? (
              <div className="relative">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        Неделя {record.week}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Вес:{" "}
                        <span className="font-semibold text-gray-900">
                          {record.weight}кг
                        </span>
                      </span>
                      <span className="text-gray-600">
                        Повторения:{" "}
                        <span className="font-semibold text-gray-900">{record.reps}</span>
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      1RM:{" "}
                      {(record.weight * record.reps * 0.0333 + record.weight).toFixed(1)}
                      кг
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                {selectedExerciseId ? "Нет записей" : "Выберите упражнение"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
