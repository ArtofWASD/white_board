"use client"

import React, { useState, useEffect, useCallback } from "react"
import Header from "../../components/layout/Header"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useTeamStore } from "../../lib/store/useTeamStore"
import Footer from "../../components/layout/Footer"
import { CalendarEvent } from "../../types"
import TeamSelector from "../../features/events/TeamSelector"
import { CalendarSystem } from "@/features/calendar/CalendarSystem"
import { Workout } from "@/features/workouts/components/WorkoutCard"
import { eventsApi } from "@/lib/api/events"
import { format } from "date-fns"

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]) // For LeftMenu
  const [workouts, setWorkouts] = useState<Record<string, Workout[]>>({}) // For CalendarSystem
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  const { isAuthenticated, user } = useAuthStore()
  const { selectedTeam, fetchTeams, teams } = useTeamStore()

  useEffect(() => {
    if (isAuthenticated && teams.length === 0) {
      fetchTeams()
    }
  }, [isAuthenticated, teams.length, fetchTeams])

  // For trainers/admins default to "my" (Мои события) — they pick a team explicitly
  const isTrainerRole =
    user?.role === "TRAINER" ||
    user?.role === "ORGANIZATION_ADMIN" ||
    user?.role === "SUPER_ADMIN"

  const [calendarTeamId, setCalendarTeamId] = useState<string | null>(
    isTrainerRole ? "my" : selectedTeam?.id || "my",
  )

  useEffect(() => {
    // Non-trainer users auto-follow the team store selection
    if (selectedTeam && !isTrainerRole) {
      setCalendarTeamId(selectedTeam.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam])

  // Data Fetching
  const loadEvents = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      const isSpecialFilter = ["all", "my", "all_teams"].includes(calendarTeamId || "")
      const filterTeamId = calendarTeamId && !isSpecialFilter ? calendarTeamId : undefined

      const data = await eventsApi.getUserEvents(user.id, filterTeamId)

      // Transform for Legacy Support (LeftMenu)
      const calendarEvents: CalendarEvent[] = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: event.eventDate.split("T")[0],
        exerciseType: event.exerciseType,
        exercises: event.exercises || [],
        results: event.results || [],
        teamId: event.teamId,
        timeCap: event.timeCap,
        rounds: event.rounds,
        description: event.description,
        userId: event.userId,
        participants: event.participants,
        scheme: event.scheme,
      }))

      // Filtering Logic
      const filteredEvents = calendarEvents.filter((event) => {
        if (!calendarTeamId || calendarTeamId === "my") {
          return event.id && !event.teamId && (event as any).userId === user?.id
        }
        if (calendarTeamId === "all_teams") {
          return !(!event.teamId && (event as any).userId === user?.id)
        }
        if (calendarTeamId === "all") return true
        return event.teamId === calendarTeamId || !event.teamId
      })

      setEvents(filteredEvents)

      // Transform for New Calendar System
      const workoutsMap: Record<string, Workout[]> = {}

      data.forEach((event) => {
        // Apply same filtering
        let isVisible = false
        if (!calendarTeamId || calendarTeamId === "my") {
          isVisible = !!event.id && !event.teamId && event.userId === user?.id
        } else if (calendarTeamId === "all_teams") {
          isVisible = !(!event.teamId && event.userId === user?.id)
        } else if (calendarTeamId === "all") {
          isVisible = true
        } else {
          isVisible = event.teamId === calendarTeamId || !event.teamId
        }

        if (!isVisible) return

        const dateObj = new Date(event.eventDate)
        const dateKey = format(dateObj, "yyyy-MM-dd")
        const scheduledTime = format(dateObj, "HH:mm")

        if (!workoutsMap[dateKey]) {
          workoutsMap[dateKey] = []
        }

        const typeMap: Record<string, "AMRAP" | "EMOM" | "FOR_TIME" | "WEIGHTLIFTING"> = {
          "For Time": "FOR_TIME",
          FOR_TIME: "FOR_TIME",
          AMRAP: "AMRAP",
          EMOM: "EMOM",
          Weightlifting: "WEIGHTLIFTING",
          WEIGHTLIFTING: "WEIGHTLIFTING",
          "Not for Time": "FOR_TIME", // Fallback
        }

        // Try to find user result
        const userResult = event.results?.find(
          (r: any) => r.username === user.name || r.userId === user.id,
        )

        workoutsMap[dateKey].push({
          id: event.id,
          title: event.title,
          type: typeMap[event.exerciseType || event.scheme || "FOR_TIME"] || "FOR_TIME",
          result: userResult ? userResult.time : undefined,
          scheduledTime,
          description: event.description || "",
          movements: event.exercises?.map((e: any) => e.name) || [],
          exercises: event.exercises || [],
          timeCap: event.timeCap,
          rounds: event.rounds,
          userId: event.userId,
          teamName: (event as any).team?.name,
          durationMinutes: event.timeCap ? parseInt(event.timeCap) || 60 : 60,
        })
      })

      setWorkouts(workoutsMap)
    } catch (error) {
      console.error("Failed to load events", error)
    }
  }, [isAuthenticated, user, calendarTeamId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleShowEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleCloseEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  // FAB offset: only the VISIBLE part of the footer in the viewport
  const footerRef = React.useRef<HTMLDivElement>(null)
  const [visibleFooterHeight, setVisibleFooterHeight] = useState(0)

  useEffect(() => {
    const updateVisibleFooterHeight = () => {
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect()
        // How many pixels of the footer are currently visible from the bottom of the viewport
        const visible = Math.max(0, window.innerHeight - rect.top)
        setVisibleFooterHeight(visible)
      }
    }

    updateVisibleFooterHeight()
    window.addEventListener("resize", updateVisibleFooterHeight)
    window.addEventListener("scroll", updateVisibleFooterHeight, { passive: true })
    return () => {
      window.removeEventListener("resize", updateVisibleFooterHeight)
      window.removeEventListener("scroll", updateVisibleFooterHeight)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        leftMenuEvents={events}
        onShowEventDetails={handleShowEventDetails}
      />

      <main className={`flex-grow transition-all duration-300 ease-in-out ml-0 pt-0`}>
        {/* Removed padding to let CalendarSystem take full space if needed, handled by internal padding */}
        <div className="h-[calc(100vh-100px)]">
          <CalendarSystem
            workouts={workouts}
            onWorkoutCreated={loadEvents}
            teamId={calendarTeamId}
            footerHeight={visibleFooterHeight}
            headerActions={
              <TeamSelector
                selectedTeamId={calendarTeamId}
                onSelectTeam={setCalendarTeamId}
                className="w-full sm:w-64"
              />
            }
          />
        </div>
      </main>

      <div ref={footerRef} className="hidden lg:block">
        <Footer />
      </div>

      {/* Legacy Event Modal for LeftMenu interactions */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={handleCloseEventModal}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                <button
                  onClick={handleCloseEventModal}
                  className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">Дата: {selectedEvent.date}</p>
              </div>

              {selectedEvent.results && selectedEvent.results.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Результаты</h3>
                  <ul className="space-y-3">
                    {selectedEvent.results.map((result) => (
                      <li
                        key={result.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{result.time}</span>
                          <span className="text-gray-500 text-sm">
                            {result.dateAdded}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          Добавил: {result.username}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">Нет результатов для этого события</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
