import React from "react"
import { StrengthWorkoutResult } from "../../../types"
import { Card } from "../../../components/ui/Card"

interface StrengthProgressTableProps {
  results: StrengthWorkoutResult[]
}

export const StrengthProgressTable: React.FC<StrengthProgressTableProps> = ({ results }) => {
  // Group results by exercise name
  const exerciseMap: { [key: string]: { [week: number]: StrengthWorkoutResult } } = {}

  results.forEach((result) => {
    const name = result.exercise?.name || "Упражнение"
    if (!exerciseMap[name]) {
      exerciseMap[name] = {}
    }
    exerciseMap[name][result.week] = result
  })

  const exercises = Object.keys(exerciseMap)
  const weeks = [1, 2, 3]

  if (exercises.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Силовые показатели пока не заполнены.
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
          <tr>
            <th className="px-4 py-3">Упражнение</th>
            {weeks.map((week) => (
              <th key={week} className="px-4 py-3 text-center">
                Неделя {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {exercises.map((exerciseName) => (
            <tr key={exerciseName} className="hover:bg-accent/50 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                {exerciseName}
              </td>
              {weeks.map((week) => {
                const result = exerciseMap[exerciseName][week]
                return (
                  <td key={week} className="px-4 py-3 text-center text-muted-foreground">
                    {result ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{result.weight} кг</span>
                        <span className="text-xs">{result.reps} повт.</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
