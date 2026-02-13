import { Timer, Repeat } from "lucide-react"
import { Workout } from "./WorkoutCard"

interface WorkoutQuickViewProps {
  workout: Workout
}

export function WorkoutQuickView({ workout }: WorkoutQuickViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold leading-none text-foreground">{workout.title}</h4>
      </div>

      <div className="text-sm text-muted-foreground">
        {workout.description && (
          <p className="mb-2 line-clamp-2">{workout.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {workout.movements.slice(0, 3).map((movement, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            <span>{movement}</span>
          </div>
        ))}
        {workout.movements.length > 3 && (
          <span className="text-xs text-muted-foreground italic pl-3.5">
            +{workout.movements.length - 3} more...
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-4 border-t pt-2 text-xs text-muted-foreground">
        {workout.timeCap && (
          <div className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            <span>{workout.timeCap}</span>
          </div>
        )}
        {workout.rounds && (
          <div className="flex items-center gap-1">
            <Repeat className="h-3 w-3" />
            <span>{workout.rounds}</span>
          </div>
        )}
      </div>
    </div>
  )
}
