import { z } from "zod"

export const timerConfigSchema = z.object({
  mode: z.enum(["FOR_TIME", "AMRAP", "EMOM", "TABATA", "INTERVALS"]).optional(),
  // For Time
  timeCapMinutes: z.coerce.number().min(1, "Минимум 1 минута").optional(),
  // AMRAP
  durationMinutes: z.coerce.number().min(1, "Минимум 1 минута").optional(),
  // EMOM
  emomInterval: z.coerce.number().min(10, "Минимум 10 секунд").optional(),
  emomRounds: z.coerce.number().min(1, "Минимум 1 раунд").optional(),
  // Intervals
  workBytes: z.coerce.number().min(5, "Минимум 5 секунд").optional(),
  restBytes: z.coerce.number().min(5, "Минимум 5 секунд").optional(),
  rounds: z.coerce.number().min(1, "Минимум 1 раунд").optional(),
})

export type TimerConfigFormData = z.infer<typeof timerConfigSchema>
