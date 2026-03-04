import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useEffect } from "react"
import { eventsApi } from "@/lib/api/events"
import { Workout } from "@/features/workouts/components/WorkoutCard"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  workoutFormSchema,
  WorkoutFormValues,
} from "@/features/workouts/schemas/workoutFormSchema"
import { WorkoutFormFields } from "@/features/workouts/components/WorkoutFormFields"
import { ExerciseSubForm } from "@/features/workouts/components/ExerciseSubForm"
import { AlertCircle } from "lucide-react"

interface EditWorkoutModalProps {
  workout: Workout
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditWorkoutModal({
  workout,
  isOpen,
  onClose,
  onSuccess,
}: EditWorkoutModalProps) {
  const { user } = useAuthStore()

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      title: "",
      date: "",
      scheduledTime: "09:00",
      scheme: "FOR_TIME",
      timeCap: "",
      rounds: "",
      description: "",
      exercises: [],
    },
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const exercisesFieldArray = useFieldArray({
    control,
    name: "exercises",
  })

  const fetchFullEvent = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fullEvent: any = await eventsApi.getEvent(workout.id)
      if (fullEvent) {
        let eventDate = ""
        let eventTime = "09:00"

        const rawDate = fullEvent.eventDate || fullEvent.date
        if (rawDate) {
          const d = new Date(rawDate)
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, "0")
            const day = String(d.getDate()).padStart(2, "0")
            eventDate = `${year}-${month}-${day}`

            const hours = String(d.getHours()).padStart(2, "0")
            const minutes = String(d.getMinutes()).padStart(2, "0")
            eventTime = `${hours}:${minutes}`
          } else {
            eventDate = typeof rawDate === "string" ? rawDate.split("T")[0] : rawDate
          }
        }

        reset({
          title: fullEvent.title || workout.title || "",
          date: eventDate,
          scheduledTime: eventTime,
          scheme:
            fullEvent.scheme || fullEvent.exerciseType || workout.type || "FOR_TIME",
          timeCap: fullEvent.timeCap || workout.timeCap || "",
          rounds: fullEvent.rounds || workout.rounds || "",
          description: fullEvent.description || workout.description || "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exercises: fullEvent.exercises || (workout as any).exercises || [],
        })
      }
    } catch (error) {
      console.error("Failed to fetch full event details for editing:", error)
    }
  }

  useEffect(() => {
    if (isOpen && workout) {
      let initialDate = ""
      let initialTime = "09:00"

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawDate = (workout as any).eventDate || workout.date
      if (rawDate) {
        const d = new Date(rawDate)
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, "0")
          const day = String(d.getDate()).padStart(2, "0")
          initialDate = `${year}-${month}-${day}`
          const hours = String(d.getHours()).padStart(2, "0")
          const minutes = String(d.getMinutes()).padStart(2, "0")
          if (hours !== "00" || minutes !== "00") {
            initialTime = `${hours}:${minutes}`
          } else if (workout.scheduledTime) {
            initialTime = workout.scheduledTime
          }
        } else {
          initialDate = typeof rawDate === "string" ? rawDate.split("T")[0] : rawDate
        }
      }

      reset({
        title: workout.title || "",
        date: initialDate,
        scheduledTime: initialTime,
        scheme: workout.type || "FOR_TIME",
        timeCap: workout.timeCap || "",
        rounds: workout.rounds || "",
        description: workout.description || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exercises: (workout as any).exercises || [],
      })

      fetchFullEvent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, workout, reset])

  const onSubmitForm = async (data: WorkoutFormValues) => {
    try {
      const dateTime = new Date(`${data.date}T${data.scheduledTime}:00`).toISOString()

      const payload = {
        userId: workout.userId || user?.id || "",
        title: data.title.trim(),
        eventDate: dateTime,
        exerciseType: data.scheme,
        exercises: data.exercises,
        timeCap: data.timeCap,
        rounds: data.rounds,
        description: data.description,
        scheme: data.scheme,
      }

      await eventsApi.updateEvent(workout.id, payload)
      onSuccess()
      onClose()
    } catch (error: Error | unknown) {
      console.error("Failed to update event:", error)
      const msg =
        error instanceof Error ? error.message : "Ошибка при сохранении изменений"
      form.setError("root", { message: msg })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl max-h-[90vh] overflow-y-auto gap-0 p-0 flex flex-col max-sm:bottom-auto max-sm:top-[40%] max-sm:translate-y-[-50%] bg-[var(--card)]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Редактировать тренировку</DialogTitle>
          <div className="sr-only">Редактирование свойств тренировки</div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          noValidate
          className="flex flex-col flex-1 overflow-y-auto">
          {errors.root && (
            <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-md flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{errors.root.message}</p>
            </div>
          )}

          <div className="p-6 pt-4 flex-1 overflow-y-auto space-y-4">
            <WorkoutFormFields form={form} />
            <ExerciseSubForm form={form} exercisesFieldArray={exercisesFieldArray} />
          </div>

          <DialogFooter className="p-4 border-t dark:border-gray-700 bg-muted/20 dark:bg-gray-900/20">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
              className="min-h-[48px] h-12 text-base dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
              Отмена
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="min-h-[48px] h-12 text-base border-black text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:bg-gray-800 dark:hover:bg-gray-700 bg-transparent transition-colors"
              disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
