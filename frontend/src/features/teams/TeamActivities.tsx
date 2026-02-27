import React, { useState, useEffect } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { teamsApi } from "../../lib/api/teams"
import { eventsApi } from "../../lib/api/events"
import { Team, TeamMember, Event, EventResult } from "../../types"
import { Card } from "../../components/ui/Card"
import { Loader } from "../../components/ui/Loader"
import { ChevronDown, ChevronUp, Users, Trophy } from "lucide-react"

interface TeamWithLastEvent extends Team {
  lastEvent?: Event | null
}

const TeamActivities: React.FC = () => {
  const { user } = useAuthStore()
  const [teams, setTeams] = useState<TeamWithLastEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)
  const [teamDetails, setTeamDetails] = useState<{
    [teamId: string]: {
      members: TeamMember[]
      results: EventResult[]
      isLoading: boolean
    }
  }>({})

  useEffect(() => {
    if (user?.id) {
      fetchTeamsAndEvents()
    }
  }, [user?.id])

  const fetchTeamsAndEvents = async () => {
    try {
      setIsLoading(true)
      const userTeams = await teamsApi.getUserTeams(user!.id)

      // Filter teams where user is owner or admin (trainer role in team)
      const trainersTeams = userTeams.filter(
        (t: Team) =>
          t.ownerId === user?.id ||
          t.members?.some(
            (m: TeamMember) =>
              m.userId === user?.id && (m.role === "OWNER" || m.role === "ADMIN"),
          ),
      )

      const teamsWithEvents = await Promise.all(
        trainersTeams.map(async (team: Team) => {
          try {
            const events = await eventsApi.getUserEvents(user!.id, team.id)
            // Sort by date descending and find the latest one that is not in the future or just the latest one
            const sortedEvents = events.sort(
              (a: Event, b: Event) =>
                new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
            )
            return { ...team, lastEvent: sortedEvents[0] || null }
          } catch (error) {
            console.error(`Error fetching events for team ${team.id}:`, error)
            return { ...team, lastEvent: null }
          }
        }),
      )

      setTeams(teamsWithEvents)
    } catch (error) {
      console.error("Error fetching teams and activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleExpand = async (teamId: string, eventId: string | undefined) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null)
      return
    }

    setExpandedTeamId(teamId)

    if (!teamDetails[teamId] && eventId) {
      try {
        setTeamDetails((prev) => ({
          ...prev,
          [teamId]: { members: [], results: [], isLoading: true },
        }))

        const [members, results] = await Promise.all([
          teamsApi.getMembers(teamId),
          eventsApi.getResults(eventId),
        ])

        setTeamDetails((prev) => ({
          ...prev,
          [teamId]: { members, results, isLoading: false },
        }))
      } catch (error) {
        console.error(`Error fetching details for team ${teamId}:`, error)
        setTeamDetails((prev) => ({
          ...prev,
          [teamId]: { ...prev[teamId], isLoading: false },
        }))
      }
    }
  }

  if (isLoading) return <Loader />

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          У вас пока нет команд для управления.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Активность команд
      </h1>

      <div className="grid gap-6">
        {teams.map((team) => (
          <Card
            key={team.id}
            noPadding
            className="overflow-hidden border dark:border-gray-700">
            <div
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => handleToggleExpand(team.id, team.lastEvent?.id)}>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {team.lastEvent
                      ? `Комплекс: ${team.lastEvent.title}`
                      : "Нет запланированных комплексов"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                {team.lastEvent && (
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Trophy className="w-4 h-4" />
                    <span>{new Date(team.lastEvent.eventDate).toLocaleDateString()}</span>
                  </div>
                )}
                {expandedTeamId === team.id ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>

            {expandedTeamId === team.id && (
              <div className="border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-5">
                {teamDetails[team.id]?.isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader />
                  </div>
                ) : !team.lastEvent ? (
                  <p className="text-center text-gray-500 py-4">
                    Нет данных для отображения
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Атлет
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            RX/SC
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Результат
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {teamDetails[team.id]?.members
                          .filter((m) => m.userId !== team.ownerId)
                          .map((member) => {
                            const result = teamDetails[team.id]?.results.find(
                              (r) =>
                                r.userId === member.userId ||
                                r.username === member.user.name,
                            )
                            return (
                              <tr
                                key={member.id}
                                className="hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {member.user.name} {member.user.lastName}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                  {result ? (
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        result.scaling === "RX"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      }`}>
                                      {result.scaling || "RX"}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {result ? (
                                    <span className="font-semibold">
                                      {result.time || result.value || "Выполнено"}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Нет результата
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        {teamDetails[team.id]?.members.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-8 text-center text-gray-500">
                              В команде нет участников
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TeamActivities
