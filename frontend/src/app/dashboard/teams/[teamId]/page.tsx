"use client"

import React, { useState, useEffect } from "react"
import { useAuthStore } from "../../../../lib/store/useAuthStore"
import { useParams, useRouter } from "next/navigation"
import { QRCodeCanvas } from "qrcode.react"
import { UserDetailModal } from "../../../../features/teams/UserDetailModal"
import { AddMemberModal } from "../../../../features/teams/AddMemberModal"
import Button from "../../../../components/ui/Button"
import { User as FullUser } from "../../../../types"
import { logApiError } from "../../../../lib/logger"

interface User {
  id: string
  name: string
  email: string
  role: string
  lastName?: string
}

interface TeamMember {
  id: string
  userId: string
  role: string
  user: User
}

interface Team {
  id: string
  name: string
  description?: string
  inviteCode?: string
}

export default function EditTeamPage() {
  const { user } = useAuthStore()
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Edit mode state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState("")

  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  // User detail modal state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<FullUser | null>(
    null,
  )
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Add Member Modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

  const handleUserClick = (user: any) => {
    setSelectedUserForDetail(user as FullUser)
    setIsDetailModalOpen(true)
  }

  useEffect(() => {
    if (teamId && user) {
      fetchTeamDetails()
      fetchTeamMembers()
      fetchInviteCode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, user])

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTeam(data)
        setEditNameValue(data.name)
      } else {
        const errorText = await response.text()
        logApiError(`/api/teams/${teamId}`, new Error("Failed to fetch team"), {
          status: response.status,
        })
        try {
          const errorData = JSON.parse(errorText)
          setError(errorData.message || "Не удалось загрузить информацию о команде")
        } catch {
          setError(`Ошибка: ${response.status} ${response.statusText}`)
        }
      }
    } catch (err) {
      logApiError(`/api/teams/${teamId}`, err)
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка"
      setError(`Ошибка при загрузке информации о команде: ${errorMessage}`)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      // const token = localStorage.getItem('token'); // Removed direct access
      const response = await fetch(`/api/teams/${teamId}/members`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setTeamMembers(data)
        } else {
          setTeamMembers([])
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || "Не удалось загрузить участников команды")
      }
    } catch (err) {
      setError("Ошибка при загрузке участников команды")
    } finally {
      setLoading(false)
    }
  }

  const fetchInviteCode = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.inviteCode) {
          setInviteCode(data.inviteCode)
          setInviteLink(`${window.location.origin}/invite/${data.inviteCode}`)
        }
      }
    } catch (err) {
      logApiError(`/api/teams/${teamId}/invite`, err)
    }
  }

  const generateInviteCode = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teams/${teamId}/invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInviteCode(data.inviteCode)
        setInviteLink(`${window.location.origin}/invite/${data.inviteCode}`)
        setSuccess("Пригласительная ссылка создана")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Не удалось создать пригласительную ссылку")
      }
    } catch (err) {
      setError("Не удалось создать пригласительную ссылку")
    } finally {
      setLoading(false)
    }
  }

  const removeTeamMember = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого участника?")) return

    try {
      setLoading(true)
      // const token = localStorage.getItem('token'); // Removed direct access
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
        }),
      })

      if (response.ok) {
        fetchTeamMembers()
        setSuccess("Участник успешно удален")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || "Не удалось удалить участника")
      }
    } catch (err) {
      setError("Ошибка при удалении участника")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTeamName = async () => {
    if (!team || !editNameValue.trim()) return

    try {
      setLoading(true)

      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editNameValue,
        }),
      })

      if (response.ok) {
        const updatedTeam = await response.json()
        setTeam((prev) => (prev ? { ...prev, name: updatedTeam.name } : null))
        setSuccess("Название команды обновлено")
        setIsEditingName(false)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || "Не удалось обновить название команды")
      }
    } catch (err) {
      setError("Ошибка при обновлении названия")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="p-8 text-center">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/dashboard/teams")}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handleUpdateTeamName}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Сохранить
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false)
                  setEditNameValue(team?.name || "")
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Отмена
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-800">
                {team ? `Редактирование команды: ${team.name}` : "Загрузка..."}
              </h1>
              {team && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="ml-3 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Изменить название">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Invite Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Приглашение в команду
          </h2>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 w-full">
                {!inviteCode ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Создайте уникальную ссылку, чтобы пригласить спортсменов в вашу
                      команду.
                    </p>
                    <button
                      onClick={generateInviteCode}
                      disabled={loading}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors">
                      Создать пригласительную ссылку
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ссылка для приглашения
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteLink || ""}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                        />
                        <button
                          onClick={() => {
                            if (inviteLink) {
                              navigator.clipboard.writeText(inviteLink)
                              setSuccess("Ссылка скопирована!")
                              setTimeout(() => setSuccess(null), 3000)
                            }
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                          Копировать
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={generateInviteCode}
                      disabled={loading}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                      Сгенерировать новую ссылку
                    </button>
                  </div>
                )}
              </div>

              {inviteLink && (
                <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <QRCodeCanvas value={inviteLink} size={150} />
                  <span className="text-sm text-gray-500 mt-2 font-medium">
                    QR код для сканирования
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Members List (Moved here) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Состав команды</h2>

          {teamMembers.length === 0 ? (
            <p className="text-gray-600 italic mb-4">В команде пока нет участников.</p>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mb-6">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Имя
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Роль
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {teamMembers.map((member) => (
                    <tr key={member.id}>
                      <td
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-600 sm:pl-6 cursor-pointer hover:underline"
                        onClick={() => handleUserClick(member.user)}>
                        {member.user.name} {member.user.lastName}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.user.role === "TRAINER"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                          {member.user.role === "TRAINER" ? "Тренер" : "Спортсмен"}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => removeTeamMember(member.userId)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium">
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAddMemberModalOpen(true)}
                variant="outline"
                className="!py-2 !px-4 bg-white hover:bg-gray-50 text-black border-gray-300">
                <span>Добавить участника</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUserForDetail}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        teamId={teamId}
        existingMemberIds={teamMembers.map((m) => m.userId)}
        onMemberAdded={() => {
          fetchTeamMembers()
          // setIsAddMemberModalOpen(false); // Optional: close on add? Keeping open for multiple adds
        }}
      />
    </div>
  )
}
