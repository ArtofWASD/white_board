"use client"

import React, { useState, useEffect } from "react"
import { useTeamStore } from "../../../lib/store/useTeamStore"
import { useAuthStore } from "../../../lib/store/useAuthStore"
import { teamsApi } from "../../../lib/api/teams"
import { Team } from "../../../types"
import { TeamMember } from "../../../types/TeamManagement.types"
import { ListFilters, ViewMode } from "../../../components/ui/ListFilters"
import { Loader } from "../../../components/ui/Loader"

interface AthleteWithTeams {
  id: string
  name: string
  email: string
  teams: Team[]
}

export default function AthletesPage() {
  const { teams, fetchTeams } = useTeamStore()
  const [athletes, setAthletes] = useState<AthleteWithTeams[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  useEffect(() => {
    const fetchAthletes = async () => {
      if (teams.length === 0) {
        setLoading(false)
        return
      }

      setLoading(true)
      const athleteMap = new Map<string, AthleteWithTeams>()

      try {
        const promises = teams.map((team) => teamsApi.getMembers(team.id))
        const results = await Promise.all(promises)

        results.forEach((members: TeamMember[] | undefined, index: number) => {
          const team = teams[index]
          if (Array.isArray(members)) {
            members.forEach((member) => {
              // Filter for athletes only if needed.
              // Assuming "athletes" means users with role 'athlete'.

              if (member.user.role === "ATHLETE") {
                if (!athleteMap.has(member.user.id)) {
                  athleteMap.set(member.user.id, {
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    teams: [],
                  })
                }

                const athlete = athleteMap.get(member.user.id)!
                // Avoid duplicate teams for the same athlete
                if (!athlete.teams.find((t) => t.id === team.id)) {
                  athlete.teams.push(team)
                }
              }
            })
          }
        })

        setAthletes(Array.from(athleteMap.values()))
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    fetchAthletes()
  }, [teams])

  if (loading) {
    return <Loader />
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <ListFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hideToggleOnMobile={true}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Атлеты</h1>
      </ListFilters>

      {athletes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            В ваших командах пока нет атлетов.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Добавьте атлетов в свои команды на странице "Команды".
          </p>
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Имя
                    </th>
                    <th
                      scope="col"
                      className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Команды
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {athletes.map((athlete) => (
                    <tr
                      key={athlete.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {athlete.name}
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {athlete.teams.map((team) => (
                            <span
                              key={team.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-gray-800 text-blue-800 dark:text-white border dark:border-white">
                              {team.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {athletes.map((athlete) => (
                <div
                  key={athlete.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="ml-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {athlete.name}
                      </h3>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Команды
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {athlete.teams.map((team) => (
                        <span
                          key={team.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-gray-800 text-blue-800 dark:text-white border dark:border-white">
                          {team.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
