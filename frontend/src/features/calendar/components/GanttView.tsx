import { Workout } from "@/features/workouts/components/WorkoutCard"
import { getWorkoutColorClass } from "../utils/workoutColors"
import { cn } from "@/lib/utils"
import { addHours, format, isSameDay, parse, set, startOfDay } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarDay } from "../hooks/useCalendar"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface GanttViewProps {
  currentDate: Date
  calendarDays: CalendarDay[]
  workouts: Record<string, Workout[]>
  onDateSelect: (date: Date) => void
  onWorkoutClick: (workout: Workout) => void
  formatDayNumber: (date: Date) => string
  onTimeSelect?: (time: string) => void
}

export function GanttView({
  currentDate,
  calendarDays,
  workouts,
  onDateSelect,
  onWorkoutClick,
  formatDayNumber,
  onTimeSelect,
}: GanttViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const currentDayWorkouts = workouts[format(currentDate, "yyyy-MM-dd")] || []

  // Helper to calculate position and width
  const getWorkoutStyle = (workout: Workout) => {
    if (!workout.scheduledTime) return { left: 0, width: 0, display: "none" }

    const [h, m] = workout.scheduledTime.split(":").map(Number)
    const startHour = 0
    const pixelsPerHour = 150 // Increased width

    // Calculate start position relative to 00:00
    const startOffsetHours = h - startHour + m / 60
    const left = startOffsetHours * pixelsPerHour

    // Default duration 1 hour if not parsed
    let durationHours = 1
    // Simplistic duration parsing, assumes "60 mins" or similar format in timeCap or just defaults
    // In a real app we'd parse this more robustly or have a dedicated duration field

    const width = durationHours * pixelsPerHour

    return {
      left: `${Math.max(0, left)}px`,
      width: `${width}px`,
      top: "10px", // spacing from top
    }
  }

  // Handle click on grid to create event
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onTimeSelect) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left + (scrollContainerRef.current?.scrollLeft || 0)

    const pixelsPerHour = 150 // Match above
    const hour = Math.floor(x / pixelsPerHour)
    const minutes = Math.floor(((x % pixelsPerHour) / pixelsPerHour) * 60)

    // Round to nearest 15 mins for cleaner UX
    const roundedMinutes = Math.round(minutes / 15) * 15
    const timeString = `${hour.toString().padStart(2, "0")}:${roundedMinutes < 60 ? roundedMinutes.toString().padStart(2, "0") : "00"}`

    onTimeSelect(timeString)
  }

  // Group days by weeks for the mini calendar
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 overflow-hidden">
      {/* Mini Calendar Sidebar */}
      <div className="w-full md:w-[260px] shrink-0 bg-background border rounded-xl p-4 flex flex-col gap-2 h-fit">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold capitalize">
            {format(currentDate, "LLLL yyyy", { locale: ru })}
          </span>
          {/* Navigation controls could be added here if we expose next/prev month logic locally or via props */}
        </div>

        <div className="grid grid-cols-7 text-center mb-1">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
            <div key={day} className="text-[10px] text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dIndex) => {
                const isSelected = isSameDay(day.date, currentDate)
                const hasWorkouts = workouts[format(day.date, "yyyy-MM-dd")]?.length > 0

                return (
                  <button
                    key={dIndex}
                    onClick={() => onDateSelect(day.date)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-full text-sm relative transition-all mx-auto w-8 h-8",
                      !day.isCurrentMonth && "text-muted-foreground/30",
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-md"
                        : "hover:bg-muted font-medium text-foreground",
                      !isSelected &&
                        hasWorkouts &&
                        "bg-orange-100 text-orange-700 font-bold", // Pastel orange for example
                    )}>
                    {formatDayNumber(day.date)}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Gantt / Timeline Area */}
      <div className="flex-1 flex flex-col bg-background border rounded-xl overflow-hidden shadow-sm h-full max-h-[600px] md:max-h-full">
        <div className="p-4 border-b flex justify-between items-center bg-muted/10">
          <div>
            <h3 className="font-bold text-lg">
              {format(currentDate, "d MMMM, EEEE", { locale: ru })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentDayWorkouts.length} тренир. запланировано
            </p>
          </div>
        </div>

        <div
          className="flex-1 overflow-x-auto overflow-y-auto relative no-scrollbar"
          ref={scrollContainerRef}>
          <div className="min-w-[3600px] h-full relative">
            {/* Time Header */}
            <div className="flex border-b sticky top-0 bg-background z-10 pointer-events-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="w-[150px] shrink-0 p-2 text-xs text-muted-foreground border-r font-medium">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Grid interactions and Lines */}
            <div
              className="absolute inset-0 top-[33px] flex cursor-pointer"
              onClick={handleGridClick}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="w-[150px] shrink-0 border-r border-dashed border-border/40 h-full hover:bg-muted/10 transition-colors"
                />
              ))}
            </div>

            {/* Workouts Rendering */}
            <div className="relative h-full p-2 py-4 space-y-2 mt-4 pointer-events-none">
              {currentDayWorkouts.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground italic pointer-events-none">
                  Нет тренировок на этот день (кликните чтобы добавить)
                </div>
              ) : (
                currentDayWorkouts.map((workout, index) => {
                  const style = getWorkoutStyle(workout)
                  // Stack items vertically to avoid overlap simplistic approach for now
                  const top = index * 100 + 10 // Increased height + gap

                  return (
                    <div
                      key={workout.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onWorkoutClick(workout)
                      }}
                      className={cn(
                        "absolute h-[80px] rounded-lg p-3 cursor-pointer transition-all group overflow-visible pointer-events-auto shadow-sm border",
                        "hover:scale-[1.02] hover:shadow-md hover:z-20",
                        // Type-based styling matching MonthView
                        getWorkoutColorClass(workout.type),
                      )}
                      style={{
                        ...style,
                        top: `${top}px`,
                      }}>
                      <div className="flex items-start justify-between h-full">
                        <div className="flex flex-col min-w-0">
                          <div className="font-bold text-sm truncate pr-2 mb-1">
                            {workout.title}
                          </div>
                          <div className="text-xs opacity-80 truncate flex items-center gap-1">
                            {workout.scheduledTime}
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            {workout.type}
                          </div>
                        </div>
                      </div>

                      {/* Tooltip with white background */}
                      <div className="absolute -top-12 left-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="bg-white text-zinc-950 px-3 py-2 rounded-md shadow-md border text-xs flex flex-col gap-0.5">
                          <span className="font-semibold">{workout.title}</span>
                          <span className="text-muted-foreground">
                            {workout.scheduledTime} • {workout.type}
                          </span>
                        </div>
                        {/* White arrow */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white border-b-0 absolute left-4 -bottom-1.5 drop-shadow-sm"></div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
