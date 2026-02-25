import { cn } from "@/lib/utils"
import { CalendarDay } from "../hooks/useCalendar"
import { Workout } from "@/features/workouts/components/WorkoutCard"
import { getWorkoutColorClass } from "../utils/workoutColors"
import { format } from "date-fns"

interface MonthViewProps {
  days: CalendarDay[]
  workouts: Record<string, Workout[]> // Keyed by date string YYYY-MM-DD
  onDayClick: (date: Date) => void
  onWorkoutClick: (workout: Workout) => void
  formatDayNumber: (date: Date) => string
  formatDayName: (date: Date) => string
}

export function MonthView({
  days,
  workouts,
  onDayClick,
  onWorkoutClick,
  formatDayNumber,
  formatDayName,
}: MonthViewProps) {
  // Get first 7 days to render headers
  const weekDays = days.slice(0, 7)

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden bg-background">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((day) => (
          <div
            key={day.date.toISOString()}
            className="py-2 text-center text-xs font-semibold text-muted-foreground capitalize">
            {formatDayName(day.date)}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-[1fr] flex-1 overflow-hidden">
        {days.map((day, idx) => {
          const dateKey = format(day.date, "yyyy-MM-dd")
          const dayWorkouts = workouts[dateKey] || []

          // Determine grid borders
          // Right border for all except last column
          // Bottom border for all rows
          const isLastCol = (idx + 1) % 7 === 0

          return (
            <div
              key={day.date.toISOString()}
              onClick={() => onDayClick(day.date)}
              className={cn(
                "relative flex flex-col p-2 transition-colors hover:bg-muted/20 cursor-pointer border-b overflow-hidden",
                !isLastCol && "border-r",
                !day.isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
                day.isToday && "bg-primary/10",
              )}>
              <div className="flex justify-between items-start flex-shrink-0">
                <span
                  className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    day.isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}>
                  {formatDayNumber(day.date)}
                </span>
              </div>

              {/* Workout Indicators - scrollable */}
              <div className="mt-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                {dayWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onWorkoutClick(workout)
                    }}
                    className={cn(
                      "text-xs truncate px-2 py-1 rounded-md font-semibold border border-transparent transition-colors shadow-sm flex-shrink-0",
                      getWorkoutColorClass(workout.type),
                    )}>
                    {workout.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
