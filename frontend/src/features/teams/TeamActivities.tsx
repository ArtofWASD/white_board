import React from "react"
import { Loader } from "../../components/ui/Loader"
import { useTeamActivities } from "./components/useTeamActivities"
import { TeamActivityCard } from "./components/TeamActivityCard"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

const TeamActivities: React.FC = () => {
  const {
    user,
    teams,
    isLoading,
    expandedTeamId,
    teamMembers,
    eventResults,
    handleToggleTeamExpand,
    handleToggleEventExpand,
  } = useTeamActivities()

  if (isLoading) return <Loader />

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          У вас пока нет команд для просмотра.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Активность команд
        </h1>
        {user?.role === "ATHLETE" && (
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Users className="w-4 h-4" />
            К списку команд
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {teams.map((team) => (
          <TeamActivityCard
            key={team.id}
            team={team}
            user={user}
            isExpanded={expandedTeamId === team.id}
            membersData={teamMembers[team.id]}
            eventResultsMap={eventResults}
            onToggleTeam={handleToggleTeamExpand}
            onToggleEvent={handleToggleEventExpand}
          />
        ))}
      </div>
    </div>
  )
}

export default TeamActivities
