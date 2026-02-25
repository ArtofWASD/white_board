import { Workout } from "@/features/workouts/components/WorkoutCard"
import { getWorkoutColorClass } from "../utils/workoutColors"
import { cn } from "@/lib/utils"
import { format, isSameDay } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarDay } from "../hooks/useCalendar"
import { useEffect, useRef, useState, useCallback } from "react"

const PIXELS_PER_HOUR = 150

interface GanttViewProps {
  currentDate: Date
  calendarDays: CalendarDay[]
  workouts: Record<string, Workout[]>
  onDateSelect: (date: Date) => void
  onWorkoutClick: (workout: Workout) => void
  formatDayNumber: (date: Date) => string
  onTimeSelect?: (time: string) => void
  onDurationChange?: (workout: Workout, minutes: number, date: Date) => void
}

export function GanttView({
  currentDate,
  calendarDays,
  workouts,
  onDateSelect,
  onWorkoutClick,
  formatDayNumber,
  onTimeSelect,
  onDurationChange,
}: GanttViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const currentDayWorkouts = workouts[format(currentDate, "yyyy-MM-dd")] || []

  // Per-workout duration overrides (for instant resize feedback)
  const [durationOverrides, setDurationOverrides] = useState<Record<string, number>>({})

  // Tracks the latest duration for the currently-resized workout
  const latestResizeDuration = useRef<number>(0)

  // Drag-resize state
  const resizingRef = useRef<{
    workoutId: string
    startX: number
    startWidth: number
  } | null>(null)

  // ── Auto-scroll to first event ──
  useEffect(() => {
    if (!scrollContainerRef.current || currentDayWorkouts.length === 0) return

    const sorted = [...currentDayWorkouts].sort((a, b) =>
      (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? ""),
    )
    const first = sorted[0]
    if (!first.scheduledTime) return

    const [h, m] = first.scheduledTime.split(":").map(Number)
    const eventLeft = (h + m / 60) * PIXELS_PER_HOUR
    const containerWidth = scrollContainerRef.current.clientWidth
    const scrollTo = Math.max(0, eventLeft - containerWidth / 2)

    scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
  }, [currentDate]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Workout position/width ──
  const getWorkoutStyle = (workout: Workout) => {
    if (!workout.scheduledTime) return { display: "none" }

    const [h, m] = workout.scheduledTime.split(":").map(Number)
    const startOffsetHours = h + m / 60
    const left = startOffsetHours * PIXELS_PER_HOUR

    const durationMinutes = durationOverrides[workout.id] ?? workout.durationMinutes ?? 60
    const width = (durationMinutes / 60) * PIXELS_PER_HOUR

    return {
      left: `${Math.max(0, left)}px`,
      width: `${Math.max(PIXELS_PER_HOUR / 4, width)}px`, // min 15 min width
      top: "10px",
    }
  }

  // ── Drag-resize handlers ──
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, workout: Workout) => {
      e.stopPropagation()
      e.preventDefault()

      const currentDuration =
        durationOverrides[workout.id] ?? workout.durationMinutes ?? 60
      const currentWidth = (currentDuration / 60) * PIXELS_PER_HOUR

      resizingRef.current = {
        workoutId: workout.id,
        startX: e.clientX,
        startWidth: currentWidth,
      }

      const onMouseMove = (ev: MouseEvent) => {
        if (!resizingRef.current) return
        const dx = ev.clientX - resizingRef.current.startX
        const newWidth = Math.max(
          PIXELS_PER_HOUR / 4,
          resizingRef.current.startWidth + dx,
        )
        const newMinutes = Math.round(((newWidth / PIXELS_PER_HOUR) * 60) / 15) * 15
        latestResizeDuration.current = newMinutes
        setDurationOverrides((prev) => ({
          ...prev,
          [resizingRef.current!.workoutId]: newMinutes,
        }))
      }

      const onMouseUp = () => {
        if (!resizingRef.current) return
        const id = resizingRef.current.workoutId
        onDurationChange?.(workout, latestResizeDuration.current, currentDate)
        resizingRef.current = null
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
      }

      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    },
    [durationOverrides, onDurationChange],
  )

  // ── Grid click ──
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onTimeSelect) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left + (scrollContainerRef.current?.scrollLeft || 0)
    const hour = Math.floor(x / PIXELS_PER_HOUR)
    const minutes = Math.floor(((x % PIXELS_PER_HOUR) / PIXELS_PER_HOUR) * 60)
    const rounded = Math.round(minutes / 15) * 15
    const timeString = `${hour.toString().padStart(2, "0")}:${(rounded < 60 ? rounded : 0).toString().padStart(2, "0")}`
    onTimeSelect(timeString)
  }

  // ── Mini calendar weeks ──
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 overflow-hidden">
      {/* Mini Calendar Sidebar */}
      <div className="w-full md:w-[260px] shrink-0 bg-background dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 flex flex-col gap-2 h-fit">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold capitalize">
            {format(currentDate, "LLLL yyyy", { locale: ru })}
          </span>
        </div>

        <div className="grid grid-cols-7 text-center mb-1">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <div key={d} className="text-[10px] text-muted-foreground font-medium">
              {d}
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
                        : "hover:bg-muted dark:hover:bg-gray-700 font-medium text-foreground",
                      !isSelected &&
                        hasWorkouts &&
                        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold",
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
      <div className="flex-1 flex flex-col bg-background dark:bg-gray-900 border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm h-full max-h-[600px] md:max-h-full">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-muted/10 dark:bg-gray-800/50">
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
            <div className="flex border-b dark:border-gray-700 sticky top-0 bg-background dark:bg-gray-900 z-10 pointer-events-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="w-[150px] shrink-0 p-2 text-xs text-muted-foreground border-r dark:border-gray-700 font-medium">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Grid columns */}
            <div
              className="absolute inset-0 top-[33px] flex cursor-pointer"
              onClick={handleGridClick}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="w-[150px] shrink-0 border-r border-dashed border-border/40 dark:border-gray-700/40 h-full hover:bg-muted/10 dark:hover:bg-gray-800/20 transition-colors"
                />
              ))}
            </div>

            {/* Workout blocks */}
            <div className="relative h-full p-2 py-4 space-y-2 mt-4 pointer-events-none">
              {currentDayWorkouts.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground italic pointer-events-none">
                  Нет тренировок на этот день (кликните чтобы добавить)
                </div>
              ) : (
                currentDayWorkouts.map((workout, index) => {
                  const style = getWorkoutStyle(workout)
                  const top = index * 100 + 10

                  return (
                    <div
                      key={workout.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onWorkoutClick(workout)
                      }}
                      className={cn(
                        "absolute h-[80px] rounded-lg p-3 cursor-pointer transition-shadow group overflow-visible pointer-events-auto shadow-sm border dark:border-gray-700 select-none",
                        "hover:shadow-md hover:z-20",
                        getWorkoutColorClass(workout.type),
                      )}
                      style={{ ...style, top: `${top}px` }}>
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
                          {/* Duration label */}
                          <div className="text-xs opacity-60 mt-1">
                            {durationOverrides[workout.id] ??
                              workout.durationMinutes ??
                              60}{" "}
                            мин
                          </div>
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute -top-12 left-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="bg-white dark:bg-gray-800 text-zinc-950 dark:text-white px-3 py-2 rounded-md shadow-md border dark:border-gray-700 text-xs flex flex-col gap-0.5">
                          <span className="font-semibold">{workout.title}</span>
                          <span className="text-muted-foreground">
                            {workout.scheduledTime} • {workout.type}
                          </span>
                        </div>
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white border-b-0 absolute left-4 -bottom-1.5 drop-shadow-sm" />
                      </div>

                      {/* ── Resize handle ── */}
                      <div
                        className="absolute right-0 top-0 h-full w-3 flex items-center justify-center cursor-col-resize group/resize z-30"
                        onMouseDown={(e) => handleResizeMouseDown(e, workout)}
                        onClick={(e) => e.stopPropagation()}>
                        {/* Visual indicator */}
                        <div className="w-1 h-8 rounded-full bg-current opacity-20 group-hover/resize:opacity-60 transition-opacity" />
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
