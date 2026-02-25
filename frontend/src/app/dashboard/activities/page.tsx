"use client"

import React, { useEffect, useState } from "react"
import { useAuthStore } from "../../../lib/store/useAuthStore"
import { useRouter } from "next/navigation"
import { Event, Team } from "../../../types"
import { teamsApi } from "@/lib/api/teams"
import { eventsApi } from "@/lib/api/events"

import { ListFilters, ViewMode } from "../../../components/ui/ListFilters"
import { Loader } from "../../../components/ui/Loader"

interface GroupedEvents {
  [teamId: string]: {
    team: Team | null
    events: Event[]
  }
}

export default function ActivitiesPage() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        const [teamsData, eventsData] = await Promise.all([
          teamsApi.getUserTeams(user.id),
          eventsApi.getUserEvents(user.id),
        ])

        setTeams(teamsData)
        setEvents(eventsData)
      } catch (err) {
        console.error("Error fetching activities data:", err)
        setError("Ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const groupedEvents = events.reduce<GroupedEvents>((acc, event) => {
    const teamId = event.teamId || "personal"
    if (!acc[teamId]) {
      const team = teams.find((t) => t.id === teamId) || null
      acc[teamId] = { team, events: [] }
    }
    acc[teamId].events.push(event)
    return acc
  }, {})

  // Sort teams: defined teams first, then personal/undefined
  const sortedTeamIds = Object.keys(groupedEvents).sort((a, b) => {
    if (a === "personal") return 1
    if (b === "personal") return -1
    return 0
  })

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="w-full p-1 sm:p-2 lg:p-4">
      <ListFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hideToggleOnMobile={true}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white w-full text-center sm:text-left">
          Занятия команд
        </h1>
      </ListFilters>

      <div className="space-y-12">
        {sortedTeamIds.map((teamId) => {
          const { team, events: teamEvents } = groupedEvents[teamId]
          const teamName = team ? team.name : "Личные / Без команды"

          if (teamEvents.length === 0) return null

          return (
            <div
              key={teamId}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 sm:p-4">
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  {teamName}
                </h2>
                <span className="ml-4 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {teamEvents.length}{" "}
                  {teamEvents.length === 1
                    ? "занятие"
                    : teamEvents.length < 5
                      ? "занятия"
                      : "занятий"}
                </span>
              </div>

              {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(event.eventDate).toLocaleDateString("ru-RU", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === "FUTURE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {event.status === "FUTURE" ? "Предстоящее" : "Прошедшее"}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div className="text-sm text-gray-500">
                          {event.exerciseType && (
                            <span className="inline-block mr-3">
                              🏋️ {event.exerciseType}
                            </span>
                          )}
                        </div>
                        {/* Link to edit or view details could go here */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Название
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                          Статус
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {teamEvents.map((event) => (
                        <tr
                          key={event.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(event.eventDate).toLocaleDateString("ru-RU")}
                              {event.exerciseType && ` • ${event.exerciseType}`}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full ${
                                event.status === "FUTURE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}>
                              {event.status === "FUTURE" ? "Предстоящее" : "Прошедшее"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}

        {sortedTeamIds.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Занятий пока нет</p>
          </div>
        )}
      </div>
    </div>
  )
}
