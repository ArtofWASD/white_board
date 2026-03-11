import React from "react"
import { useTeamStore } from "../../lib/store/useTeamStore"
import { ChevronDown } from "lucide-react"

interface TeamSelectorProps {
  selectedTeamId: string | null
  onSelectTeam: (teamId: string | null) => void
  className?: string
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  selectedTeamId,
  onSelectTeam,
  className = "",
}) => {
  const { teams } = useTeamStore()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label
        htmlFor="team-select"
        className="text-sm font-medium text-gray-700 dark:text-white whitespace-nowrap">
        Команда:
      </label>
      <div className="relative w-full min-w-[140px]">
        <select
          id="team-select"
          value={selectedTeamId || "my"}
          onChange={(e) => onSelectTeam(e.target.value)}
          className="appearance-none block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 pl-3 pr-8 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors">
          <option value="my">Мои события</option>
          <option value="all_teams">Все команды</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

export default TeamSelector
