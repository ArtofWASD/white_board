import React from "react"
import { StrengthWorkoutResult } from "../../../types"
import { Card } from "../../../components/ui/Card"

interface StrengthProgressTableProps {
  results: StrengthWorkoutResult[]
}

export const StrengthProgressTable: React.FC<StrengthProgressTableProps> = ({
  results,
}) => {
  // 1. Group results by exercise and then cluster into cycles
  type CycleResult = {
    [week: number]: StrengthWorkoutResult
  }

  const exerciseCycles: { [exerciseName: string]: CycleResult[] } = {}

  // Determine calculator type (use the most frequent one if mixed)
  const calcTypeCounts: { [key: string]: number } = {}

  // Sort results by date to process them in order
  const sortedResults = [...results].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  sortedResults.forEach((result) => {
    const name = result.exercise?.name || "Упражнение"
    if (!exerciseCycles[name]) {
      exerciseCycles[name] = [{}]
    }

    // Find a cycle where this week is not yet filled
    let cycle = exerciseCycles[name].find((c) => !c[result.week])
    if (!cycle) {
      // If all existing cycles have this week, create a new cycle
      cycle = {}
      exerciseCycles[name].push(cycle)
    }
    cycle[result.week] = result

    // Collecting calculator types
    if (result.calculatorType) {
      calcTypeCounts[result.calculatorType] = (calcTypeCounts[result.calculatorType] || 0) + 1
    }
  })

  const mainCalculatorType = Object.entries(calcTypeCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0]

  const exercises = Object.keys(exerciseCycles)
  const weeks = [1, 2, 3]

  // 2. Logic for "Current Results" (Last completed cycles)
  const completedCycles: {
    period: string
    name: string
    maxWeight: number
    reps: number
    lastDate: Date
  }[] = []

  exercises.forEach((name) => {
    exerciseCycles[name].forEach((cycle) => {
      const isCompleted = weeks.every((w) => cycle[w])
      if (isCompleted) {
        const dates = weeks.map((w) => new Date(cycle[w].date).getTime())
        const lastDate = new Date(Math.max(...dates))
        const firstDate = new Date(Math.min(...dates))

        const period = `${firstDate.toLocaleDateString("ru-RU", { day: "numeric", month: "numeric" })} - ${lastDate.toLocaleDateString("ru-RU", { day: "numeric", month: "numeric" })}`

        // Find max weight in this cycle
        const maxWeight = Math.max(...weeks.map((w) => cycle[w].weight))
        const maxResult = weeks.find((w) => cycle[w].weight === maxWeight) || 3

        completedCycles.push({
          period,
          name,
          maxWeight,
          reps: cycle[maxResult].reps,
          lastDate,
        })
      }
    })
  })

  // Sort by date descending and take only the latest cycle for each exercise
  const latestCompletedByExercise: { [name: string]: (typeof completedCycles)[0] } = {}
  completedCycles.forEach((c) => {
    if (!latestCompletedByExercise[c.name] || c.lastDate > latestCompletedByExercise[c.name].lastDate) {
      latestCompletedByExercise[c.name] = c
    }
  })

  // Group latest cycles by period for consolidated rows
  const periodsMap: { [period: string]: (typeof completedCycles)[0][] } = {}
  Object.values(latestCompletedByExercise).forEach((c) => {
    if (!periodsMap[c.period]) {
      periodsMap[c.period] = []
    }
    periodsMap[c.period].push(c)
  })

  const sortedPeriods = Object.keys(periodsMap).sort((a, b) => {
    // Basic sort by period string (should work for dd.mm format mostly)
    return b.localeCompare(a)
  })

  if (exercises.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Силовые показатели пока не заполнены.
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Table (showing only the latest status for each exercise) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center justify-between">
          <span>Прогресс силовых</span>
          {mainCalculatorType && (
            <span className="text-xs font-medium text-foreground bg-muted px-3 py-1 rounded-full border border-border">
              {mainCalculatorType}
            </span>
          )}
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
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
              {exercises.map((exerciseName) => {
                // Show the most recent cycle in the main table
                const cycles = exerciseCycles[exerciseName]
                const currentCycle = cycles[cycles.length - 1]

                return (
                  <tr key={exerciseName} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{exerciseName}</td>
                    {weeks.map((week) => {
                      const result = currentCycle[week]

                      const getRepsColorClass = (reps: number, week: number) => {
                        if (reps === 0) return "text-red-600 dark:text-red-400 font-medium"

                        let target = 0
                        if (week === 1) target = 5
                        else if (week === 2) target = 3
                        else if (week === 3) target = 1
                        else return "text-muted-foreground"

                        if (reps >= target) return "text-green-600 dark:text-green-400 font-medium"
                        if (reps === target - 1)
                          return "text-yellow-600 dark:text-yellow-500 font-medium"
                        return "text-red-600 dark:text-red-400 font-medium"
                      }

                      return (
                        <td key={week} className="px-4 py-3 text-center text-muted-foreground">
                          {result ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">{result.weight} кг</span>
                              <span className={`text-xs ${getRepsColorClass(result.reps, week)}`}>
                                {result.reps} повт.
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Results Table - Moved to Bottom, Single Row combining all exercises */}
      {sortedPeriods.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Текущие результаты
            <span className="text-xs font-normal text-muted-foreground">
              (Максимальные веса последнего завершенного цикла)
            </span>
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm p-4">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {Object.values(latestCompletedByExercise).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 py-1.5 px-3 bg-muted/40 rounded-md border border-border/50">
                  <span className="font-bold text-foreground">{item.name}:</span>
                  <span className="text-foreground font-black">{item.maxWeight}кг</span>
                  <span className="text-muted-foreground text-xs">({item.reps} повт.)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
