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

interface WorkoutDetailProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
}

export function WorkoutDetail({ workout, isOpen, onClose }: WorkoutDetailProps) {
  const [isRx, setIsRx] = useState(true)
  const [isAddResultOpen, setIsAddResultOpen] = useState(false) // State for result modal
  const router = useRouter()

  if (!workout) return null

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
        let totalMinutes = 0
        if (parts.length === 2) {
          totalMinutes = parseInt(parts[0]) + parseInt(parts[1]) / 60
        } else {
          totalMinutes = parseInt(workout.timeCap)
        }
        if (!isNaN(totalMinutes)) {
          params.set("timeCap", totalMinutes.toString())
        }
      }
    } else if (workout.type === "AMRAP") {
      params.set("mode", "AMRAP")
      if (workout.timeCap) {
        // AMRAP usually has a fixed duration, often stored in timeCap field or description?
        // Workout interface has timeCap. Let's assume it's duration for AMRAP.
        const parts = workout.timeCap.split(":")
        let duration = 0
        if (parts.length === 2) {
          duration = parseInt(parts[0]) // minutes
        } else {
          duration = parseInt(workout.timeCap)
        }
        if (!isNaN(duration)) params.set("duration", duration.toString())
      }
    } else if (workout.type === "EMOM") {
      params.set("mode", "EMOM")
      // EMOM logic customization needed if data available
      // Defaulting to standard 1 minute
      params.set("intervalWork", "60")
    } else if (workout.type === "CARDIO") {
      params.set("mode", "AMRAP") // Use AMRAP (countdown) mode for Cardio
      if (workout.timeCap) {
        const parts = workout.timeCap.split(":")
        let durationSeconds = 0
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || "0")
        } else {
          durationSeconds = parseInt(workout.timeCap) * 60
        }
        if (!isNaN(durationSeconds)) params.set("duration", durationSeconds.toString())
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
                  {workout.movements.map((movement, dx) => (
                    <li
                      key={dx}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {dx + 1}
                      </span>
                      <span className="text-sm font-medium">{movement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row gap-3 mt-auto">
            <Button
              variant="outline"
              className="flex-1 gap-2 whitespace-nowrap"
              size="lg"
              layout="horizontal"
              onClick={handleStartTimer} // Attach handler
            >
              <PlayCircle className="h-5 w-5" />
              Запустить таймер
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 whitespace-nowrap"
              size="lg"
              layout="horizontal"
              onClick={() => setIsAddResultOpen(true)} // Open result modal
            >
              <ClipboardEdit className="h-5 w-5" />
              Записать результат
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render AddResultModal */}
      <AddResultModal
        workout={workout}
        isOpen={isAddResultOpen}
        onClose={() => setIsAddResultOpen(false)}
        onSuccess={() => {
          // Optional: trigger refresh needed?
          // Maybe close detail modal too?
          setIsAddResultOpen(false)
          onClose()
        }}
      />
    </>
  )
}
