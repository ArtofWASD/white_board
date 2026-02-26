import { z } from "zod"

export const addResultSchema = z.object({
  resultValue: z.string().optional(),
  scaling: z.enum(["RX", "SCALED"]),
  comment: z.string().optional(),
  completed: z.boolean().default(false),
})

export type AddResultFormData = z.infer<typeof addResultSchema>
