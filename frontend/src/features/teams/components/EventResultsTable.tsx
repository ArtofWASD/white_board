import React from "react"
import { TeamMember, Event, EventResult } from "../../../types"
import { TeamWithEvents } from "./useTeamActivities"
import { Loader } from "../../../components/ui/Loader"

interface EventResultsTableProps {
  team: TeamWithEvents
  event: Event
  membersData: { members: TeamMember[]; isLoading: boolean } | undefined
  resultsData: { results: EventResult[]; isLoading: boolean; isOpen: boolean } | undefined
}

const formatResultValue = (result: EventResult, event?: Event) => {
  const scheme = event?.scheme
  const calculatorType = event?.calculatorType

  if (scheme === "FOR_TIME") {
    return result.time || "0:00"
  } else if (scheme === "AMRAP" || scheme === "EMOM" || scheme === "WEIGHTLIFTING") {
    const unit = scheme === "AMRAP" || calculatorType === "5/3/1" ? "reps" : "kg"
    return `${result.value || 0} ${unit}`
  }
  return result.time || (result.value ? `${result.value}` : "Выполнено")
}

const getResultColorClass = (result: EventResult | undefined, event: Event) => {
  if (!result || event.calculatorType !== "5/3/1") return ""

  const recordExercise = event.exercises?.find((ex) => ex.isRecord)
  if (!recordExercise || !recordExercise.rxReps) return ""

  const rxReps = parseInt(recordExercise.rxReps, 10)
  const achievedReps = result.value || 0

  if (achievedReps === 0) {
    return "text-red-600 dark:text-red-400"
  }

  if (achievedReps >= rxReps) {
    return "text-green-600 dark:text-green-400"
  } else if (achievedReps === rxReps - 1) {
    return "text-yellow-600 dark:text-yellow-400"
  } else {
    return "text-red-600 dark:text-red-400"
  }
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
    // If the user is the owner/admin, only show them if they have a logged result
    const isOwner = m.userId === team.ownerId
    if (isOwner) {
      return resultsData?.results?.some(
        (r) => r.userId === m.userId || r.username === m.user.name,
      )
    }
    return true
  })

  // Also include the current user/owner if they have a result but are somehow NOT in membersData.members
  if (resultsData?.results) {
    const ownerResult = resultsData.results.find(
      (r) =>
        (r.userId && r.userId === team.ownerId) ||
        (!r.userId && team.owner?.name && r.username === team.owner.name),
    )

    // If owner has a result, but isn't in athletesToDisplay (e.g. they aren't in members array)
    if (ownerResult && !athletesToDisplay.some((m) => m.userId === team.ownerId)) {
      // Mock a TeamMember object for the owner just for display purposes
      athletesToDisplay.unshift({
        id: `owner-${team.ownerId}`,
        teamId: team.id,
        userId: team.ownerId,
        role: "OWNER",
        user: {
          id: team.ownerId,
          name: ownerResult.username.split(" ")[0] || "Тренер",
          lastName: ownerResult.username.split(" ").slice(1).join(" ") || "",
          email: "",
          role: "TRAINER",
          isAdmin: false,
        },
      })
    }
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
          {athletesToDisplay.map((member) => {
            const result = resultsData?.results?.find(
              (r) => r.userId === member.userId || r.username === member.user.name,
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
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${getResultColorClass(result, event) || "text-gray-900 dark:text-white"}`}>
                  {result ? (
                    formatResultValue(result, event)
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
            (r) => r.userId === member.userId || r.username === member.user.name,
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
                <span className="text-gray-500 dark:text-gray-400">Результат:</span>
                <span
                  className={`font-bold ${result ? getResultColorClass(result, event) || "text-gray-900 dark:text-white" : ""}`}>
                  {result ? (
                    formatResultValue(result, event)
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
