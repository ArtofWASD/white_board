import React, { useEffect, useState } from "react"
import { User, StrengthWorkoutResult } from "../../../types"
import { usersApi, strengthResultsApi } from "../../../lib/api/users"
import { StrengthProgressTable } from "./StrengthProgressTable"
import { Loader } from "../../../components/ui/Loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

export const AthletesActivity: React.FC = () => {
  const [athletes, setAthletes] = useState<User[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("")
  const [results, setResults] = useState<StrengthWorkoutResult[]>([])
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(true)
  const [isLoadingResults, setIsLoadingResults] = useState(false)

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setIsLoadingAthletes(true)
        const data = await usersApi.getAthletes()
        setAthletes(data)
      } catch (error) {
        console.error("Error fetching athletes:", error)
      } finally {
        setIsLoadingAthletes(false)
      }
    }

    fetchAthletes()
  }, [])

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
