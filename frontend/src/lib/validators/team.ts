import { z } from "zod"

export const createTeamSchema = z.object({
  name: z.string().min(3, "Название команды должно содержать минимум 3 символа"),
  description: z.string().optional(),
})

export type CreateTeamFormData = z.infer<typeof createTeamSchema>
