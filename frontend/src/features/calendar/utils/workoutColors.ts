import { Workout } from "@/features/workouts/components/WorkoutCard"

export const getWorkoutColorClass = (type: Workout["type"]) => {
  switch (type) {
    case "AMRAP":
      return "bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/20"
    case "EMOM":
      return "bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20"
    case "FOR_TIME":
      return "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20"
    case "WEIGHTLIFTING":
      return "bg-purple-500/10 text-purple-700 border-purple-200 hover:bg-purple-500/20"
    default:
      return "bg-slate-500/10 text-slate-700 border-slate-200 hover:bg-slate-500/20"
  }
}
