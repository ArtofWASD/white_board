import { Timer, Repeat } from "lucide-react"
import { Workout } from "./WorkoutCard"

interface WorkoutQuickViewProps {
  workout: Workout
}

export function WorkoutQuickView({ workout }: WorkoutQuickViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold leading-tight text-foreground">{workout.title}</h4>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground whitespace-nowrap">
          {workout.type === "FOR_TIME"
            ? "На время"
            : workout.type === "WEIGHTLIFTING"
              ? "Т.А."
              : workout.type === "CARDIO"
                ? "Кардио"
                : workout.type}
        </span>
      </div>

      <div className="text-sm text-muted-foreground">
        {workout.description && (
          <p className="mb-2 line-clamp-2">{workout.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {workout.exercises && workout.exercises.length > 0 ? (
          <>
            {workout.exercises.slice(0, 3).map((ex, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                <span className="truncate">{ex.name}</span>
              </div>
            ))}
            {workout.exercises.length > 3 && (
              <span className="text-[10px] text-muted-foreground italic pl-3.5">
                + ещё {workout.exercises.length - 3}...
              </span>
            )}
          </>
        ) : (
          <>
            {workout.movements.slice(0, 3).map((movement, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                <span className="truncate">{movement}</span>
              </div>
            ))}
            {workout.movements.length > 3 && (
              <span className="text-[10px] text-muted-foreground italic pl-3.5">
                + ещё {workout.movements.length - 3}...
              </span>
            )}
          </>
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
