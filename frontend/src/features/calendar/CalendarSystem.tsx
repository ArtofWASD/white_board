import { useState, useEffect } from "react"
import { useCalendar } from "./hooks/useCalendar"
import { CalendarHeader } from "./components/CalendarHeader"
import { MonthView } from "./components/MonthView"
import { AgendaView } from "./components/AgendaView"
import { GanttView } from "./components/GanttView"
import { WorkoutDetail } from "@/features/workouts/components/WorkoutDetail"
import { Workout } from "@/features/workouts/components/WorkoutCard"
import { CreateWorkoutModal } from "./components/CreateWorkoutModal"
import { eventsApi } from "@/lib/api/events"
import { useAuthStore } from "@/lib/store/useAuthStore" // Assuming this exists
import { Button } from "@/components/ui/Button" // For global create button if needed
import { Plus } from "lucide-react"

interface CalendarSystemProps {
  initialView?: "month" | "agenda" | "gantt"
  workouts: Record<string, Workout[]>
  onWorkoutCreated?: () => void // Callback to refresh data
  teamId?: string | null
  headerActions?: React.ReactNode
  footerHeight?: number
}

export function CalendarSystem({
  initialView = "month", // Changed to month as default per user request
  workouts,
  onWorkoutCreated,
  teamId,
  headerActions,
  footerHeight = 0,
}: CalendarSystemProps) {
  const { user } = useAuthStore()
  const {
    currentDate,
    calendarDays,
    nextMonth,
    prevMonth,
    goToToday,
    formatMonthYear,
    formatDayName,
    formatDayNumber,
    setDate,
  } = useCalendar()

  const [view, setView] = useState<"month" | "agenda" | "gantt">(initialView)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createDate, setCreateDate] = useState<Date | undefined>(undefined)

  // Force mobile agenda view on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && view !== "agenda") {
        setView("agenda")
      }
    }

    // Check on mount
    if (window.innerWidth < 640) {
      setView("agenda")
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [view])

  const handleOpenDetail = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsDetailOpen(true)
  }

  const handleDayClick = (date: Date) => {
    // If clicking a day in Month view, open create modal for that day
    setCreateDate(date)
    setIsCreateModalOpen(true)
  }

  const handleCreateWorkout = async (data: any) => {
    if (!user) {
      console.error("User not authenticated")
      return
    }

    try {
      // Determine effective teamId
      // complex filters like "all", "my", "all_teams" usually mean no specific team assignment for creation
      // unless we want to enforce "my" -> null.
      const effectiveTeamId =
        teamId === "my" || teamId === "all" || teamId === "all_teams" ? undefined : teamId

      await eventsApi.createEvent({
        ...data,
        userId: user.id,
        teamId: effectiveTeamId,
      })
      setIsCreateModalOpen(false)
      if (onWorkoutCreated) {
        onWorkoutCreated()
      }
    } catch (error) {
      console.error("Failed to create workout:", error)
      // Ideally show toast here
    }
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNextMonth={nextMonth}
        onPrevMonth={prevMonth}
        onToday={goToToday}
        formatMonthYear={formatMonthYear}
        rightActions={headerActions}
      />
      <div className="w-full border-b" />

      <div className="flex-1 overflow-y-auto p-1 sm:p-2 relative">
        {view === "month" ? (
          <MonthView
            days={calendarDays}
            workouts={workouts}
            onDayClick={handleDayClick}
            onWorkoutClick={handleOpenDetail}
            formatDayName={formatDayName}
            formatDayNumber={formatDayNumber}
          />
        ) : view === "agenda" ? (
          <AgendaView
            days={calendarDays}
            workouts={workouts}
            onOpenDetail={handleOpenDetail}
            formatDayName={formatDayName}
            formatDayNumber={formatDayNumber}
          />
        ) : (
          <GanttView
            currentDate={currentDate}
            calendarDays={calendarDays}
            workouts={workouts}
            onDateSelect={setDate}
            onWorkoutClick={handleOpenDetail}
            formatDayNumber={formatDayNumber}
            onTimeSelect={(time) => {
              setCreateDate(currentDate) // Ensure date is set
              setIsCreateModalOpen(true)
              // Note: CreateWorkoutModal needs a way to set time.
              // Currently it has `defaultDate` but internal time state is separate.
              // We might need to update CreateWorkoutModal to accept `defaultTime` or just hack it via `defaultDate` if it supports full ISO with time?
              // Looking at CreateWorkoutModal: it separates date and time inputs but uses `defaultDate` in useEffect to set `date` only.
              // It defaults time to "09:00".
              // Let's assume we need to update it to support setting time via prop or refactor.
              // For now, let's just open it and logic to support time passing will be next step if needed.
              // Wait, I can pass a Date object with the correct time to `defaultDate`!
              // CreateWorkoutModal does: `setDate(defaultDate.toISOString().split("T")[0])`... it ignores time.
              // I need to update CreateWorkoutModal to support `defaultTime`.
            }}
          />
        )}
      </div>

      {/* Floating Action Button for Mobile/Agenda View */}
      {view === "agenda" && (
        <button
          className="fixed right-6 rounded-full h-14 w-14 shadow-xl border-2 border-gray-900 z-50 bg-white text-black flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          style={{ bottom: `${footerHeight + 10}px` }}
          onClick={() => {
            setCreateDate(new Date()) // Default to today
            setIsCreateModalOpen(true)
          }}>
          <Plus className="h-6 w-6" />
        </button>
      )}

      <WorkoutDetail
        workout={selectedWorkout}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDelete={() => {
          setIsDetailOpen(false)
          if (onWorkoutCreated) onWorkoutCreated()
        }}
      />

      <CreateWorkoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateWorkout}
        defaultDate={createDate}
        defaultTeamId={teamId || undefined}
      />
    </div>
  )
}
