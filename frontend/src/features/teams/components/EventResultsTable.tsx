import React from "react"
import { TeamMember, Event, EventResult } from "../../../types"
import { TeamWithEvents } from "./useTeamActivities"
import { Loader } from "../../../components/ui/Loader"

interface EventResultsTableProps {
  team: TeamWithEvents
  event: Event
  membersData: { members: TeamMember[]; isLoading: boolean } | undefined
  resultsData:
    | { results: EventResult[]; isLoading: boolean; isOpen: boolean }
    | undefined
}

const formatResultValue = (result: EventResult, scheme?: string) => {
  if (scheme === "FOR_TIME") {
    return result.time || "0:00"
  } else if (
    scheme === "AMRAP" ||
    scheme === "EMOM" ||
    scheme === "WEIGHTLIFTING"
  ) {
    const unit = scheme === "AMRAP" ? "reps" : "kg"
    return `${result.value || 0} ${unit}`
  }
  return result.time || (result.value ? `${result.value}` : "Выполнено")
}

export const EventResultsTable: React.FC<EventResultsTableProps> = ({
  team,
  event,
  membersData,
  resultsData,
}) => {
  if (!membersData || membersData.isLoading || resultsData?.isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader />
      </div>
    )
  }

  const athletesToDisplay = membersData.members.filter((m) => {
    const isOwner = m.userId === team.ownerId
    if (isOwner) {
      return resultsData?.results?.some(
        (r) => r.userId === m.userId || r.username === m.user.name
      )
    }
    return true
  })

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
          {athletesToDisplay.map((member) => {
            const result = resultsData?.results?.find(
              (r) =>
                r.userId === member.userId || r.username === member.user.name
            )
            return (
              <tr
                key={member.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
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
                      }`}
                    >
                      {result.scaling || "RX"}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
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
        {athletesToDisplay.map((member) => {
          const result = resultsData?.results?.find(
            (r) => r.userId === member.userId || r.username === member.user.name
          )
          return (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-all"
            >
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
                    }`}
                  >
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
