import { z } from "zod"

// Reusable: optional positive number as string (weight, distance)
const optionalPositiveNumber = z
  .string()
  .optional()
  .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Должно быть числом ≥ 0",
  })

// Reusable: optional positive integer as string (reps)
const optionalPositiveInteger = z
  .string()
  .optional()
  .refine((val) => !val || (/^\d+$/.test(val) && Number(val) >= 1), {
    message: "Должно быть целым числом ≥ 1",
  })

const exerciseSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Введите название упражнения")
    .max(100, "Название не должно превышать 100 символов")
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,]+$/, "Недопустимые символы в названии"),
  rxWeight: optionalPositiveNumber,
  rxReps: optionalPositiveInteger,
  rxDistance: optionalPositiveNumber,
  scWeight: optionalPositiveNumber,
  scReps: optionalPositiveInteger,
  scDistance: optionalPositiveNumber,
  // Legacy fields
  weight: optionalPositiveNumber,
  repetitions: optionalPositiveInteger,
})

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Название события должно содержать минимум 3 символа")
    .max(150, "Название не должно превышать 150 символов")
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,!?]+$/, "Недопустимые символы в названии"),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Введите корректную дату",
  }),
  teamId: z.string().optional(),
  exerciseType: z.string().min(1, "Выберите тип упражнения"),
  exercises: z.array(exerciseSchema).optional(),
})

export type CreateEventFormData = z.infer<typeof createEventSchema>

export const exerciseInputSchema = z.object({
  name: z
    .string()
    .min(1, "Введите название упражнения")
    .max(100, "Название не должно превышать 100 символов")
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,]+$/, "Недопустимые символы в названии"),
  rxWeight: optionalPositiveNumber,
  rxReps: optionalPositiveInteger,
  rxDistance: optionalPositiveNumber,
  scWeight: optionalPositiveNumber,
  scReps: optionalPositiveInteger,
  scDistance: optionalPositiveNumber,
})

export type ExerciseInputData = z.infer<typeof exerciseInputSchema>
