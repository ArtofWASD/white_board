import React, { useState, useEffect, useRef } from "react"
import { ExerciseCard } from "./ExerciseCard"
import { ListFilters, ViewMode } from "../ui/ListFilters"
import Button from "../ui/Button"

interface ExerciseRecord {
  id: string
  weight: number
  date: string
}

interface Exercise {
  id: string
  name: string
  maxWeight: number
  records: ExerciseRecord[]
}

interface ExerciseTrackerProps {
  exercises: Exercise[]
  events?: any[]
  isLoading: boolean
  onCreateExercise: (name: string, initialWeight?: number) => Promise<void>
  onAddRecord: (exerciseId: string, weight: number) => Promise<void>
  onUpdateExercise: (id: string, name: string) => Promise<void>
  isExpanded?: boolean
  onToggle?: () => void
  hasMore?: boolean
  onLoadMore?: () => void
}

export const ExerciseTracker = React.memo(function ExerciseTracker({
  exercises,
  events,
  isLoading,
  onCreateExercise,
  onAddRecord,
  onUpdateExercise,
  isExpanded = true,
  onToggle,
  hasMore = false,
  onLoadMore,
}: ExerciseTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState("")
  const [initialWeight, setInitialWeight] = useState("")

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExerciseName.trim()) return

    await onCreateExercise(
      newExerciseName,
      initialWeight ? parseFloat(initialWeight) : undefined,
    )

    setNewExerciseName("")
    setInitialWeight("")
    setIsCreating(false)
  }

  // Merge exercises from DB and Calendar Events
  const allExercisesMap = new Map<string, Exercise>()

  // 1. Add DB exercises (deep copy to avoid mutating props directly if we add records)
  exercises.forEach((ex) => {
    allExercisesMap.set(ex.name.toLowerCase().trim(), {
      ...ex,
      records: [...(ex.records || [])]
    })
  })

  // 2. Add Calendar Events exercises
  if (events && Array.isArray(events)) {
    events.forEach((event) => {
      // Look for strength events
      if (
        event.scheme === "WEIGHTLIFTING" ||
        event.exerciseType === "Weightlifting" ||
        (event.exercises && event.exercises.length > 0)
      ) {
        const eventDate = event.eventDate || event.date || new Date().toISOString()
        
        // Sometimes weight is strictly in the results
        let resultWeight = 0
        if (event.results && Array.isArray(event.results) && event.results.length > 0) {
           event.results.forEach((r: any) => {
             const weight = parseFloat(r.value || r.time || "0")
             if (!isNaN(weight) && weight > resultWeight) {
               resultWeight = weight
             }
           })
        }

        if (event.exercises && Array.isArray(event.exercises)) {
          event.exercises.forEach((ex: any) => {
             const exName = ex.name
             if (!exName) return
             
             const parsedWeight = parseFloat(ex.weight)
             let exWeight = !isNaN(parsedWeight) ? parsedWeight : 0
             
             // The actual lifted weight is max of planned and result
             const actualWeight = Math.max(exWeight, resultWeight)

             const key = exName.toLowerCase().trim()
             if (allExercisesMap.has(key)) {
                // Update existing exercise
                const existing = allExercisesMap.get(key)!
                if (actualWeight > existing.maxWeight) {
                   existing.maxWeight = actualWeight
                }
                
                if (actualWeight > 0) {
                   // Add to history if not exact duplicate
                   const isDuplicate = existing.records.some(
                     (r) => r.date.startsWith(eventDate.split("T")[0]) && r.weight === actualWeight
                   )
                   if (!isDuplicate) {
                     existing.records.push({
                        id: `event-${event.id}-${exName}`,
                        weight: actualWeight,
                        date: eventDate
                     })
                     existing.records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                   }
                }
             } else {
                // Create new exercise entry from calendar
                const newEx: Exercise = {
                   id: `calendar-${exName}`,
                   name: exName,
                   maxWeight: actualWeight,
                   records: actualWeight > 0 ? [{
                     id: `event-${event.id}-${exName}`,
                     weight: actualWeight,
                     date: eventDate
                   }] : []
                }
                allExercisesMap.set(key, newEx)
             }
          })
        }
      }
    })
  }

  const combinedExercises = Array.from(allExercisesMap.values())
  // Sort by name or maxWeight if desired. Let's sort alphabetically for now.
  combinedExercises.sort((a, b) => a.name.localeCompare(b.name))

  const filteredExercises = combinedExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(target)
    return () => observer.unobserve(target)
  }, [hasMore, onLoadMore])

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col transition-all duration-300 ${!isExpanded ? "overflow-hidden justify-center px-4" : "p-3 sm:p-6"}`}>
      <div className={`flex justify-between items-center ${!isExpanded ? "" : "mb-6"}`}>
        <h2
          className={`font-bold text-gray-800 dark:text-white transition-all ${!isExpanded ? "text-lg" : "text-2xl"}`}>
          Прогресс упражнений
        </h2>

        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button
              onClick={() => setIsCreating(!isCreating)}
              onPointerDown={(e) => e.stopPropagation()}>
              {isCreating ? "Отмена" : "Добавить"}
            </Button>
          )}
          {/* Кнопка сворачивания - видна только на мобильных/планшетах */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title={!isExpanded ? "Развернуть" : "Свернуть"}
            onPointerDown={(e) => e.stopPropagation()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform transition-transform duration-200 ${!isExpanded ? "rotate-180" : ""}`}>
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {isCreating && (
            <form
              onSubmit={handleCreateExercise}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="mb-4 bg-white dark:bg-gray-700 p-3 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Название упражнения (например, Жим лежа)"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400"
                  autoFocus
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Вес (кг)"
                  value={initialWeight}
                  onChange={(e) => setInitialWeight(e.target.value)}
                  className="w-full sm:w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400"
                />
                <Button
                  type="submit"
                  disabled={!newExerciseName.trim()}
                  className="w-full sm:w-auto">
                  Сохранить
                </Button>
              </div>
            </form>
          )}

          <ListFilters
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Фильтр упражнений..."
          />

          <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-300">
                  Упражнения не найдены. Начните с добавления нового или создайте тренировку в календаре!
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "list"
                    ? "space-y-4"
                    : "grid grid-cols-1 md:grid-cols-2 gap-6"
                }>
                {filteredExercises.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    onAddRecord={onAddRecord}
                    onUpdateExercise={onUpdateExercise}
                  />
                ))}
                {hasMore && (
                  <div
                    ref={observerTarget}
                    className="h-10 flex justify-center items-center col-span-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
})
