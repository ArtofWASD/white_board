"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Header from "../../components/layout/Header"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useTeamStore } from "../../lib/store/useTeamStore"
import Footer from "../../components/layout/Footer"
import { NavItem, CalendarEvent, EventResult } from "../../types"
import TeamSelector from "../../features/events/TeamSelector"
import LeftMenu from "../../components/layout/LeftMenu"
import { CalendarSystem } from "@/features/calendar/CalendarSystem"
import { Workout } from "@/features/workouts/components/WorkoutCard"
import { eventsApi } from "@/lib/api/events"
import { format } from "date-fns"

export default function CalendarPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([]) // For LeftMenu
  const [workouts, setWorkouts] = useState<Record<string, Workout[]>>({}) // For CalendarSystem
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  const { isAuthenticated, user, logout } = useAuthStore()
  const { selectedTeam, fetchTeams, teams } = useTeamStore()

  // Navigation Items
  const navItems = useMemo(() => {
    if (!user) return []

    const items: NavItem[] = [
      {
        label: "Главная",
        href: "/dashboard",
        icon: <Image src="/home_icon.png" alt="Home" width={32} height={32} />,
        tooltip: "Главная",
      },
      {
        label: "Лидерборд",
        href: "/dashboard/leaderboard",
        icon: <Image src="/leaderboard.png" alt="Leaderboard" width={32} height={32} />,
        tooltip: "Лидерборд",
      },
      {
        label: "Команды",
        href: "/dashboard/teams",
        icon: <Image src="/teams_icon.png" alt="Teams" width={32} height={32} />,
        tooltip: "Команды",
      },
    ]

    if (
      user.role === "TRAINER" ||
      user.role === "ORGANIZATION_ADMIN" ||
      user.role === "SUPER_ADMIN"
    ) {
      items.push({
        label: "Управление",
        href: "/dashboard/organization",
        icon: <Image src="/menegment.png" alt="Management" width={32} height={32} />,
        tooltip: "Управление",
      })

      items.push({
        label: "Атлеты",
        href: "/dashboard/athletes",
        icon: <Image src="/athlet_icon.png" alt="Athletes" width={32} height={32} />,
        tooltip: "Атлеты",
      })

      if (user.role === "TRAINER" || user.role === "SUPER_ADMIN") {
        items.push({
          label: "Занятия",
          href: "/dashboard/activities",
          icon: <Image src="/workout_icon.png" alt="Activities" width={32} height={32} />,
          tooltip: "Занятия",
        })
      }
    }

    if (user.role === "SUPER_ADMIN") {
      items.push({
        label: "Админ",
        href: "/admin",
        icon: <Image src="/admin-panel.png" alt="Admin" width={32} height={32} />,
        tooltip: "Админ",
      })
    }

    items.push({
      label: "Таймер",
      href: "/timer",
      icon: <Image src="/stopwatch.png" alt="Timer" width={32} height={32} />,
      tooltip: "Таймер",
    })

    items.push(
      {
        label: "Календарь",
        href: "/calendar",
        icon: <Image src="/calendar_icon.png" alt="Calendar" width={32} height={32} />,
        tooltip: "Календарь",
      },
      {
        label: "Выйти",
        href: "#",
        onClick: async () => {
          await logout()
          window.location.href = "/calendar"
        },
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        ),
        tooltip: "Выйти",
      },
    )

    return items
  }, [user, logout])

  useEffect(() => {
    if (isAuthenticated && teams.length === 0) {
      fetchTeams()
    }
  }, [isAuthenticated, teams.length, fetchTeams])

  const [calendarTeamId, setCalendarTeamId] = useState<string | null>(
    selectedTeam?.id || "my",
  )

  useEffect(() => {
    if (selectedTeam) {
      setCalendarTeamId(selectedTeam.id)
    }
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
          timeCap: event.timeCap,
          rounds: event.rounds,
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

  const toggleAuth = () => {
    setShowAuth(!showAuth)
  }

  const handleShowEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleCloseEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  // Footer Height Calculation for FAB
  const footerRef = React.useRef<HTMLDivElement>(null)
  const [footerHeight, setFooterHeight] = useState(0)

  useEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight)
      }
    }

    updateFooterHeight() // Initial measure
    window.addEventListener("resize", updateFooterHeight)
    return () => window.removeEventListener("resize", updateFooterHeight)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onRightMenuClick={() => {}}
        onLeftMenuClick={() => setIsLeftMenuOpen(true)}
        navItems={navItems}
      />

      <LeftMenu
        isOpen={isLeftMenuOpen}
        onClose={() => setIsLeftMenuOpen(false)}
        showAuth={showAuth}
        toggleAuth={toggleAuth}
        events={events} // Legacy support
        onShowEventDetails={handleShowEventDetails}
        navItems={navItems}
      />

      <main className={`flex-grow transition-all duration-300 ease-in-out ml-0 pt-0`}>
        {/* Removed padding to let CalendarSystem take full space if needed, handled by internal padding */}
        <div className="h-[calc(100vh-140px)]">
          <CalendarSystem
            workouts={workouts}
            onWorkoutCreated={loadEvents}
            teamId={calendarTeamId}
            footerHeight={footerHeight}
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

      <div ref={footerRef}>
        <Footer />
      </div>

      {/* Legacy Event Modal for LeftMenu interactions */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseEventModal}></div>
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                        className="border border-gray-200 rounded-lg p-3">
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
