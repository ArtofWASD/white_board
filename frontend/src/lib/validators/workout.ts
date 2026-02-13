import { z } from "zod"

export const addResultSchema = z.object({
  resultValue: z.string().min(1, "Введите результат"),
  scaling: z.enum(["RX", "SCALED"]),
  comment: z.string().optional(),
})

export type AddResultFormData = z.infer<typeof addResultSchema>
