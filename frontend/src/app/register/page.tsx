"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "../../lib/store/useAuthStore"
import Button from "../../components/ui/Button"
import SuccessModal from "../../components/ui/SuccessModal"
import ErrorDisplay from "../../components/ui/ErrorDisplay"
import { logApiError } from "../../lib/logger"
import { registerSchema, RegisterFormData } from "../../lib/validators/auth"

function RegisterForm() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get("inviteCode")
  const { register: registerUser, isAuthenticated, isLoading } = useAuthStore()

  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Settings state
  const [settings, setSettings] = useState<Record<string, boolean>>({})
  const [loadingSettings, setLoadingSettings] = useState(true)

  // Initialize form
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "individual",
      role: "ATHLETE",
      gender: "MALE",
      isOrganizationTrainer: false,
      acceptTerms: false,
    },
    mode: "onChange",
  })

  // Watch values for conditional rendering and validaton
  const userType = watch("userType")
  const role = watch("role")
  const gender = watch("gender")
  const isOrganizationTrainer = watch("isOrganizationTrainer")

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public")
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (e) {
        logApiError("/api/settings/public", e)
      } finally {
        setLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [])

  // Redirect if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && !showSuccessModal) {
      if (inviteCode) {
        router.push(`/invite/${inviteCode}`)
      } else {
        router.push("/")
      }
    }
  }, [isAuthenticated, router, showSuccessModal, isLoading, inviteCode])

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Загрузка...
      </div>
    )
  }

  if (settings["MAINTENANCE_MODE"]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Техническое обслуживание
          </h2>
          <p className="text-gray-600">
            В данный момент регистрация недоступна. Пожалуйста, попробуйте позже.
          </p>
          <Button href="/" variant="outline" className="mt-6">
            На главную
          </Button>
        </div>
      </div>
    )
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = []

    if (step === 1) {
      fieldsToValidate = ["email", "password", "confirmPassword"]
    } else if (step === 2) {
      fieldsToValidate = ["name", "lastName", "gender"]
    }

    const isStepValid = await trigger(fieldsToValidate)

    if (isStepValid) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const success = await registerUser(
        data.name,
        data.email,
        data.password,
        data.role,
        data.gender,
        data.userType,
        data.lastName || "",
        data.organizationName || "",
      )

      if (!success) {
        setError("root", {
          message: "Не удалось зарегистрироваться. Попробуйте еще раз.",
        })
      } else {
        setShowSuccessModal(true)
      }
    } catch (error) {
      setError("root", { message: "Произошла ошибка при регистрации" })
    }
  }

  if (isLoading || (isAuthenticated && !showSuccessModal)) {
    return null
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= item ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
            {item}
          </div>
          {item < 3 && (
            <div className={`w-12 h-1 ${step > item ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )

  const getImageForStep = () => {
    switch (step) {
      case 1:
        return "/register_pic_1.jpg"
      case 2:
        return "/register_pic_2.jpg"
      case 3:
        return "/register_pic_3.jpg"
      default:
        return "/register_pic_1.jpg"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl flex flex-col md:flex-row p-2">
        {/* Левая сторона - Изображение */}
        <div className="hidden md:block md:w-1/2 relative min-h-[500px] rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0">
              <Image
                src={getImageForStep()}
                alt={`Registration Step ${step}`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Правая сторона - Форма */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center overflow-hidden">
          <h2 className="text-3xl font-bold text-center mb-6">Регистрация</h2>

          {renderStepIndicator()}

          <ErrorDisplay
            error={errors.root?.message || ""}
            onClose={() => setError("root", { message: "" })}
            className="mb-6"
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Данные аккаунта</h3>
                    <p className="text-gray-600 text-sm">
                      Начните свой путь к успеху сегодня.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-gray-700 font-medium mb-2">
                      Пароль
                    </label>
                    <input
                      type="password"
                      id="password"
                      {...register("password")}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-gray-700 font-medium mb-2">
                      Подтвердите пароль
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      {...register("confirmPassword")}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Личные данные</h3>
                    <p className="text-gray-600 text-sm">
                      Расскажите нам немного о себе.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-gray-700 font-medium mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register("name")}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-gray-700 font-medium mb-2">
                      Фамилия
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      {...register("lastName")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Пол</label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="MALE"
                          {...register("gender")}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Мужской</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="FEMALE"
                          {...register("gender")}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Женский</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Выберите цель</h3>
                    <p className="text-gray-600 text-sm">
                      Как вы планируете использовать сервис?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Карточка атлета */}
                    {settings["REGISTRATION_ATHLETE"] !== false && (
                      <div
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          role === "ATHLETE" && userType === "individual"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          setValue("role", "ATHLETE")
                          setValue("userType", "individual")
                        }}>
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              role === "ATHLETE" && userType === "individual"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                            }`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Я Атлет</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Хочу вести дневник тренировок, следить за прогрессом и
                              достигать целей.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Карточка тренера */}
                    {settings["REGISTRATION_TRAINER"] !== false && (
                      <div
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          role === "TRAINER" && userType === "individual"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          setValue("role", "TRAINER")
                          setValue("userType", "individual")
                        }}>
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              role === "TRAINER" && userType === "individual"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                            }`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Я Тренер</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Тренирую клиентов, составляю программы и сам занимаюсь
                              спортом.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Карточка организации */}
                    {settings["REGISTRATION_ORGANIZATION"] !== false && (
                      <div
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          userType === "organization"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          setValue("role", "ORGANIZATION_ADMIN")
                          setValue("isOrganizationTrainer", false)
                          setValue("userType", "organization")
                        }}>
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              userType === "organization"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                            }`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Организация / Клуб
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Управление штатом тренеров, группами спортсменов и
                              аналитикой клуба.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {userType === "organization" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="organizationName"
                          className="block text-gray-700 font-medium mb-2">
                          Название организации
                        </label>
                        <input
                          type="text"
                          id="organizationName"
                          {...register("organizationName")}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.organizationName ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Например: Спортивный клуб 'Олимп'"
                        />
                        {errors.organizationName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.organizationName.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          id="is-trainer"
                          type="checkbox"
                          {...register("isOrganizationTrainer")}
                          onChange={(e) => {
                            setValue("isOrganizationTrainer", e.target.checked)
                            setValue(
                              "role",
                              e.target.checked ? "TRAINER" : "ORGANIZATION_ADMIN",
                            )
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="is-trainer"
                          className="ml-2 block text-sm text-gray-900">
                          Я также являюсь тренером (хочу вести клиентов)
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* Чекбокс согласия на обработку персональных данных */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start">
                      <input
                        id="accept-terms"
                        type="checkbox"
                        {...register("acceptTerms")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 flex-shrink-0"
                      />
                      <label
                        htmlFor="accept-terms"
                        className="ml-3 block text-sm text-gray-700">
                        Я принимаю условия{" "}
                        <a
                          href="/docs/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline">
                          Пользовательского соглашения
                        </a>{" "}
                        и даю согласие на обработку персональных данных в соответствии с{" "}
                        <a
                          href="/docs/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline">
                          Политикой конфиденциальности
                        </a>
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-red-500 text-xs mt-1 ml-7">
                        {errors.acceptTerms.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="primary"
                  className="flex-1">
                  Назад
                </Button>
              )}

              {step < 3 ? (
                <Button
                  key="next-btn"
                  type="button"
                  onClick={handleNext}
                  variant="primary"
                  className="flex-1">
                  Далее
                </Button>
              ) : (
                <Button
                  key="submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  className="flex-1">
                  {isSubmitting ? "Обработка..." : "Зарегистрироваться"}
                </Button>
              )}
            </div>

            {/* Текст согласия на 1-м шаге */}
            {step === 1 && (
              <p className="mt-3 text-xs text-gray-500 text-center">
                Нажимая «Далее», вы соглашаетесь с условиями{" "}
                <a
                  href="/docs/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 underline">
                  Пользовательского соглашения
                </a>{" "}
                и даете{" "}
                <a
                  href="/docs/consent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 underline">
                  Согласие на обработку персональных данных
                </a>
              </p>
            )}
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{" "}
              <Button href="/login" variant="link" className="font-medium p-0 h-auto">
                Войдите
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          Загрузка...
        </div>
      }>
      <RegisterForm />
    </Suspense>
  )
}
