import { z } from "zod"

export const measurementEnum = z.enum(["weight", "calories", "time", "distance"])

export const exerciseSchemaBase = z.object({
  id: z.string(),
  name: z.string(),
  measurement: measurementEnum,
  weight: z.string().optional(),
  repetitions: z.string().optional(),
  scWeight: z.string().optional(),
  scReps: z.string().optional(),
  rxCalories: z.string().optional(),
  scCalories: z.string().optional(),
  rxTime: z.string().optional(),
  scTime: z.string().optional(),
  rxDistance: z.string().optional(),
  scDistance: z.string().optional(),
  rxDistanceWeight: z.string().optional(),
  scDistanceWeight: z.string().optional(),
})

export const exerciseInputSchema = z
  .object({
    exName: z
      .string()
      .min(2, "Минимум 2 символа")
      .max(100, "Не более 100 символов")
      .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,!?/]+$/, "Недопустимые символы"),
    exMeasurement: measurementEnum,
    rxWeight: z.string().optional(),
    rxReps: z.string().optional(),
    scWeight: z.string().optional(),
    scReps: z.string().optional(),
    rxCalories: z.string().optional(),
    scCalories: z.string().optional(),
    rxTime: z.string().optional(),
    scTime: z.string().optional(),
    rxDistance: z.string().optional(),
    scDistance: z.string().optional(),
    rxDistanceWeight: z.string().optional(),
    scDistanceWeight: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Only Rx fields are required; Sc fields are optional
    const isPosNum = (v: string | undefined) =>
      v === undefined || v === "" || (!isNaN(Number(v)) && Number(v) >= 0)
    const isPosInt = (v: string | undefined) =>
      v === undefined || v === "" || (/^\d+$/.test(v) && Number(v) >= 1)

    if (data.exMeasurement === "weight") {
      if (!isPosNum(data.rxWeight))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxWeight"],
        })
      if (!isPosInt(data.rxReps))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число ≥ 1",
          path: ["rxReps"],
        })
    }
    if (data.exMeasurement === "calories") {
      if (!isPosInt(data.rxCalories))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число ≥ 1",
          path: ["rxCalories"],
        })
    }
    if (data.exMeasurement === "time") {
      if (!isPosNum(data.rxTime))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxTime"],
        })
    }
    if (data.exMeasurement === "distance") {
      if (!isPosNum(data.rxDistance))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxDistance"],
        })
      if (!isPosNum(data.rxDistanceWeight))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите число ≥ 0",
          path: ["rxDistanceWeight"],
        })
    }
  })

export const workoutFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Минимум 3 символа")
      .max(150, "Не более 150 символов")
      .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-().,!?/]+$/, "Недопустимые символы"),
    date: z.string().refine(
      (val) => {
        if (!val) return false
        const [year, month, day] = val.split("-").map(Number)
        const selectedDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: "Дата не может быть в прошлом" },
    ),
    scheduledTime: z.string(),
    scheme: z.string(),
    timeCap: z.string().optional(),
    rounds: z.string().optional(),
    description: z.string().max(500, "Не более 500 символов").optional(),
    selectedTeamId: z.string().optional(),
    assignmentType: z.enum(["all", "specific"]).optional(),
    selectedAthletes: z.array(z.string()).optional(),
    exercises: z
      .array(exerciseSchemaBase)
      .min(1, "Необходимо добавить хотя бы 1 упражнение"),
  })
  .superRefine((data, ctx) => {
    if (["FOR_TIME", "AMRAP", "CARDIO"].includes(data.scheme)) {
      if (data.timeCap && !/^\d+$/.test(data.timeCap)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число минут ≥ 1",
          path: ["timeCap"],
        })
      } else if (data.timeCap && Number(data.timeCap) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число минут ≥ 1",
          path: ["timeCap"],
        })
      }
    }
    if (data.scheme === "EMOM" || data.scheme === "FOR_TIME") {
      if (data.rounds && !/^\d+$/.test(data.rounds)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число раундов ≥ 1",
          path: ["rounds"],
        })
      } else if (data.rounds && Number(data.rounds) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите целое число раундов ≥ 1",
          path: ["rounds"],
        })
      }
    }
  })

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>
