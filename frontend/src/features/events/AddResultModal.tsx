import React, { useState } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"

import ErrorDisplay from "../../components/ui/ErrorDisplay"

interface AddResultModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { time: string; value: number; scaling: string; notes?: string }) => void
  eventName: string
  scheme: string // Получение схемы для определения типа ввода
}

const AddResultModal: React.FC<AddResultModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eventName,
  scheme,
}) => {
  const { user, isAuthenticated } = useAuthStore()

  // Общее состояние
  const [scaling, setScaling] = useState("RX")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Специфичное состояние для схемы
  const [time, setTime] = useState("") // FOR_TIME
  const [rounds, setRounds] = useState("") // AMRAP
  const [reps, setReps] = useState("") // AMRAP
  const [weight, setWeight] = useState("") // WEIGHTLIFTING, EMOM(иногда)
  const [customValue, setCustomValue] = useState("") // EMOM, Generic

  // Сброс формы при открытии модального окна
  React.useEffect(() => {
    if (isOpen) {
      setTime("")
      setRounds("")
      setReps("")
      setWeight("")
      setCustomValue("")
      setScaling("RX")
      setNotes("")
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setError("Вы должны быть авторизованы для добавления результата")
      return
    }
    setError(null)

    let resultTimeStr = ""
    let resultValue = 0

    if (scheme === "FOR_TIME") {
      if (!time.trim()) {
        setError("Введите время")
        return
      }
      resultTimeStr = time
      // Парсинг времени mm:ss в секунды для сортировки
      const parts = time.split(":")
      if (parts.length === 2) {
        resultValue = parseInt(parts[0]) * 60 + parseInt(parts[1])
      } else if (parts.length === 3) {
        resultValue =
          parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
      } else {
        // Попытка парсинга секунд или числа
        resultValue = parseFloat(time)
      }
    } else if (scheme === "AMRAP") {
      if (!rounds && !reps) {
        setError("Введите количество раундов и/или повторений")
        return
      }
      const r = parseInt(rounds) || 0
      const p = parseInt(reps) || 0
      resultTimeStr = `${r} rds + ${p} reps`
      // Расчет для сортировки: Раунды * 1000 + Повторы
      resultValue = r * 1000 + p
    } else if (scheme === "WEIGHTLIFTING") {
      if (!weight) {
        setError("Введите вес")
        return
      }
      resultTimeStr = `${weight} kg`
      resultValue = parseFloat(weight)
    } else if (scheme === "EMOM") {
      // EMOM может быть весом или повторами, обычно простое число
      if (!customValue) {
        setError("Введите результат")
        return
      }
      // Попытка угадать единицу измерения или просто сохранить значение
      resultTimeStr = customValue
      resultValue = parseFloat(customValue.replace(/[^0-9.]/g, ""))
    } else {
      // Обратная совместимость для неизвестных схем
      if (!customValue) {
        setError("Введите результат")
        return
      }
      resultTimeStr = customValue
      resultValue = parseFloat(customValue.replace(/[^0-9.]/g, ""))
    }

    if (isNaN(resultValue)) {
      resultValue = 0
    }

    const saveData = {
      time: resultTimeStr,
      value: resultValue,
      scaling,
      notes: scaling === "INDIVIDUAL" ? notes : undefined,
    }

    onSave(saveData)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 AddResultModal-overlay"
      onClick={(e) => e.stopPropagation()}>
      <div
        className="bg-white p-6 rounded-lg shadow-lg min-w-[300px] max-w-xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">
          Добавить результат для &quot;{eventName}&quot;
        </h3>

        <ErrorDisplay error={error} onClose={() => setError(null)} className="mb-4" />

        <form onSubmit={handleSubmit}>
          <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Атлет</div>
            <div className="font-medium">
              {user?.name} {user?.lastName}
            </div>
          </div>

          {/* ДИНАМИЧЕСКИЕ ПОЛЯ ВВОДА НА ОСНОВЕ СХЕМЫ */}

          {scheme === "FOR_TIME" && (
            <div className="mb-4">
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1">
                Время выполнения
              </label>
              <input
                type="text"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="mm:ss (например: 12:45)"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Формат: минуты:секунды (12:45) или часы:минуты:секунды (1:12:45)
              </p>
            </div>
          )}

          {scheme === "AMRAP" && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="rounds"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Полных раундов
                </label>
                <input
                  type="number"
                  id="rounds"
                  value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="reps"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Доп. повторений
                </label>
                <input
                  type="number"
                  id="reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {scheme === "WEIGHTLIFTING" && (
            <div className="mb-4">
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-1">
                Вес (кг)
              </label>
              <input
                type="number"
                step="0.5"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: 85.5"
                autoFocus
              />
            </div>
          )}

          {(scheme === "EMOM" ||
            (scheme !== "FOR_TIME" &&
              scheme !== "AMRAP" &&
              scheme !== "WEIGHTLIFTING")) && (
            <div className="mb-4">
              <label
                htmlFor="customValue"
                className="block text-sm font-medium text-gray-700 mb-1">
                Результат
              </label>
              <input
                type="text"
                id="customValue"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите результат"
                autoFocus
              />
            </div>
          )}

          {/* ВАРИАНТЫ МАСШТАБИРОВАНИЯ */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Вариант выполнения
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <label
                className={`
                    flex items-center gap-2 cursor-pointer px-3 py-2 rounded border transition-colors
                    ${scaling === "RX" ? "bg-blue-50 border-blue-200 ring-1 ring-blue-300" : "bg-white border-gray-200 hover:bg-gray-50"}
                 `}>
                <input
                  type="radio"
                  name="scaling"
                  value="RX"
                  checked={scaling === "RX"}
                  onChange={() => setScaling("RX")}
                  className="hidden"
                />
                <span
                  className={`font-semibold ${scaling === "RX" ? "text-blue-700" : "text-gray-600"}`}>
                  Rx
                </span>
              </label>

              <label
                className={`
                    flex items-center gap-2 cursor-pointer px-3 py-2 rounded border transition-colors
                    ${scaling === "SCALED" ? "bg-green-50 border-green-200 ring-1 ring-green-300" : "bg-white border-gray-200 hover:bg-gray-50"}
                 `}>
                <input
                  type="radio"
                  name="scaling"
                  value="SCALED"
                  checked={scaling === "SCALED"}
                  onChange={() => setScaling("SCALED")}
                  className="hidden"
                />
                <span
                  className={`font-semibold ${scaling === "SCALED" ? "text-green-700" : "text-gray-600"}`}>
                  Scaled
                </span>
              </label>

              <label
                className={`
                    flex items-center gap-2 cursor-pointer px-3 py-2 rounded border transition-colors
                    ${scaling === "INDIVIDUAL" ? "bg-yellow-50 border-yellow-200 ring-1 ring-yellow-300" : "bg-white border-gray-200 hover:bg-gray-50"}
                 `}>
                <input
                  type="radio"
                  name="scaling"
                  value="INDIVIDUAL"
                  checked={scaling === "INDIVIDUAL"}
                  onChange={() => setScaling("INDIVIDUAL")}
                  className="hidden"
                />
                <span
                  className={`font-semibold ${scaling === "INDIVIDUAL" ? "text-yellow-700" : "text-gray-600"}`}>
                  Individual
                </span>
              </label>
            </div>
          </div>

          {scaling === "INDIVIDUAL" && (
            <div className="mb-6 animate-fadeIn">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1">
                Какие изменения?
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Например: уменьшил вес на 10кг, заменил бег на греблю"
                rows={2}
              />
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none w-full sm:w-auto text-center">
              Отмена
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md focus:outline-none w-full sm:w-auto text-center font-medium ${
                isAuthenticated
                  ? "bg-blue-600 hover:bg-blue-700 shadow-sm"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isAuthenticated}>
              Сохранить результат
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddResultModal
