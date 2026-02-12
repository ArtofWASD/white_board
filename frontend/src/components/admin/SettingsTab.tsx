import React, { useEffect, useState } from "react"
import { logApiError } from "../../lib/logger"

import { adminApi } from "../../lib/api/admin"

export const SettingsTab: React.FC = () => {
  // const { token } = useAuthStore() // Token no longer needed
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loadingSettings, setLoadingSettings] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true)
      try {
        const data = await adminApi.getSettings()
        if (data) {
          // Преобразование массива в объект
          const settingsMap: Record<string, string> = {}
          data.forEach((s: any) => (settingsMap[s.key] = s.value))
          setSettings(settingsMap)
        }
      } catch (e) {
        logApiError("/api/settings", e)
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchSettings()
  }, []) // Removed token dependency

  const handleUpdateSetting = async (key: string, value: string) => {
    // Оптимистичное обновление
    setSettings((prev) => ({ ...prev, [key]: value }))

    try {
      await adminApi.updateSetting(key, value)
    } catch (e) {
      logApiError(`/api/settings/${key}`, e, { key, value })
      alert("Ошибка сохранения настройки")
      // Логика отката могла бы быть здесь через повторный запрос
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">
        Настройки Системы (Feature Flags)
      </h3>

      {loadingSettings ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-700 mb-4">Регистрация пользователей</h4>
            <div className="space-y-4">
              {[
                { key: "REGISTRATION_ATHLETE", label: "Разрешить регистрацию Атлетов" },
                { key: "REGISTRATION_TRAINER", label: "Разрешить регистрацию Тренеров" },
                {
                  key: "REGISTRATION_ORGANIZATION",
                  label: "Разрешить регистрацию Организаций",
                },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-600">{label}</span>
                  <button
                    onClick={() =>
                      handleUpdateSetting(
                        key,
                        settings[key] === "true" ? "false" : "true",
                      )
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${settings[key] === "true" ? "bg-indigo-600" : "bg-gray-200"}`}>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings[key] === "true" ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-4">Обслуживание</h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600 block">
                  Режим технического обслуживания
                </span>
                <span className="text-xs text-gray-400">
                  Блокирует доступ для всех кроме админов
                </span>
              </div>
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "MAINTENANCE_MODE",
                    settings["MAINTENANCE_MODE"] === "true" ? "false" : "true",
                  )
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${settings["MAINTENANCE_MODE"] === "true" ? "bg-red-600" : "bg-gray-200"}`}>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings["MAINTENANCE_MODE"] === "true" ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-4">Контент</h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600 block">
                  Скрыть контент Блога (Заглушка)
                </span>
                <span className="text-xs text-gray-400">
                  Включите, чтобы показывать заглушку "В разработке"
                </span>
              </div>
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "HIDE_BLOG_CONTENT",
                    settings["HIDE_BLOG_CONTENT"] === "true" ? "false" : "true",
                  )
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${settings["HIDE_BLOG_CONTENT"] === "true" ? "bg-indigo-600" : "bg-gray-200"}`}>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings["HIDE_BLOG_CONTENT"] === "true" ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
