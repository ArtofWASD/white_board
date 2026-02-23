import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/Switch"
import { cn } from "@/lib/utils"
import { Calendar, Trophy, Timer, PlayCircle, ClipboardEdit } from "lucide-react"
import { useState } from "react"
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

export function WorkoutDetail({ workout, isOpen, onClose, onDelete }: WorkoutDetailProps) {
  const [isRx, setIsRx] = useState(true)
  const [isAddResultOpen, setIsAddResultOpen] = useState(false) // State for result modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // State for edit modal
  const router = useRouter()
  const { user } = useAuthStore() // Added for delete ownership check

  if (!workout) return null

  const handleDeleteWorkout = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту тренировку? Это действие необратимо.")) return
    
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
          totalSeconds = (parseInt(parts[0]) * 60) + parseInt(parts[1])
        } else {
          totalSeconds = parseInt(workout.timeCap) * 60
        }
        if (!isNaN(totalSeconds)) {
          params.set("timeCap", totalSeconds.toString())
        }
      }
    } else if (workout.type === "AMRAP") {
      params.set("mode", "AMRAP")
      if (workout.timeCap) {
        // AMRAP usually has a fixed duration, often stored in timeCap field or description?
        // Workout interface has timeCap. Let's assume it's duration for AMRAP.
        const parts = workout.timeCap.split(":")
        let durationSeconds = 0
        if (parts.length === 2) {
          durationSeconds = (parseInt(parts[0]) * 60) + parseInt(parts[1] || "0")
        } else {
          durationSeconds = parseInt(workout.timeCap) * 60
        }
        if (!isNaN(durationSeconds)) params.set("duration", durationSeconds.toString())
      }
    } else if (workout.type === "EMOM") {
      params.set("mode", "EMOM")
      // EMOM logic customization needed if data available
      // Defaulting to standard 1 minute
      params.set("intervalWork", "60")
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
          finalQueryParam: durationSeconds.toString()
        });

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
        <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="h-4 w-4" />
              <span>Тренировка дня</span>
            </div>
            <DialogTitle className="text-2xl">{workout.title}</DialogTitle>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-bold ring-1 ring-inset",
                  workout.type === "AMRAP"
                    ? "bg-orange-500/10 text-orange-600 ring-orange-500/20"
                    : workout.type === "EMOM"
                      ? "bg-blue-500/10 text-blue-600 ring-blue-500/20"
                      : workout.type === "CARDIO"
                        ? "bg-red-500/10 text-red-600 ring-red-500/20"
                        : "bg-slate-500/10 text-slate-600 ring-slate-500/20",
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
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Timer className="h-3 w-3" /> {workout.timeCap}
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
                <Switch checked={isRx} onChange={setIsRx} />
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
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Описание
                </h3>
                <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {workout.description}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  Упражнения
                </h3>
                <ul className="grid gap-2">
                  {workout.exercises && workout.exercises.length > 0
                    ? workout.exercises.map((exercise, dx) => (
                        <li
                          key={dx}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {dx + 1}
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 overflow-hidden">
                            <span className="text-sm font-medium flex-1 truncate">{exercise.name}</span>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground shrink-0">
                              {exercise.weight && exercise.weight !== "0" && (
                                <span className="bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">Вес: {exercise.weight} кг</span>
                              )}
                              {exercise.repetitions && exercise.repetitions !== "0" && (
                                <span className="bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">Повторы: {exercise.repetitions}</span>
                              )}
                              {exercise.measurement === "calories" && exercise.rxCalories && exercise.rxCalories !== "0" && (
                                <span className="bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">Кал: {exercise.rxCalories}</span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))
                    : workout.movements.map((movement, dx) => (
                        <li
                          key={dx}
                          className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {dx + 1}
                          </span>
                          <span className="text-sm font-medium">{movement}</span>
                        </li>
                      ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-muted/20 flex flex-col gap-3 mt-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 whitespace-nowrap border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800 bg-transparent transition-colors"
                size="lg"
                layout="horizontal"
                onClick={handleStartTimer} // Attach handler
              >
                <PlayCircle className="h-5 w-5" />
                Запустить таймер
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 whitespace-nowrap border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:bg-black dark:hover:bg-gray-800 bg-transparent transition-colors"
                size="lg"
                layout="horizontal"
                onClick={() => setIsAddResultOpen(true)} // Open result modal
              >
                <ClipboardEdit className="h-5 w-5" />
                Записать результат
              </Button>
            </div>
            {workout.userId === user?.id && (
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <Button
                  variant="outline"
                  className="flex-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-black dark:hover:bg-gray-800 dark:border-blue-900 border-blue-500 border bg-transparent transition-colors"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Изменить
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:bg-black dark:hover:bg-gray-800 dark:border-red-900 border-red-500 border bg-transparent transition-colors"
                  onClick={handleDeleteWorkout}
                >
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
          onClose()
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

