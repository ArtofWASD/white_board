"use client"

import React, { useState } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useToast } from "../../lib/context/ToastContext"
import ErrorDisplay from "../../components/ui/ErrorDisplay"
import { teamsApi } from "../../lib/api/teams"

import { CreateTeamModalProps } from "../../types/CreateTeamModal.types"

export default function CreateTeamModal({
  isOpen,
  onClose,
  onTeamCreated,
}: CreateTeamModalProps) {
  const { user } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teamName.trim() || !user) return

    try {
      setLoading(true)
      setError(null)

      await teamsApi.createTeam({
        name: teamName,
        description: teamDescription,
      })

      // Сброс формы
      setTeamName("")
      setTeamDescription("")

      // Уведомление родительского компонента и закрытие модального окна
      onTeamCreated()
      onClose()

      success("Команда успешно создана!")
    } catch (err: any) {
      setError(err.message || "Не удалось создать команду")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Создать новую команду</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <ErrorDisplay error={error} onClose={() => setError(null)} className="mb-4" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-gray-700 mb-1">
                Название команды *
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="teamDescription"
                className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                id="teamDescription"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}>
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {loading ? "Создание..." : "Создать команду"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
