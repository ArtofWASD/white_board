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
import { addResultSchema, AddResultFormData } from "@/lib/validators/workout"
import { useEffect } from "react"

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
    },
  })

  const scaling = watch("scaling")

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = async (data: AddResultFormData) => {
    if (!user) return

    try {
      await eventsApi.addResult(workout.id, {
        username: user.name,
        userId: user.id,
        time:
          workout.type === "FOR_TIME" || workout.type === "EMOM"
            ? data.resultValue
            : undefined,
        value:
          workout.type === "AMRAP" || workout.type === "WEIGHTLIFTING"
            ? Number(data.resultValue)
            : undefined,
        scaling: data.scaling,
      })

      // Note: Comment is currently not supported by addResult API directly in this flow based on schema
      // If we need to add comment, we would need to chain a call to eventsApi.addNote with the result ID
      // but addResult returns the result object so we can do that.

      // Let's defer that for now to keep it simple or strictly follow schema.
      // Ideally we should update addResult endpoint to accept comment.

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Failed to add result:", error)
      // Ideally show error toast
    }
  }

  const getResultLabel = () => {
    switch (workout.type) {
      case "FOR_TIME":
        return "Время (ММ:СС)"
      case "AMRAP":
        return "Количество раундов/повторений"
      case "WEIGHTLIFTING":
        return "Вес (кг)"
      case "EMOM":
        return "Результат" // Generic
      default:
        return "Результат"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Записать результат</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resultValue">{getResultLabel()}</Label>
            <Input
              id="resultValue"
              {...register("resultValue")}
              placeholder={workout.type === "FOR_TIME" ? "12:30" : "0"}
              className={errors.resultValue ? "border-red-500" : ""}
            />
            {errors.resultValue && (
              <p className="text-red-500 text-xs">{errors.resultValue.message}</p>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
