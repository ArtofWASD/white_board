import { z } from "zod"

export const updateEmailSchema = z.object({
  email: z.string().email("Введите корректный email"),
})

export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(6, "Подтвердите новый пароль"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
