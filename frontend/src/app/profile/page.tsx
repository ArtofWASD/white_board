"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useFeatureFlagStore } from "../../lib/store/useFeatureFlagStore"
import { useToast } from "../../lib/context/ToastContext"
import Button from "../../components/ui/Button"
import { Switch } from "../../components/ui/Switch"
import {
  updateEmailSchema,
  updatePasswordSchema,
  UpdateEmailFormData,
  UpdatePasswordFormData,
} from "../../lib/validators/profile"

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { flags, toggleFlag } = useFeatureFlagStore()
  const { success, error: toastError } = useToast()

  // State for toggling edit mode
  const [isEmailEditing, setIsEmailEditing] = useState(false)
  const [isPasswordEditing, setIsPasswordEditing] = useState(false)

  // Email Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
    reset: resetEmail,
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      email: user?.email || "",
    },
  })

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  })

  const onUpdateEmail = async (data: UpdateEmailFormData) => {
    if (!user) return

    try {
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      const responseData = await response.json()

      if (response.ok && responseData.user) {
        updateUser(responseData.user)
        setIsEmailEditing(false)
        success("Email успешно обновлен")
      } else {
        toastError(
          `Не удалось обновить email: ${responseData.message || "Неизвестная ошибка"}`,
        )
      }
    } catch (error) {
      toastError("Ошибка при обновлении email")
    }
  }

  const onUpdatePassword = async (data: UpdatePasswordFormData) => {
    if (!user) return

    try {
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: data.newPassword,
          currentPassword: data.currentPassword,
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        setIsPasswordEditing(false)
        resetPassword()
        success("Пароль успешно обновлен")
      } else {
        toastError(
          `Не удалось обновить пароль: ${responseData.message || "Неизвестная ошибка"}`,
        )
      }
    } catch (error) {
      toastError("Ошибка при обновлении пароля")
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="mb-4">
          Вы должны войти в систему, чтобы просматривать эту страницу.
        </p>
        <Link href="/" className="text-blue-500 hover:text-blue-700 font-medium">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Настройки профиля</h1>
        <Link href="/dashboard">
          <Button variant="outline">Назад в панель управления</Button>
        </Link>
      </div>

      {/* Настройки Email */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Email</h3>
          {!isEmailEditing && (
            <Button
              variant="ghost"
              onClick={() => {
                resetEmail({ email: user.email })
                setIsEmailEditing(true)
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Изменить
            </Button>
          )}
        </div>

        {isEmailEditing ? (
          <form onSubmit={handleSubmitEmail(onUpdateEmail)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Новый Email
              </label>
              <input
                type="email"
                {...registerEmail("email")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  emailErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              {emailErrors.email && (
                <p className="text-red-500 text-xs mt-1">{emailErrors.email.message}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isEmailSubmitting}>
                {isEmailSubmitting ? "Сохранение..." : "Сохранить изменения"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEmailEditing(false)
                  resetEmail({ email: user.email })
                }}>
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">{user.email}</p>
        )}
      </div>

      {/* Настройки пароля */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Пароль</h3>
          {!isPasswordEditing && (
            <Button
              variant="ghost"
              onClick={() => setIsPasswordEditing(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Изменить
            </Button>
          )}
        </div>

        {isPasswordEditing ? (
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Текущий пароль
              </label>
              <input
                type="password"
                {...registerPassword("currentPassword")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  passwordErrors.currentPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Новый пароль
              </label>
              <input
                type="password"
                {...registerPassword("newPassword")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  passwordErrors.newPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Подтвердите новый пароль
              </label>
              <input
                type="password"
                {...registerPassword("confirmPassword")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  passwordErrors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? "Обновление..." : "Обновить пароль"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsPasswordEditing(false)
                  resetPassword()
                }}>
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">••••••••••••</p>
        )}
      </div>

      {/* Флаги функций - Скрыть для администратора организации */}
      {user.role !== "ORGANIZATION_ADMIN" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Настройки интерфейса</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Прогресс упражнений</h4>
                <p className="text-sm text-gray-500">
                  Показывать блок с максимальными весами в упражнениях
                </p>
              </div>
              <Switch
                checked={flags.showExerciseTracker}
                onChange={() => toggleFlag("showExerciseTracker")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Трекер веса</h4>
                <p className="text-sm text-gray-500">
                  Показывать график изменения веса тела
                </p>
              </div>
              <Switch
                checked={flags.showWeightTracker}
                onChange={() => toggleFlag("showWeightTracker")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Калькулятор 5/3/1</h4>
                <p className="text-sm text-gray-500">
                  Показывать калькулятор силовых тренировок
                </p>
              </div>
              <Switch
                checked={flags.strengthTrainingCalculator}
                onChange={() => toggleFlag("strengthTrainingCalculator")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Texas Method (Техасский метод)
                </h4>
                <p className="text-sm text-gray-500">
                  Калькулятор по методике Марка Риппто
                </p>
              </div>
              <Switch
                checked={flags.texasMethodCalculator}
                onChange={() => toggleFlag("texasMethodCalculator")}
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 className="font-medium text-gray-900">Общий виджет калькуляторов</h4>
                <p className="text-sm text-gray-500">
                  Объединить все калькуляторы в один виджет
                </p>
              </div>
              <Switch
                checked={flags.showUniversalCalculator}
                onChange={() => toggleFlag("showUniversalCalculator")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
