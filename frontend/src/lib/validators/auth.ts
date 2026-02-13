import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
    lastName: z.string().optional(),
    email: z.string().email("Введите корректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    role: z.enum(["TRAINER", "ATHLETE", "ORGANIZATION_ADMIN"]),
    gender: z.enum(["MALE", "FEMALE"]),
    userType: z.enum(["individual", "organization"]),
    organizationName: z.string().optional(),
    isOrganizationTrainer: z.boolean().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message:
        "Необходимо принять условия Пользовательского соглашения и дать согласие на обработку персональных данных",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.userType === "organization") {
        return !!data.organizationName && data.organizationName.length > 0
      }
      return true
    },
    {
      message: "Пожалуйста, введите название организации",
      path: ["organizationName"],
    },
  )

export type RegisterFormData = z.infer<typeof registerSchema>
