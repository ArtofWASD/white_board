import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/Switch"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Trophy,
  Timer,
  PlayCircle,
  ClipboardEdit,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Workout } from "./WorkoutCard"
import { useRouter } from "next/navigation" // Import useRouter
import { AddResultModal } from "./AddResultModal" // Import AddResultModal
import { EditWorkoutModal } from "./EditWorkoutModal"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { eventsApi } from "@/lib/api/events"

interface WorkoutDetailProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
  onDelete?: () => void
}

export function WorkoutDetail({
  workout,
  isOpen,
  onClose,
  onDelete,
}: WorkoutDetailProps) {
  const [isRx, setIsRx] = useState(true)
  const [isAddResultOpen, setIsAddResultOpen] = useState(false) // State for result modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // State for edit modal
  const router = useRouter()
  const { user } = useAuthStore() // Added for delete ownership check
  const [userResult, setUserResult] = useState<any>(null)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [isLoadingResult, setIsLoadingResult] = useState(false)

  // Fetch result when modal opens
  useEffect(() => {
    if (isOpen && workout && user) {
      const fetchResult = async () => {
        setIsLoadingResult(true)
        try {
          const results = await eventsApi.getResults(workout.id)
          const myResult = results.find((r) => r.userId === user.id)
          setUserResult(myResult || null)
        } catch (error) {
          console.error("Failed to fetch results:", error)
        } finally {
          setIsLoadingResult(false)
        }
      }
      fetchResult()
    }
  }, [isOpen, workout, user])

  if (!workout) return null

  const handleDeleteWorkout = async () => {
    if (
      !confirm("Вы уверены, что хотите удалить эту тренировку? Это действие необратимо.")
    )
      return

    try {
      await eventsApi.deleteEvent(workout.id, user!.id)
      onClose()
      onDelete?.()
    } catch (error) {
      console.error("Failed to delete workout:", error)
      alert("Не удалось удалить тренировку.")
    }
  }

  // Handler for Start Timer
  const handleStartTimer = () => {
    if (!workout) return

    const params = new URLSearchParams()

    // Map workout type to timer mode
    // Workout types: "AMRAP" | "EMOM" | "FOR_TIME" | "WEIGHTLIFTING"
    // Timer modes: 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA' | 'INTERVALS'

    if (workout.type === "FOR_TIME") {
      params.set("mode", "FOR_TIME")
      if (workout.timeCap) {
        // Assume timeCap format is something like "20:00" or just minutes "20"?
        // Looking at Workout interface, timeCap is string.
        // Let's try to parse it. If it contains ':', split.
        const parts = workout.timeCap.split(":")
        let totalSeconds = 0
        if (parts.length === 2) {
          totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
        } else {
          totalSeconds = parseInt(workout.timeCap) * 60
        }
        if (!isNaN(totalSeconds)) {
          params.set("timeCap", totalSeconds.toString())
        }
      }
      if (workout.rounds) {
        params.set("rounds", workout.rounds)
      }
    } else if (workout.type === "AMRAP") {
      params.set("mode", "AMRAP")
      if (workout.timeCap) {
        // AMRAP usually has a fixed duration, often stored in timeCap field or description?
        // Workout interface has timeCap. Let's assume it's duration for AMRAP.
        const parts = workout.timeCap.split(":")
        let durationSeconds = 0
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || "0")
        } else {
          durationSeconds = parseInt(workout.timeCap) * 60
        }
        if (!isNaN(durationSeconds)) params.set("duration", durationSeconds.toString())
      }
      if (workout.rounds) {
        params.set("rounds", workout.rounds)
      }
    } else if (workout.type === "EMOM") {
      params.set("mode", "EMOM")
      params.set("intervalWork", "60")

      // Check if rounds are specified directly
      if (workout.rounds) {
        params.set("rounds", workout.rounds)
      } else if (workout.timeCap) {
        // If not, try to derive rounds from timeCap (assumes 1 min per round)
        const parts = workout.timeCap.split(":")
        let rounds = 0
        if (parts.length === 2) {
          rounds = parseInt(parts[0])
        } else {
          rounds = parseInt(workout.timeCap)
        }
        if (!isNaN(rounds) && rounds > 0) {
          params.set("rounds", rounds.toString())
        }
      }
    } else if (workout.type === "CARDIO") {
      if (workout.timeCap) {
        const parts = workout.timeCap.split(":")
        let durationSeconds = 0
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || "0")
        } else {
          durationSeconds = parseInt(workout.timeCap) * 60
        }

        console.log("CARDIO TIMER DEBUG:", {
          originalTimeCap: workout.timeCap,
          parts,
          durationSeconds,
          finalQueryParam: durationSeconds.toString(),
        })

        if (!isNaN(durationSeconds) && durationSeconds > 0) {
          params.set("mode", "AMRAP") // Use AMRAP (countdown) mode for Cardio if time specified
          params.set("duration", durationSeconds.toString())
        } else {
          params.set("mode", "FOR_TIME") // Fallback to counting up
        }
      } else {
        params.set("mode", "FOR_TIME") // Fallback to counting up
      }
    } else {
      // Default to basic timer or intervals
      params.set("mode", "FOR_TIME")
    }

    // Pass eventId to allow saving result from timer page
    params.set("eventId", workout.id)

    router.push(`/timer?${params.toString()}`)
    onClose() // Close modal after navigating
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[600px] gap-0 p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="h-4 w-4" />
              <span>Тренировка дня</span>
            </div>
            <DialogTitle className="text-2xl">
              {workout.title}
              {workout.teamName && (
                <span className="text-muted-foreground text-lg font-normal ml-2">
                  для {workout.teamName}
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span
                className={cn(
                  "px-3 py-1 rounded text-sm sm:text-base font-bold ring-1 ring-inset",
                  workout.type === "AMRAP"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20"
                    : workout.type === "EMOM"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20"
                      : workout.type === "CARDIO"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20",
                )}>
                {workout.type === "FOR_TIME"
                  ? "На время"
                  : workout.type === "WEIGHTLIFTING"
                    ? "Тяжелая атлетика"
                    : workout.type === "CARDIO"
                      ? "Кардио"
                      : workout.type}
              </span>
              {workout.timeCap && (
                <span className="text-sm sm:text-base text-muted-foreground flex items-center gap-1">
                  <Timer className="h-4 w-4" /> {workout.timeCap}
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="p-6 pt-2 flex-1 overflow-y-auto">
            <div className="flex items-center justify-end mb-4">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="rx-mode"
                  className={cn(
                    "text-xs font-bold cursor-pointer",
                    !isRx && "text-muted-foreground",
                  )}>
                  SCALED
                </Label>
                <Switch checked={isRx} onChange={(v) => setIsRx(v)} />
                <Label
                  htmlFor="rx-mode"
                  className={cn(
                    "text-xs font-bold cursor-pointer",
                    isRx && "text-primary",
                  )}>
                  RX
                </Label>
              </div>
            </div>

            <div className="space-y-6">
              {workout.description && workout.description.trim() !== "" && (
                <div className="bg-muted/30 dark:bg-gray-800/50 p-4 rounded-lg border border-border/50 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-white">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Описание
                  </h3>
                  <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed dark:text-gray-300">
                    {workout.description}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  Упражнения
                </h3>
                <ul className="grid gap-2">
                  {workout.exercises && workout.exercises.length > 0
                    ? workout.exercises.map((exercise, dx) => {
                        const details = []
                        if (exercise.measurement === "time") {
                          const val = isRx ? exercise.rxTime : exercise.scTime
                          if (val && val !== "0") details.push(`${val} мин.`)
                        } else if (exercise.measurement === "distance") {
                          const val = isRx ? exercise.rxDistance : exercise.scDistance
                          if (val && val !== "0") details.push(`${val} м.`)
                          const w = isRx ? exercise.weight : exercise.scWeight
                          if (w && w !== "0") details.push(`${w} кг.`)
                        } else if (exercise.measurement === "calories") {
                          const val = isRx ? exercise.rxCalories : exercise.scCalories
                          if (val && val !== "0") details.push(`${val} кал.`)
                        } else {
                          // weight (default)
                          const w = isRx ? exercise.weight : exercise.scWeight
                          const r = isRx ? exercise.repetitions : exercise.scReps
                          if (w && w !== "0") details.push(`${w} кг.`)
                          if (r && r !== "0") details.push(`${r} пов.`)
                        }

                        return (
                          <li
                            key={dx}
                            className="flex items-start gap-2 hover:bg-muted/50 p-1 -mx-1 rounded transition-colors">
                            <span className="text-base font-bold text-primary shrink-0 min-w-[24px]">
                              {dx + 1}.
                            </span>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 flex-1">
                              <span className="text-base font-medium leading-tight">
                                {exercise.name}
                              </span>
                              {details.length > 0 && (
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {details.join(" \\ ")}
                                </span>
                              )}
                            </div>
                          </li>
                        )
                      })
                    : workout.movements.map((movement, dx) => (
                        <li
                          key={dx}
                          className="flex items-start gap-2 hover:bg-muted/50 p-1 -mx-1 rounded transition-colors">
                          <span className="text-base font-bold text-primary shrink-0 min-w-[24px]">
                            {dx + 1}.
                          </span>
                          <span className="text-base font-medium flex-1 leading-tight">
                            {movement}
                          </span>
                        </li>
                      ))}
                </ul>
              </div>

              {/* Athlete Result section */}
              {!isLoadingResult && userResult && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/10 border border-primary/20 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <History className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Ваш результат
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">
                            {userResult.time || userResult.value}
                          </span>
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-bold ring-1 ring-inset",
                              userResult.scaling === "RX"
                                ? "bg-primary/10 text-primary ring-primary/20"
                                : "bg-muted text-muted-foreground ring-border",
                            )}>
                            {userResult.scaling}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accordion for Round Details */}
                  {(workout.type === "AMRAP" || workout.type === "FOR_TIME") &&
                    userResult.notes &&
                    (Array.isArray(userResult.notes)
                      ? userResult.notes.length > 0 &&
                        userResult.notes.some((n: string) => n.trim() !== "")
                      : typeof userResult.notes === "string" &&
                        userResult.notes.trim() !== "") && (
                      <div className="border border-border/50 rounded-lg overflow-hidden transition-all duration-200">
                        <button
                          onClick={() => setIsNotesOpen(!isNotesOpen)}
                          className="w-full flex items-center justify-between p-3 text-sm font-semibold hover:bg-muted/30 transition-colors">
                          <span className="flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            Детализация по раундам
                          </span>
                          {isNotesOpen ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <div
                          className={cn(
                            "transition-all duration-300 ease-in-out overflow-hidden",
                            isNotesOpen
                              ? "max-h-[500px] opacity-100"
                              : "max-h-0 opacity-0",
                          )}>
                          <div className="p-4 pt-0 text-sm font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-border/30 bg-muted/10">
                            {Array.isArray(userResult.notes)
                              ? userResult.notes.join("\n")
                              : userResult.notes}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-muted/20 flex flex-col gap-3 mt-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="min-h-[48px] h-12 flex-1 gap-2 whitespace-nowrap border-black text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 bg-transparent transition-colors"
                onClick={handleStartTimer}>
                <PlayCircle className="h-5 w-5" />
                Запустить таймер
              </Button>
              <Button
                variant="outline"
                className="min-h-[48px] h-12 flex-1 gap-2 whitespace-nowrap border-black text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 bg-transparent transition-colors"
                onClick={() => setIsAddResultOpen(true)}>
                <ClipboardEdit className="h-5 w-5" />
                Записать результат
              </Button>
            </div>
            {workout.userId === user?.id && (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  variant="outline"
                  className="min-h-[48px] h-12 flex-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-blue-900 border-blue-500 border bg-transparent transition-colors"
                  onClick={() => setIsEditModalOpen(true)}>
                  Изменить
                </Button>
                <Button
                  variant="outline"
                  className="min-h-[48px] h-12 flex-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-red-900 border-red-500 border bg-transparent transition-colors"
                  onClick={handleDeleteWorkout}>
                  Удалить занятие
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Render AddResultModal */}
      <AddResultModal
        workout={workout}
        isOpen={isAddResultOpen}
        onClose={() => setIsAddResultOpen(false)}
        onSuccess={() => {
          setIsAddResultOpen(false)
          // Refetch results locally instead of closing the whole detail view
          if (workout && user) {
            eventsApi.getResults(workout.id).then((results) => {
              const myResult = results.find((r) => r.userId === user.id)
              setUserResult(myResult || null)
            })
          }
          if (onDelete) onDelete() // Use this to notify parent for card update
        }}
      />

      {/* Render EditWorkoutModal */}
      <EditWorkoutModal
        workout={workout}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false)
          onClose()
          if (onDelete) onDelete() // We can reuse onDelete as onUpdate for now to trigger parent refresh
        }}
      />
    </>
  )
}
