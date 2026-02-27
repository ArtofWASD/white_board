import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "../../../lib/store/useAuthStore"
import { teamsApi } from "../../../lib/api/teams"
import { eventsApi } from "../../../lib/api/events"
import { Team, TeamMember, Event, EventResult } from "../../../types"

export interface TeamWithEvents extends Team {
  events: Event[]
}

export const useTeamActivities = () => {
  const { user } = useAuthStore()
  const [teams, setTeams] = useState<TeamWithEvents[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)

  // Maps teamId to its members
  const [teamMembers, setTeamMembers] = useState<{
    [teamId: string]: { members: TeamMember[]; isLoading: boolean }
  }>({})

  // Maps eventId to its results
  const [eventResults, setEventResults] = useState<{
    [eventId: string]: {
      results: EventResult[]
      isLoading: boolean
      isOpen: boolean
    }
  }>({})

  const fetchTeamsAndEvents = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const userTeams = await teamsApi.getUserTeams(user.id)

      // Filter teams based on user role
      // Trainers and Admins can see teams they manage or own
      // Athletes can see teams they are a member of
      const relevantTeams = userTeams.filter((t: Team) => {
        if (user.role === "ATHLETE") {
          return t.members?.some(
            (m: TeamMember) => m.userId === user.id && m.role === "MEMBER"
          )
        } else {
          // Trainer/Admin logic
          return (
            t.ownerId === user.id ||
            t.members?.some(
              (m: TeamMember) =>
                m.userId === user.id &&
                (m.role === "OWNER" || m.role === "ADMIN")
            )
          )
        }
      })

      const teamsWithEvents = await Promise.all(
        relevantTeams.map(async (team: Team) => {
          try {
            const events = await eventsApi.getUserEvents(user.id, team.id)
            const teamEvents = events.filter((e: Event) => e.teamId === team.id)
            // Sort by date descending (newest first)
            const sortedEvents = teamEvents.sort(
              (a: Event, b: Event) =>
                new Date(b.eventDate).getTime() -
                new Date(a.eventDate).getTime()
            )
            return { ...team, events: sortedEvents }
          } catch (error) {
            console.error(`Error fetching events for team ${team.id}:`, error)
            return { ...team, events: [] }
          }
        })
      )

      setTeams(teamsWithEvents)
    } catch (error) {
      console.error("Error fetching teams and activities:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTeamsAndEvents()
  }, [fetchTeamsAndEvents])

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

  const handleToggleEventExpand = async (eventId: string) => {
    setEventResults((prev) => {
      const isCurrentlyOpen = prev[eventId]?.isOpen || false

      // If closing, just toggle state
      if (isCurrentlyOpen) {
        return {
          ...prev,
          [eventId]: { ...prev[eventId], isOpen: false },
        }
      }

      // If opening and we already have results, just open
      if (
        prev[eventId]?.results?.length > 0 ||
        prev[eventId]?.isLoading === false
      ) {
        return {
          ...prev,
          [eventId]: { ...prev[eventId], isOpen: true },
        }
      }

      // If opening and we need to fetch
      fetchEventResults(eventId)

      return {
        ...prev,
        [eventId]: { results: [], isLoading: true, isOpen: true },
      }
    })
  }

  return {
    user,
    teams,
    isLoading,
    expandedTeamId,
    teamMembers,
    eventResults,
    handleToggleTeamExpand,
    handleToggleEventExpand,
  }
}
