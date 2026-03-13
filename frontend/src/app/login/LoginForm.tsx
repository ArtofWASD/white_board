"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "../../lib/store/useAuthStore"
import Button from "../../components/ui/Button"
import ErrorDisplay from "../../components/ui/ErrorDisplay"
import YandexCaptcha, { YandexCaptchaRef } from "../../components/ui/YandexCaptcha"
import { loginSchema, LoginFormData } from "../../lib/validators/auth"

interface LoginFormProps {
  captchaKey: string
}

export default function LoginForm({ captchaKey }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const { login, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const inviteCode = searchParams.get("inviteCode")

  const [captchaToken, setCaptchaToken] = useState("")
  const [showResend, setShowResend] = useState(false)
  const captchaRef = useRef<YandexCaptchaRef>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const target = redirect || "/"
      if (window.location.pathname !== target) {
        router.push(target)
      }
    }
  }, [isAuthenticated, router, isLoading, redirect])

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password)
      if (success) {
        router.push(redirect || "/")
      } else {
        setFormError("root", {
          type: "manual",
          message: "Не удалось войти. Пожалуйста, проверьте учетные данные.",
        })
        captchaRef.current?.reset()
        setCaptchaToken("")
      }
    } catch (error: unknown) {
      // Проверяем — 403 означает "email не подтверждён"
      const status = (error as { status?: number })?.status
      if (status === 403) {
        setFormError("root", {
          type: "manual",
          message: "Email не подтверждён. Проверьте почту или запросите новое письмо.",
        })
        setShowResend(true)
      } else {
        setFormError("root", {
          type: "manual",
          message: "Произошла ошибка при входе",
        })
      }
      captchaRef.current?.reset()
      setCaptchaToken("")
    }
  }

  const handleResend = async () => {
    const email = getValues("email")
    if (!email) return
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setFormError("root", {
        type: "manual",
        message: "Письмо отправлено повторно. Проверьте почту.",
      })
    } catch {
      // ignore
    }
  }

  if (isLoading || isAuthenticated) {
    return null
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
            onClose={() => {
              setFormError("root", { message: "" })
              setShowResend(false)
            }}
            className="mb-4"
          />

          {/* Кнопка повторной отправки письма */}
          {showResend && (
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-primary underline hover:opacity-80 transition-opacity">
                Отправить письмо повторно
              </button>
            </div>
          )}

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

              {/* Яндекс SmartCaptcha */}
              <div className="flex justify-center pt-2">
                <YandexCaptcha
                  ref={captchaRef}
                  sitekey={captchaKey}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken("")}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !captchaToken}
                className="w-full mt-2">
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
