import React from "react"
import { ChevronDown, ChevronUp, Users } from "lucide-react"
import { TeamWithEvents } from "./useTeamActivities"
import { Card } from "../../../components/ui/Card"
import { cn } from "../../../lib/utils"
import { Loader } from "../../../components/ui/Loader"
import { TeamEventItem } from "./TeamEventItem"
import { EventResult, TeamMember, User } from "../../../types"

interface TeamActivityCardProps {
  team: TeamWithEvents
  user: User | null
  isExpanded: boolean
  membersData: { members: TeamMember[]; isLoading: boolean } | undefined
  eventResultsMap: {
    [eventId: string]: {
      results: EventResult[]
      isLoading: boolean
      isOpen: boolean
    }
  }
  onToggleTeam: (teamId: string) => void
  onToggleEvent: (eventId: string) => void
}

export const TeamActivityCard: React.FC<TeamActivityCardProps> = ({
  team,
  user,
  isExpanded,
  membersData,
  eventResultsMap,
  onToggleTeam,
  onToggleEvent,
}) => {
  return (
    <Card noPadding className="overflow-hidden border dark:border-gray-700">
      <div
        className={cn(
          "p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all duration-300",
          isExpanded
            ? "bg-blue-50/30 dark:bg-blue-900/10"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
        onClick={() => onToggleTeam(team.id)}
      >
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
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-5">
          {membersData?.isLoading ? (
            <div className="flex justify-center py-6">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {team.events.length === 0 ? (
                <p className="text-center text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 py-3 mb-4 rounded-lg">
                  Для этой команды еще не создано ни одного комплекса.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {team.events.map((event) => (
                    <TeamEventItem
                      key={event.id}
                      team={team}
                      event={event}
                      user={user}
                      membersData={membersData}
                      resultsData={eventResultsMap[event.id]}
                      onToggleExpand={onToggleEvent}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
