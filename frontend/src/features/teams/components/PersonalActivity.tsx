import React, { useEffect, useState } from "react"
import { StrengthWorkoutResult } from "../../../types"
import { strengthResultsApi } from "../../../lib/api/users"
import { StrengthProgressTable } from "./StrengthProgressTable"
import { Loader } from "../../../components/ui/Loader"

interface PersonalActivityProps {
  userId: string
}

export const PersonalActivity: React.FC<PersonalActivityProps> = ({ userId }) => {
  const [results, setResults] = useState<StrengthWorkoutResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        const data = await strengthResultsApi.getUserResults(userId)
        setResults(data)
      } catch (error) {
        console.error("Error fetching personal strength results:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchResults()
    }
  }, [userId])

  if (isLoading) return <Loader />

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Мой прогресс в силовых</h2>
      <StrengthProgressTable results={results} />
    </div>
  )
}
