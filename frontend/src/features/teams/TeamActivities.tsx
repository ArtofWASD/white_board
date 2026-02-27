import React, { useState, useEffect } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { teamsApi } from "../../lib/api/teams"
import { eventsApi } from "../../lib/api/events"
import { Team, TeamMember, Event, EventResult } from "../../types"
import { Card } from "../../components/ui/Card"
import { Loader } from "../../components/ui/Loader"
import { ChevronDown, ChevronUp, Users, Trophy, Calendar } from "lucide-react"
import { cn } from "../../lib/utils"

interface TeamWithEvents extends Team {
  events: Event[]
}

const TeamActivities: React.FC = () => {
  const { user } = useAuthStore()
  const [teams, setTeams] = useState<TeamWithEvents[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)
  
  // Maps teamId to its members
  const [teamMembers, setTeamMembers] = useState<{
    [teamId: string]: { members: TeamMember[], isLoading: boolean }
  }>({})

  // Maps eventId to its results
  const [eventResults, setEventResults] = useState<{
    [eventId: string]: { results: EventResult[], isLoading: boolean, isOpen: boolean }
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
            const teamEvents = events.filter((e: Event) => e.teamId === team.id)
            // Sort by date descending (newest first)
            const sortedEvents = teamEvents.sort(
              (a: Event, b: Event) =>
                new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
            )
            return { ...team, events: sortedEvents }
          } catch (error) {
            console.error(`Error fetching events for team ${team.id}:`, error)
            return { ...team, events: [] }
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

  const handleToggleTeamExpand = async (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null)
      return
    }

    setExpandedTeamId(teamId)

    if (!teamMembers[teamId]) {
      try {
        setTeamMembers((prev) => ({
          ...prev,
          [teamId]: { members: [], isLoading: true },
        }))

        const members = await teamsApi.getMembers(teamId)

        setTeamMembers((prev) => ({
          ...prev,
          [teamId]: { members, isLoading: false },
        }))
      } catch (error) {
        console.error(`Error fetching members for team ${teamId}:`, error)
        setTeamMembers((prev) => ({
          ...prev,
          [teamId]: { ...prev[teamId], isLoading: false },
        }))
      }
    }
  }

  const handleToggleEventExpand = async (eventId: string) => {
    setEventResults((prev) => {
      const isCurrentlyOpen = prev[eventId]?.isOpen || false
      
      // If closing, just toggle state
      if (isCurrentlyOpen) {
        return {
          ...prev,
          [eventId]: { ...prev[eventId], isOpen: false }
        }
      }

      // If opening and we already have results, just open
      if (prev[eventId]?.results?.length > 0 || prev[eventId]?.isLoading === false) {
         return {
          ...prev,
          [eventId]: { ...prev[eventId], isOpen: true }
        }
      }

      // If opening and we need to fetch
      fetchEventResults(eventId)
      
      return {
        ...prev,
        [eventId]: { results: [], isLoading: true, isOpen: true }
      }
    })
  }

  const fetchEventResults = async (eventId: string) => {
    try {
      const results = await eventsApi.getResults(eventId)
      setEventResults((prev) => ({
        ...prev,
        [eventId]: { results, isLoading: false, isOpen: true },
      }))
    } catch (error) {
      console.error(`Error fetching results for event ${eventId}:`, error)
      setEventResults((prev) => ({
        ...prev,
        [eventId]: { ...prev[eventId], isLoading: false },
      }))
    }
  }

  const formatResultValue = (result: EventResult, scheme?: string) => {
    if (scheme === "FOR_TIME") {
      return result.time || "0:00"
    } else if (scheme === "AMRAP" || scheme === "EMOM" || scheme === "WEIGHTLIFTING") {
      const unit = scheme === "AMRAP" ? "reps" : "kg"
      return `${result.value || 0} ${unit}`
    }
    return result.time || (result.value ? `${result.value}` : "Выполнено")
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

  const renderEventResults = (team: TeamWithEvents, event: Event) => {
    const membersData = teamMembers[team.id]
    const resultsData = eventResults[event.id]

    if (!membersData || membersData.isLoading || resultsData?.isLoading) {
      return (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      )
    }

    return (
      <div className="overflow-x-auto -mx-5 sm:mx-0 mt-4 border-t dark:border-gray-700 pt-4">
        {/* Desktop Table View */}
        <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Атлет
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Результат
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
            {membersData.members
              .filter((m) => m.userId !== team.ownerId)
              .map((member) => {
                const result = resultsData?.results?.find(
                  (r) =>
                    r.userId === member.userId ||
                    r.username === member.user.name,
                )
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {member.user.name} {member.user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {result ? (
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            result.scaling === "RX"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : result.scaling === "SCALED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                          {result.scaling || "RX"}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">
                      {result ? (
                        formatResultValue(result, event.scheme)
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 italic font-normal">
                          Нет результата
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3 px-5 py-3">
          {membersData.members
            .filter((m) => m.userId !== team.ownerId)
            .map((member) => {
              const result = resultsData?.results?.find(
                (r) =>
                  r.userId === member.userId ||
                  r.username === member.user.name,
              )
              return (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {member.user.name} {member.user.lastName}
                    </div>
                    {result && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          result.scaling === "RX"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : result.scaling === "SCALED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                        {result.scaling || "RX"}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Результат:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {result ? (
                        formatResultValue(result, event.scheme)
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 font-normal italic">
                          Нет результата
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Активность команд
      </h1>

      <div className="grid gap-6">
        {teams.map((team) => {
          const isTeamExpanded = expandedTeamId === team.id
          
          return (
            <Card
              key={team.id}
              noPadding
              className="overflow-hidden border dark:border-gray-700">
              <div
                className={cn(
                  "p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all duration-300",
                  isTeamExpanded
                    ? "bg-blue-50/30 dark:bg-blue-900/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
                onClick={() => handleToggleTeamExpand(team.id)}>
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 pr-2">
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      {team.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {team.events.length > 0
                        ? `Всего комплексов: ${team.events.length}`
                        : "Нет комплексов"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {isTeamExpanded ? (
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  )}
                </div>
              </div>

              {isTeamExpanded && (
                <div className="border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-5">
                  {teamMembers[team.id]?.isLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {team.events.length === 0 ? (
                        <p className="text-center text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 py-3 mb-4 rounded-lg">
                          Внимание: Для этой команды еще не создано ни одного комплекса.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {team.events.map((event) => {
                            const eventDate = new Date(event.eventDate)
                            eventDate.setHours(0, 0, 0, 0)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            
                            const isPast = eventDate < today
                            const isToday = eventDate.getTime() === today.getTime()
                            
                            let statusBadge = null
                            if (isPast) {
                              statusBadge = (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Прошедший
                                </span>
                              )
                            } else if (isToday) {
                                statusBadge = (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                  Сегодня
                                </span>
                              )
                            } else {
                              statusBadge = (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                  Предстоящий
                                </span>
                              )
                            }

                            const isEventExpanded = eventResults[event.id]?.isOpen

                            return (
                              <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden shadow-sm">
                                <div 
                                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                  onClick={() => handleToggleEventExpand(event.id)}
                                >
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-gray-900 dark:text-white">
                                        {event.title}
                                      </h4>
                                      {statusBadge}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                      <Calendar className="w-4 h-4" />
                                      <span>{eventDate.toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="shrink-0 flex items-center text-gray-400">
                                    <span className="text-xs mr-2 hidden sm:inline-block">
                                      {isEventExpanded ? "Скрыть результаты" : "Посмотреть результаты"}
                                    </span>
                                    {isEventExpanded ? (
                                      <ChevronUp className="w-5 h-5" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5" />
                                    )}
                                  </div>
                                </div>
                                
                                {isEventExpanded && renderEventResults(team, event)}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default TeamActivities

