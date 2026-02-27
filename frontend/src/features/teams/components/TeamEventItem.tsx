import React from "react"
import { Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { Event, EventResult, User, TeamMember } from "../../../types"
import { TeamWithEvents } from "./useTeamActivities"
import { EventResultsTable } from "./EventResultsTable"
import { AthleteEventView } from "./AthleteEventView"

interface TeamEventItemProps {
  team: TeamWithEvents
  event: Event
  user: User | null
  membersData: { members: TeamMember[]; isLoading: boolean } | undefined
  resultsData:
    | { results: EventResult[]; isLoading: boolean; isOpen: boolean }
    | undefined
  onToggleExpand: (eventId: string) => void
}

export const TeamEventItem: React.FC<TeamEventItemProps> = ({
  team,
  event,
  user,
  membersData,
  resultsData,
  onToggleExpand,
}) => {
  const isEventExpanded = resultsData?.isOpen || false
  const isAthlete = user?.role === "ATHLETE"

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden shadow-sm">
      <div
        className="group p-4 flex items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4"
        onClick={() => onToggleExpand(event.id)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900 dark:text-white truncate">
              {event.title}
            </h4>
            {statusBadge}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4" />
              <span>{eventDate.toLocaleDateString()}</span>
            </div>

            {(event.exerciseType ||
              event.scheme ||
              event.timeCap ||
              event.rounds) && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                  {[
                    event.exerciseType === "CROSSFIT"
                      ? "Кроссфит"
                      : event.exerciseType === "WEIGHTLIFTING"
                      ? "Тяжелая атлетика"
                      : event.exerciseType === "STRENGTH"
                      ? "Силовая"
                      : event.exerciseType === "CARDIO"
                      ? "Кардио"
                      : event.exerciseType,
                    event.scheme === "FOR_TIME" ? "AFAP" : event.scheme,
                    event.rounds && `${event.rounds} раундов`,
                    event.timeCap && `Cap: ${event.timeCap}`,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              </div>
            )}

            {event.exercises && event.exercises.length > 0 && (
              <div className="flex flex-col gap-1.5 min-w-0 w-full md:w-auto md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-3 md:ml-1 mt-2 md:mt-0">
                {event.exercises.map((exercise, index) => {
                  const rxArr = [
                    exercise.rxWeight && `${exercise.rxWeight} кг`,
                    exercise.rxReps && `${exercise.rxReps} пов.`,
                    exercise.measurement === "calories" &&
                      exercise.rxCalories &&
                      `${exercise.rxCalories} кал.`,
                    exercise.measurement === "time" &&
                      exercise.rxTime &&
                      `${exercise.rxTime}`,
                    exercise.measurement === "distance" &&
                      exercise.rxDistance &&
                      `${exercise.rxDistance} м.`,
                  ].filter(Boolean)

                  const scArr = [
                    exercise.scWeight && `${exercise.scWeight} кг`,
                    exercise.scReps && `${exercise.scReps} пов.`,
                    exercise.measurement === "calories" &&
                      exercise.scCalories &&
                      `${exercise.scCalories} кал.`,
                    exercise.measurement === "time" &&
                      exercise.scTime &&
                      `${exercise.scTime}`,
                    exercise.measurement === "distance" &&
                      exercise.scDistance &&
                      `${exercise.scDistance} м.`,
                  ].filter(Boolean)

                  const rxText = rxArr.length > 0 ? rxArr.join(" \\ ") : ""
                  const scText = scArr.length > 0 ? scArr.join(" \\ ") : ""

                  return (
                    <div
                      key={exercise.id || index}
                      className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-200">
                        {exercise.name}
                      </span>
                      {(rxText || scText) && (
                        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {rxText && scText
                            ? `${rxText} (SC: ${scText})`
                            : rxText || scText}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {event.description && (
              <div className="flex items-center gap-2 min-w-0 mt-1 md:mt-0">
                <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                <span className="truncate" title={event.description}>
                  {event.description}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center text-gray-400 pt-1 sm:pt-0">
          <span className="text-xs mr-2 hidden sm:inline-block transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300">
            {isEventExpanded
              ? isAthlete
                ? "Скрыть комплекс"
                : "Скрыть результаты"
              : isAthlete
              ? "Посмотреть комплекс"
              : "Посмотреть результаты"}
          </span>
          {isEventExpanded ? (
            <ChevronUp className="w-5 h-5 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 transition-transform" />
          )}
        </div>
      </div>

      {isEventExpanded && user && (
        isAthlete ? (
          <AthleteEventView
            event={event}
            user={user}
            resultsData={resultsData}
          />
        ) : (
          <EventResultsTable
            team={team}
            event={event}
            membersData={membersData}
            resultsData={resultsData}
          />
        )
      )}
    </div>
  )
}
