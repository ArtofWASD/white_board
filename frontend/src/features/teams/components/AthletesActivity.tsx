import React, { useEffect, useState } from "react"
import { User, StrengthWorkoutResult, TeamMember } from "../../../types"
import { strengthResultsApi } from "../../../lib/api/users"
import { teamsApi } from "../../../lib/api/teams"
import { StrengthProgressTable } from "./StrengthProgressTable"
import { Loader } from "../../../components/ui/Loader"
import { useAuthStore } from "../../../lib/store/useAuthStore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

export const AthletesActivity: React.FC = () => {
  const { user } = useAuthStore()
  const [athletes, setAthletes] = useState<User[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("")
  const [results, setResults] = useState<StrengthWorkoutResult[]>([])
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(true)
  const [isLoadingResults, setIsLoadingResults] = useState(false)

  useEffect(() => {
    const fetchAthletes = async () => {
      if (!user?.id) return
      try {
        setIsLoadingAthletes(true)
        
        // Для тренеров и админов получаем только атлетов из их команд
        const userTeams = await teamsApi.getUserTeams(user.id)
        
        // Оставляем только те команды, где пользователь - владелец или админ
        const managedTeams = userTeams.filter(t => {
          if (user.role === "SUPER_ADMIN") {
            return !user.organizationId || t.organizationId === user.organizationId
          }
          return (
            t.ownerId === user.id || 
            t.members?.some(m => m.userId === user.id && (m.role === "OWNER" || m.role === "ADMIN"))
          )
        })

        // Собираем всех участников этих команд
        const athletesMap = new Map<string, User>()
        
        await Promise.all(managedTeams.map(async (team) => {
          const members = await teamsApi.getMembers(team.id)
          members.forEach((member: TeamMember) => {
            // Добавляем только атлетов, исключая самого тренера
            if (member.user && member.userId !== user.id) {
              athletesMap.set(member.userId, member.user)
            }
          })
        }))

        // Если это Super Admin, возможно он должен видеть всех? 
        // Но в запросе сказано "только список атлетов в его командах".
        // Придерживаемся фильтрации по командам.
        
        setAthletes(Array.from(athletesMap.values()))
      } catch (error) {
        console.error("Error fetching athletes:", error)
      } finally {
        setIsLoadingAthletes(false)
      }
    }

    fetchAthletes()
  }, [user])

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedAthleteId) return
      try {
        setIsLoadingResults(true)
        const data = await strengthResultsApi.getUserResults(selectedAthleteId)
        setResults(data)
      } catch (error) {
        console.error("Error fetching athlete strength results:", error)
      } finally {
        setIsLoadingResults(false)
      }
    }

    fetchResults()
  }, [selectedAthleteId])

  if (isLoadingAthletes) return <Loader />

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Выберите атлета
        </label>
        <Select value={selectedAthleteId} onValueChange={(v) => setSelectedAthleteId(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите атлета..." />
          </SelectTrigger>
          <SelectContent>
            {athletes.map((athlete) => (
              <SelectItem key={athlete.id} value={athlete.id}>
                {athlete.name} {athlete.lastName || ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAthleteId ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Прогресс атлета</h2>
          {isLoadingResults ? <Loader /> : <StrengthProgressTable results={results} />}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
          Выберите атлета из списка, чтобы увидеть его прогресс.
        </div>
      )}
    </div>
  )
}
