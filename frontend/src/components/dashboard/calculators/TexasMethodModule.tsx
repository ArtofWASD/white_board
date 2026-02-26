import React, { useState, useEffect } from "react"

interface Exercise {
  id: string
  name: string
  maxWeight: number
}

interface TexasMethodModuleProps {
  exercises: Exercise[]
  onAddToCalendar: (title: string, description: string, scheme?: string, exercises?: any[]) => void
  handleInputPointerDown: (e: React.PointerEvent) => void
  handleInputKeyDown: (e: React.KeyboardEvent) => void
}

export function TexasMethodModule({
  exercises,
  onAddToCalendar,
  handleInputPointerDown,
  handleInputKeyDown,
}: TexasMethodModuleProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("")
  const [fiveRepMax, setFiveRepMax] = useState<number>(0)
  const [dayThreeMode, setDayThreeMode] = useState<"1x5" | "1x3" | "1x1">("1x5")

  useEffect(() => {
    if (selectedExerciseId) {
      const exercise = exercises.find((ex) => ex.id === selectedExerciseId)
      if (exercise) {
        // Предполагаем, что maxWeight в БД - это 1ПМ. Для Техасского метода нужен 5ПМ.
        // Мы можем оценить 5ПМ из 1ПМ (примерно 85-87%) или позволить пользователю ввести его.
        // Будем использовать оценку 85% по умолчанию, но разрешим переопределение.
        setFiveRepMax(Math.round(exercise.maxWeight * 0.85))
      }
    }
  }, [selectedExerciseId, exercises])

  // Расчеты на 4 недели
  const weeks = [0, 1, 2, 3].map((weekIndex) => {
    const weekly5RM = fiveRepMax + weekIndex * 2.5 // Прогрессия +2.5 кг в неделю

    const day1Weight = Math.round(weekly5RM * 0.9)
    const day2Weight = Math.round(day1Weight * 0.8)

    const day3BaseWeight = weekly5RM + 2.5
    let day3Weight = day3BaseWeight

    if (dayThreeMode === "1x3") {
      day3Weight = day3BaseWeight + 2.5
    } else if (dayThreeMode === "1x1") {
      day3Weight = day3BaseWeight + 5
    }

    return {
      weekNum: weekIndex + 1,
      day1: `${day1Weight} кг (5x5)`,
      day2: `${day2Weight} кг (2x5)`,
      day3: `${day3Weight} кг (${dayThreeMode})`,
    }
  })

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Настройки
        </h3>
        <select
          value={dayThreeMode}
          onChange={(e) => setDayThreeMode(e.target.value as any)}
          onPointerDown={handleInputPointerDown}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none">
          <option value="1x5">Режим: Рекорд (1x5)</option>
          <option value="1x3">Режим: Тяжело (1x3)</option>
          <option value="1x1">Режим: Пик (1x1)</option>
        </select>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Текущий 5ПМ (Старт)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={fiveRepMax || ""}
              onChange={(e) => setFiveRepMax(Number(e.target.value))}
              onPointerDown={handleInputPointerDown}
              onKeyDown={handleInputKeyDown}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400"
              placeholder="кг"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              +2.5кг/нед
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Начальный 5ПМ для расчета цикла.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto mb-4">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-2 py-3 w-12 text-center">Нед</th>
              <th className="px-2 py-3 w-[30%]">Объем (Пн)</th>
              <th className="px-2 py-3 w-[30%]">Легкая (Ср)</th>
              <th className="px-2 py-3 w-[30%]">Интенс. (Пт)</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr
                key={week.weekNum}
                className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 align-middle">
                <td className="px-2 py-3 font-medium text-gray-900 dark:text-gray-100 text-center">
                  {week.weekNum}
                </td>
                <td className="px-2 py-3 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-start gap-2">
                    <span>{week.day1}</span>
                    <button
                      onClick={() => {
                        const exName = exercises.find((e) => e.id === selectedExerciseId)?.name || "Texas Method";
                        onAddToCalendar(
                          `${exName}: Неделя ${week.weekNum} День 1`,
                          `${exName}: ${week.day1}`,
                          "WEIGHTLIFTING",
                          [{
                            name: exName,
                            weight: week.day1.split(" ")[0], // Extract just the weight number
                            repetitions: "5x5"
                          }]
                        );
                      }}
                      className="text-gray-300 hover:text-gray-700 p-1"
                      title="Добавить в календарь"
                      onPointerDown={handleInputPointerDown}>
                      <svg
                        className="w-4 h-4"
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
                </td>
                <td className="px-2 py-3 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-start gap-2">
                    <span>{week.day2}</span>
                    <button
                      onClick={() => {
                        const exName = exercises.find((e) => e.id === selectedExerciseId)?.name || "Texas Method";
                        onAddToCalendar(
                          `${exName}: Неделя ${week.weekNum} День 2`,
                          `${exName}: ${week.day2}`,
                          "WEIGHTLIFTING",
                          [{
                            name: exName,
                            weight: week.day2.split(" ")[0],
                            repetitions: "2x5"
                          }]
                        );
                      }}
                      className="text-gray-300 hover:text-gray-700 p-1"
                      title="Добавить в календарь"
                      onPointerDown={handleInputPointerDown}>
                      <svg
                        className="w-4 h-4"
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
                </td>
                <td className="px-2 py-3 font-bold text-gray-900 dark:text-white">
                  <div className="flex items-center justify-start gap-2">
                    <span>{week.day3}</span>
                    <button
                      onClick={() => {
                        const exName = exercises.find((e) => e.id === selectedExerciseId)?.name || "Texas Method";
                        onAddToCalendar(
                          `${exName}: Неделя ${week.weekNum} День 3`,
                          `${exName}: ${week.day3}`,
                          "WEIGHTLIFTING",
                          [{
                            name: exName,
                            weight: week.day3.split(" ")[0],
                            repetitions: dayThreeMode
                          }]
                        );
                      }}
                      className="text-gray-300 hover:text-gray-700 p-1"
                      title="Добавить в календарь"
                      onPointerDown={handleInputPointerDown}>
                      <svg
                        className="w-4 h-4"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-auto bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
          Прогрессия Месяца
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Цикл рассчитан на 4 недели с линейным повышением весов. Цель: увеличивать
          рабочий вес на 2.5 кг каждую неделю в день рекордов.
        </p>
      </div>
    </div>
  )
}
