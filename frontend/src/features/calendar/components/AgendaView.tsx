import { CalendarDay } from "../hooks/useCalendar"
import { Workout, WorkoutCard } from "@/features/workouts/components/WorkoutCard"
import { cn } from "@/lib/utils"
import { isSameDay, format } from "date-fns"
import { useEffect, useRef } from "react"

interface AgendaViewProps {
  days: CalendarDay[]
  workouts: Record<string, Workout[]>
  onOpenDetail: (workout: Workout) => void
  formatDayName: (date: Date) => string
  formatDayNumber: (date: Date) => string
}

export function AgendaView({
  days,
  workouts,
  onOpenDetail,
  formatDayName,
  formatDayNumber,
}: AgendaViewProps) {
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [])

  return (
    <div className="flex flex-col gap-1 pb-10">
      {days
        .filter((d) => d.isCurrentMonth)
        .map((day) => {
          const dateKey = format(day.date, "yyyy-MM-dd")
          const dayWorkouts = workouts[dateKey] || []

          return (
            <div
              key={day.date.toISOString()}
              ref={day.isToday ? todayRef : null}
              className={cn(
                "flex flex-col sm:flex-row gap-1 p-2 rounded-xl transition-colors",
                day.isToday ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30",
              )}>
              {/* Date Column */}
              <div className="flex sm:flex-col items-center sm:items-start gap-1 sm:w-20 shrink-0">
                <span className="text-2xl font-bold text-foreground">
                  {formatDayNumber(day.date)}
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {formatDayName(day.date)}
                </span>
                {day.isToday && (
                  <span className="ml-auto sm:ml-0 text-[10px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                    СЕГОДНЯ
                  </span>
                )}
              </div>

              {/* Workouts Column */}
              <div className="flex-1 flex flex-col gap-2">
                {dayWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {dayWorkouts.map((workout) => (
                      <WorkoutCard
                        key={workout.id}
                        workout={workout}
                        onOpenDetail={() => onOpenDetail(workout)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center">
                    <span className="text-sm text-muted-foreground italic">
                      День отдыха
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
