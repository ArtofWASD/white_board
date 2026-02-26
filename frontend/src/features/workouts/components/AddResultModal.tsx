import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { eventsApi } from "@/lib/api/events"
import { Loader2 } from "lucide-react"
import { Workout } from "./WorkoutCard"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AddResultFormData, addResultSchema } from "@/lib/validators/workout"
import { useEffect, useState } from "react"
import { EditWorkoutModal } from "./EditWorkoutModal"
import { useToast } from "@/lib/context/ToastContext"
import { Checkbox } from "@/components/ui/checkbox"

interface AddResultModalProps {
  workout: Workout
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddResultModal({
  workout,
  isOpen,
  onClose,
  onSuccess,
}: AddResultModalProps) {
  const { user } = useAuthStore()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AddResultFormData>({
    resolver: zodResolver(addResultSchema),
    defaultValues: {
      resultValue: "",
      scaling: "RX",
      comment: "",
      completed: false,
    },
  })

  const { success: successToast, error: errorToast } = useToast()

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = async (data: AddResultFormData) => {
    if (!user) return

    // Validation: if not EMOM, resultValue is required
    if (workout.type !== "EMOM" && !data.resultValue) {
      errorToast("Пожалуйста, введите результат")
      return
    }

    try {
      const payload: any = {
        username: user.name,
        userId: user.id,
        scaling: data.scaling,
        completed: data.completed,
      }

      // Map according to workout type
      if (workout.type === "FOR_TIME" || workout.type === "CARDIO") {
        payload.time = data.resultValue
      } else if (workout.type === "AMRAP" || workout.type === "WEIGHTLIFTING") {
        payload.value = Number(
          data.resultValue?.replace(",", ".").replace(/[^0-9.]/g, ""),
        )
        // For compatibility, also put string in time
        payload.time = data.resultValue
      } else if (workout.type === "EMOM") {
        payload.completed = data.completed
        // Optional: put "Completed" in time for display
        payload.time = data.completed ? "Выполнено" : "Не выполнено"
      }

      await eventsApi.addResult(workout.id, payload)

      successToast("Результат успешно добавлен")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Failed to add result:", error)
      errorToast("Не удалось добавить результат")
    }
  }

  const handleDeleteWorkout = async () => {
    if (
      !confirm("Вы уверены, что хотите удалить эту тренировку? Это действие необратимо.")
    )
      return

    try {
      await eventsApi.deleteEvent(workout.id, user!.id)
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Failed to delete workout:", error)
      alert("Не удалось удалить тренировку.")
    }
  }

  const getResultLabel = () => {
    switch (workout.type) {
      case "FOR_TIME":
        return "Время (ММ:СС)"
      case "AMRAP":
        return "Количество раундов"
      case "WEIGHTLIFTING":
        return "Результат (Вес или Повторы)"
      case "EMOM":
        return "Статус выполнения"
      case "CARDIO":
        return "Время или Дистанция"
      default:
        return "Результат"
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto max-sm:bottom-auto max-sm:top-[40%] max-sm:translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle>Записать результат</DialogTitle>
          </DialogHeader>

          {workout.exercises && workout.exercises.length > 0 && (
            <div className="mt-4 bg-muted/30 dark:bg-gray-800/50 p-3 rounded-lg border border-border/50 dark:border-gray-700 max-h-40 overflow-y-auto">
              <h4 className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground dark:text-gray-400">
                Упражнения
              </h4>
              <ul className="grid gap-2">
                {workout.exercises.map((exercise, dx) => {
                  const details = []
                  if (exercise.weight && exercise.weight !== "0")
                    details.push(`${exercise.weight} кг.`)
                  if (exercise.repetitions && exercise.repetitions !== "0")
                    details.push(`${exercise.repetitions} пов.`)
                  if (
                    exercise.measurement === "calories" &&
                    exercise.rxCalories &&
                    exercise.rxCalories !== "0"
                  )
                    details.push(`${exercise.rxCalories} кал.`)

                  return (
                    <li key={dx} className="flex items-start gap-2 text-base pb-1">
                      <span className="font-bold text-primary shrink-0 min-w-[24px]">
                        {dx + 1}.
                      </span>
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 flex-1">
                        <span className="font-medium leading-tight">{exercise.name}</span>
                        {details.length > 0 && (
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {details.join(" \\ ")}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resultValue">{getResultLabel()}</Label>
              {workout.type === "EMOM" ? (
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id="completed"
                    checked={watch("completed")}
                    onCheckedChange={(checked: boolean) =>
                      setValue("completed", !!checked)
                    }
                  />
                  <Label
                    htmlFor="completed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    Тренировка выполнена полностью
                  </Label>
                </div>
              ) : (
                <>
                  <Input
                    id="resultValue"
                    {...register("resultValue")}
                    placeholder={
                      workout.type === "FOR_TIME"
                        ? "12:30"
                        : workout.type === "WEIGHTLIFTING"
                          ? "100 кг / 5 пов"
                          : "0"
                    }
                    className={errors.resultValue ? "border-red-500" : ""}
                  />
                  {errors.resultValue && (
                    <p className="text-red-500 text-xs">{errors.resultValue.message}</p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Масштабирование</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="RX"
                    {...register("scaling")}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-bold">RX</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="SCALED"
                    {...register("scaling")}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-muted-foreground">SCALED</span>
                </label>
              </div>
              {errors.scaling && (
                <p className="text-red-500 text-xs">{errors.scaling.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий (опционально)</Label>
              <Textarea
                id="comment"
                {...register("comment")}
                placeholder="Как прошла тренировка?"
              />
              <p className="text-[10px] text-muted-foreground">
                * Комментарии пока не сохраняются в этом интерфейсе
              </p>
            </div>

            <div className="flex justify-end items-center pt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 bg-transparent transition-colors"
                  disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Render EditWorkoutModal inside or next to it? Next to it is better to avoid nesting dialogs. 
          But AddResultModal is a Dialog itself, so we can render it as a sibling in the fragment. */}
      {isEditModalOpen && (
        <EditWorkoutModal
          workout={workout}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false)
            onClose() // Close AddResult too
            if (onSuccess) onSuccess() // Trigger parent refresh
          }}
        />
      )}
    </>
  )
}
