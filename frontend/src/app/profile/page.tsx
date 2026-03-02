"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import Cropper from "react-easy-crop"
import getCroppedImg from "../../utils/cropImage"
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Cropper states
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropping, setIsCropping] = useState(false)

  // Ref for hidden file input
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleAvatarIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Read the file as a data URL to show in the cropper
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrc(reader.result?.toString() || null)
      setIsCropping(true)
    })
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return

    setIsUploadingAvatar(true)
    try {
      // Get the cropped image blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedBlob) {
        throw new Error("Не удалось обрезать изображение")
      }

      // Create a File from the Blob
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })

      // Upload
      const { authApi } = await import("../../lib/api/auth")
      const response = await authApi.uploadAvatar(user.id, file)

      if (response && response.avatarUrl) {
        updateUser({ ...user, avatarUrl: response.avatarUrl })
        success("Аватар успешно обновлен")
      } else {
        toastError("Не удалось обновить аватар")
      }
    } catch (error) {
      toastError("Внутренняя ошибка при загрузке аватара")
      console.error(error)
    } finally {
      setIsUploadingAvatar(false)
      setIsCropping(false)
      setImageSrc(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCancelCrop = () => {
    setIsCropping(false)
    setImageSrc(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Настройки профиля
        </h1>
        <Link href="/dashboard">
          <Button variant="outline">Назад в панель управления</Button>
        </Link>
      </div>

      {/* Настройка Аватара */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-6">
        <div
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center cursor-pointer group flex-shrink-0 border border-gray-200 dark:border-gray-600"
          onClick={handleAvatarIconClick}>
          {isUploadingAvatar ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <svg
                className="animate-spin h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : null}

          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt="User Avatar"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="font-bold text-4xl sm:text-5xl text-white">
              {user.name.charAt(0)}
              {user.lastName ? user.lastName.charAt(0) : ""}
            </span>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-white mb-1">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
            <span className="text-white text-xs font-medium px-2 text-center">
              Изменить
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {user.name} {user.lastName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">
            Роль: {user.role.toLowerCase().replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Настройки Email */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Email</h3>
          {!isEmailEditing && (
            <Button
              variant="ghost"
              onClick={() => {
                resetEmail({ email: user.email })
                setIsEmailEditing(true)
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20">
              Изменить
            </Button>
          )}
        </div>

        {isEmailEditing ? (
          <form onSubmit={handleSubmitEmail(onUpdateEmail)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Новый Email
              </label>
              <input
                type="email"
                {...registerEmail("email")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  emailErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:bg-gray-700 dark:text-white"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-900/40"
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
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
        )}
      </div>

      {/* Настройки пароля */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Пароль</h3>
          {!isPasswordEditing && (
            <Button
              variant="ghost"
              onClick={() => setIsPasswordEditing(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20">
              Изменить
            </Button>
          )}
        </div>

        {isPasswordEditing ? (
          <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Текущий пароль
              </label>
              <input
                type="password"
                {...registerPassword("currentPassword")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  passwordErrors.currentPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:bg-gray-700 dark:text-white"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-900/40"
                }`}
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Новый пароль
              </label>
              <input
                type="password"
                {...registerPassword("newPassword")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  passwordErrors.newPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:bg-gray-700 dark:text-white"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-900/40"
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Подтвердите новый пароль
              </label>
              <input
                type="password"
                {...registerPassword("confirmPassword")}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 transition-all outline-none ${
                  passwordErrors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:bg-gray-700 dark:text-white"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-900/40"
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
          <p className="text-gray-600 dark:text-gray-400">••••••••••••</p>
        )}
      </div>

      {/* Флаги функций - Скрыть для администратора организации */}
      {user.role !== "ORGANIZATION_ADMIN" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Настройки интерфейса
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Тёмная тема</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Переключить между светлой и тёмной темой интерфейса
                </p>
              </div>
              <Switch checked={flags.darkMode} onChange={() => toggleFlag("darkMode")} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Прогресс упражнений
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <h4 className="font-medium text-gray-900 dark:text-white">Трекер веса</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Калькулятор 5/3/1
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Texas Method (Техасский метод)
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Калькулятор по методике Марка Риппто
                </p>
              </div>
              <Switch
                checked={flags.texasMethodCalculator}
                onChange={() => toggleFlag("texasMethodCalculator")}
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Общий виджет калькуляторов
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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

      {/* Модальное окно для обрезки */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 flex flex-col items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Выберите область аватара
            </h3>

            <div className="relative w-full h-64 sm:h-80 bg-black rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="w-full mt-6">
              <label className="text-sm text-gray-400 font-medium mb-2 block">
                Масштаб
              </label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex space-x-4 mt-6 w-full justify-end">
              <Button variant="ghost" onClick={handleCancelCrop}>
                Отмена
              </Button>
              <Button onClick={handleUploadCroppedImage} disabled={isUploadingAvatar}>
                {isUploadingAvatar ? "Загрузка..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
