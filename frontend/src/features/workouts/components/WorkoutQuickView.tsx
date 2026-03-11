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
        <div className="flex items-center gap-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground whitespace-nowrap">
          {workout.timeCap && <span className="flex items-center gap-0.5"><Timer className="h-3 w-3" /> {workout.timeCap}</span>}
          {workout.rounds && <span className="flex items-center gap-0.5"><Repeat className="h-3 w-3" /> {workout.rounds}</span>}
          <span className={workout.timeCap || workout.rounds ? "border-l border-muted-foreground/30 pl-1.5" : ""}>
            {workout.type === "FOR_TIME"
              ? "На время"
              : workout.type === "WEIGHTLIFTING"
                ? "Т.А."
                : workout.type === "CARDIO"
                  ? "Кардио"
                  : workout.type}
          </span>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {workout.description && (
          <p className="mb-2 line-clamp-2">{workout.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {workout.exercises && workout.exercises.length > 0 ? (
          <>
            {workout.exercises.slice(0, 3).map((ex, idx) => {
              const details = [
                (ex.weight || ex.rxWeight || ex.scWeight) ? `${ex.weight || ex.rxWeight || ex.scWeight}кг` : null,
                (ex.repetitions || ex.rxReps || ex.scReps) ? `${ex.repetitions || ex.rxReps || ex.scReps}повт` : null,
                (ex.rxCalories || ex.scCalories) ? `${ex.rxCalories || ex.scCalories}кал` : null,
                (ex.rxDistance || ex.scDistance) ? `${ex.rxDistance || ex.scDistance}м` : null,
                (ex.rxTime || ex.scTime) ? `${ex.rxTime || ex.scTime}` : null,
              ].filter(Boolean).join(", ");

              return (
                <div key={idx} className="flex items-center gap-2 text-xs truncate">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span className="font-medium shrink-0">{ex.name}</span>
                  {details && (
                    <span className="text-[10px] text-muted-foreground truncate">
                      {details}
                    </span>
                  )}
                </div>
              );
            })}
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

      <div className="opacity-0 hidden"></div>
    </div>
  )
}
