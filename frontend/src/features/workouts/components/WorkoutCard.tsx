import { Badge } from "@/components/ui/Badge"
import { getWorkoutColorClass } from "@/features/calendar/utils/workoutColors"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/HoverCard"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { cn } from "@/lib/utils"
// import { WorkoutDetail } from "./WorkoutDetail" // Circular dependency note: Will be implemented next
import { useState } from "react"
import { WorkoutQuickView } from "./WorkoutQuickView"
import { Exercise } from "@/types"

// Placeholder type until we have the real one
export interface Workout {
  id: string
  title: string
  type: "AMRAP" | "EMOM" | "FOR_TIME" | "WEIGHTLIFTING" | "CARDIO"
  result?: string
  scheduledTime?: string // e.g. "18:00"
  description: string
  movements: string[]
  exercises?: Exercise[]
  timeCap?: string
  rounds?: string
  userId?: string // Added for ownership check
  teamName?: string
  durationMinutes?: number // For Gantt view duration/width
  date?: string // Used for pre-filling edit modal
  isFavorite?: boolean
}

interface WorkoutCardProps {
  workout: Workout
  onOpenDetail: () => void
}

export function WorkoutCard({ workout, onOpenDetail }: WorkoutCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Use HoverCard for desktop, Popover for mobile (or just rely on the Detail modal for mobile interaction as per requirements)
  // Requirement: "WorkoutQuickView (Radix HoverCard/Popover): Appears only on Desktop when hovering over the card."
  // Requirement: "WorkoutCard... Logic: Acts as the trigger for both Popover (on desktop hover) and Dialog (on click)."

  // Since HoverCard is specifically for hover, we'll use that.

  return (
    <>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
            onClick={onOpenDetail}
            className={cn(
              "group relative flex w-full h-full min-h-[100px] cursor-pointer flex-col gap-1 rounded-xl border border-border p-3 shadow-sm transition-all hover:shadow-md active:scale-95",
              getWorkoutColorClass(workout.type),
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onOpenDetail()
              }
            }}>
            <div className="flex items-start justify-between w-full">
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[10px] font-bold rounded-full px-2 py-0.5",
                  workout.type === "AMRAP" && "border-primary text-primary",
                  workout.type === "EMOM" && "border-orange-500 text-orange-700",
                  workout.type === "WEIGHTLIFTING" && "border-purple-500 text-purple-700",
                  workout.type === "CARDIO" && "border-red-500 text-red-700",
                )}>
                {workout.type === "FOR_TIME"
                  ? "На время"
                  : workout.type === "WEIGHTLIFTING"
                    ? "Тяжелая атлетика"
                    : workout.type === "CARDIO"
                      ? "Кардио"
                      : workout.type}
              </Badge>

              <div className="flex flex-col items-end gap-0.5">
                {workout.scheduledTime && (
                  <span className="text-sm font-bold text-foreground bg-muted/30 px-1.5 rounded-md">
                    {workout.scheduledTime}
                  </span>
                )}
              </div>
            </div>

            {/* Title and Result pinned to bottom */}
            <div className="mt-auto flex w-full items-end justify-between gap-2 pt-2">
              <h3 className="font-bold leading-tight tracking-tight text-foreground group-hover:text-primary mb-0.5 line-clamp-2">
                {workout.title}
              </h3>
              {workout.result && (
                <span className="text-sm sm:text-base font-extrabold text-foreground shrink-0 ml-auto px-2 py-0.5 rounded-md bg-background/40 backdrop-blur-sm border border-border/50 shadow-sm">
                  {workout.result}
                </span>
              )}
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-80" side="right">
          <WorkoutQuickView workout={workout} />
        </HoverCardContent>
      </HoverCard>
    </>
  )
}
