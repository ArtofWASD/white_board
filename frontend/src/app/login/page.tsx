"use client"

import React, { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "../../lib/store/useAuthStore"
import Button from "../../components/ui/Button"
import ErrorDisplay from "../../components/ui/ErrorDisplay"
import { loginSchema, LoginFormData } from "../../lib/validators/auth"

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const { login, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const inviteCode = searchParams.get("inviteCode")

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = redirect || "/"
    }
  }, [isAuthenticated, router, isLoading, redirect])

  const onSubmit = async (data: LoginFormData) => {
    console.log("Submitting login form:", data.email) // Debug log
    try {
      const success = await login(data.email, data.password)
      if (success) {
        window.location.href = redirect || "/"
      } else {
        setFormError("root", {
          type: "manual",
          message: "Не удалось войти. Пожалуйста, проверьте учетные данные.",
        })
      }
    } catch (error) {
      setFormError("root", {
        type: "manual",
        message: "Произошла ошибка при входе",
      })
    }
  }

  if (isLoading || isAuthenticated) {
    return null // or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-4xl w-full bg-[var(--card)] rounded-3xl shadow-xl flex flex-col md:flex-row p-2">
        {/* Левая сторона - Изображение (Видно на md+) */}
        <div className="hidden md:block md:w-1/2 relative min-h-[500px] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0">
              <Image
                src="/register_pic_1.jpg"
                alt="Login"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Правая сторона - Форма */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center overflow-hidden">
          <h2 className="text-3xl font-bold text-center mb-6 text-foreground">Вход</h2>

          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm">
              Добро пожаловать обратно! Пожалуйста, войдите в свой аккаунт.
            </p>
          </div>

          <ErrorDisplay
            error={errors.root?.message || ""}
            onClose={() => setFormError("root", { message: "" })}
            className="mb-6"
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-foreground font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground color-scheme-inherit ${
                    errors.email ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-foreground font-medium mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground color-scheme-inherit ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
                {isSubmitting ? "Обработка..." : "Войти"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Нет аккаунта?{" "}
              <Button
                href={inviteCode ? `/register?inviteCode=${inviteCode}` : "/register"}
                variant="link"
                className="font-medium p-0 h-auto">
                Зарегистрируйтесь
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          Загрузка...
        </div>
      }>
      <LoginForm />
    </Suspense>
  )
}
