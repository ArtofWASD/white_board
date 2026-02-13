import { z } from "zod"

const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Введите название упражнения"),
  rxWeight: z.string().optional(),
  rxReps: z.string().optional(),
  scWeight: z.string().optional(),
  scReps: z.string().optional(),
  // Legacy fields
  weight: z.string().optional(),
  repetitions: z.string().optional(),
})

export const createEventSchema = z.object({
  title: z.string().min(3, "Название события должно содержать минимум 3 символа"),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Введите корректную дату",
  }),
  teamId: z.string().optional(),
  exerciseType: z.string().min(1, "Выберите тип упражнения"),
  exercises: z.array(exerciseSchema).optional(),
})

export type CreateEventFormData = z.infer<typeof createEventSchema>

export const exerciseInputSchema = z.object({
  name: z.string().min(1, "Введите название упражнения"),
  rxWeight: z.string().optional(),
  rxReps: z.string().optional(),
  scWeight: z.string().optional(),
  scReps: z.string().optional(),
})

export type ExerciseInputData = z.infer<typeof exerciseInputSchema>
