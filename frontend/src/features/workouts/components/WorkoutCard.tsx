import { Badge } from "@/components/ui/badge"
import { getWorkoutColorClass } from "@/features/calendar/utils/workoutColors"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
// import { WorkoutDetail } from "./WorkoutDetail" // Circular dependency note: Will be implemented next
import { useState } from "react"
import { WorkoutQuickView } from "./WorkoutQuickView"

// Placeholder type until we have the real one
export interface Workout {
  id: string
  title: string
  type: "AMRAP" | "EMOM" | "FOR_TIME" | "WEIGHTLIFTING"
  result?: string
  scheduledTime?: string // e.g. "18:00"
  description: string
  movements: string[]
  timeCap?: string
  rounds?: string
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
              "group relative flex w-full cursor-pointer flex-col gap-1 rounded-xl border border-border p-2 shadow-sm transition-all hover:shadow-md active:scale-95",
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
                )}>
                {workout.type === "FOR_TIME"
                  ? "На время"
                  : workout.type === "WEIGHTLIFTING"
                    ? "Тяжелая атлетика"
                    : workout.type}
              </Badge>

              <div className="flex flex-col items-end gap-0.5">
                {workout.scheduledTime && (
                  <span className="text-sm font-bold text-foreground bg-muted/30 px-1.5 rounded-md">
                    {workout.scheduledTime}
                  </span>
                )}
                {workout.result && (
                  <span className="font-mono text-[10px] font-medium text-muted-foreground">
                    {workout.result}
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-bold leading-tight tracking-tight text-foreground group-hover:text-primary">
              {workout.title}
            </h3>

            {/* Visual indicator for interaction */}
            <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
              {/* Could add an icon here if needed */}
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
