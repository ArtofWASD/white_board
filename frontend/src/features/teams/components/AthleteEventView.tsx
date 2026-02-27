import React, { useState, useEffect } from "react"
import { Event, EventResult, User } from "../../../types"
import { Loader } from "../../../components/ui/Loader"
import { eventsApi } from "../../../lib/api/events"

interface AthleteEventViewProps {
  event: Event
  user: User
  resultsData:
    | { results: EventResult[]; isLoading: boolean; isOpen: boolean }
    | undefined
}

const formatResultValue = (result: EventResult, scheme?: string) => {
  if (scheme === "FOR_TIME") {
    return result.time || "0:00"
  } else if (
    scheme === "AMRAP" ||
    scheme === "EMOM" ||
    scheme === "WEIGHTLIFTING"
  ) {
    const unit = scheme === "AMRAP" ? "reps" : "kg"
    return `${result.value || 0} ${unit}`
  }
  return result.time || (result.value ? `${result.value}` : "Выполнено")
}

export const AthleteEventView: React.FC<AthleteEventViewProps> = ({
  event,
  user,
  resultsData,
}) => {
  const [exercises, setExercises] = useState(event.exercises || [])
  const [loadingExercises, setLoadingExercises] = useState(!event.exercises)

  useEffect(() => {
    // If we already have exercises from the parent event object, use those.
    if (event.exercises && event.exercises.length > 0) {
      setExercises(event.exercises)
      setLoadingExercises(false)
      return
    }

    // Otherwise, fetch the full event details to get the exercises
    const fetchEventDetails = async () => {
      try {
        setLoadingExercises(true)
        // Adjust endpoint based on your API structure. Often GET /events/:id returns exercises
        const eventData = await eventsApi.getEvent(event.id)
        if (eventData && eventData.exercises) {
          setExercises(eventData.exercises)
        }
      } catch (error) {
        console.error("Failed to fetch event details for exercises:", error)
      } finally {
        setLoadingExercises(false)
      }
    }

    fetchEventDetails()
  }, [event.id, event.exercises])

  if (resultsData?.isLoading || loadingExercises) {
    return (
      <div className="flex justify-center py-6">
        <Loader />
      </div>
    )
  }

  // Find personal result
  const personalResult = resultsData?.results?.find(
    (r) => r.userId === user.id || r.username === user.name
  )

  const isCompleted = event.status === "COMPLETED" || personalResult

  return (
    <div className="mt-4 border-t dark:border-gray-700 pt-4 px-4 sm:px-5 pb-4">
      {/* Exercises List */}
      <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
        Упражнения:
      </h5>

      {exercises.length > 0 ? (
        <ul className="space-y-3 mb-6">
          {exercises.map((exercise, index) => (
            <li
              key={exercise.id || index}
              className="bg-gray-50/80 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {exercise.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                {(exercise.rxReps || exercise.repetitions) && (
                  <span>Повторы: {exercise.rxReps || exercise.repetitions}</span>
                )}
                {(exercise.rxWeight || exercise.weight) && (
                  <span>Вес: {(exercise.rxWeight || exercise.weight)} кг</span>
                )}
                {exercise.rxDistance && <span>Дистанция: {exercise.rxDistance}</span>}
                {exercise.rxCalories && <span>Калории: {exercise.rxCalories} kcal</span>}
                {exercise.rxTime && <span>Время: {exercise.rxTime}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 italic">
          Список упражнений не указан.
        </p>
      )}

      {/* Result Section (only show if completed or result exists) */}
      {isCompleted && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
          <h5 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wider">
            Ваш результат:
          </h5>
          {personalResult ? (
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  {formatResultValue(personalResult, event.scheme)}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    personalResult.scaling === "RX"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : personalResult.scaling === "SCALED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {personalResult.scaling || "RX"}
                </span>
              </div>
              {personalResult.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-0">
                  <span className="font-medium mr-1">Заметки:</span>
                  {personalResult.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Вы еще не внесли результат для этого комплекса. Перейдите в "Календарь", чтобы добавить.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
