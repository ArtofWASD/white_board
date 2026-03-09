import React from "react"
import { Loader } from "../../components/ui/Loader"
import { useTeamActivities } from "./components/useTeamActivities"
import { TeamActivityCard } from "./components/TeamActivityCard"
import { Users, User as UserIcon, Activity } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"
import { PersonalActivity } from "./components/PersonalActivity"
import { AthletesActivity } from "./components/AthletesActivity"

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

  const isTrainerOrAdmin = user?.role === "TRAINER" || user?.role === "SUPER_ADMIN" || user?.role === "ORGANIZATION_ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Активность
        </h1>
      </div>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto justify-start sm:justify-center">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Команды
          </TabsTrigger>
          {isTrainerOrAdmin && (
            <TabsTrigger value="athletes" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Атлеты
            </TabsTrigger>
          )}
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Личная
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          {teams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground whitespace-pre-wrap">
              У вас пока нет активных команд.
            </div>
          ) : (
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
          )}
        </TabsContent>

        {isTrainerOrAdmin && (
          <TabsContent value="athletes">
            <AthletesActivity />
          </TabsContent>
        )}

        <TabsContent value="personal">
          {user && <PersonalActivity userId={user.id} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TeamActivities
