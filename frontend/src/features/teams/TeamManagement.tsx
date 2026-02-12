"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useToast } from "../../lib/context/ToastContext"
import { logApiError } from "../../lib/logger"
import { teamsApi } from "../../lib/api/teams"
import {
  TeamManagementUser as User,
  TeamMember,
  Team,
} from "../../types/TeamManagement.types"
import { User as FullUser } from "../../types"
import { UserDetailModal } from "./UserDetailModal"
import { AddMemberModal } from "./AddMemberModal"
import Button from "../../components/ui/Button"
import { QRCodeSVG } from "qrcode.react"

export default function TeamManagement() {
  const { user } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({})
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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

  const fetchUserTeams = useCallback(async () => {
    try {
      setLoading(true)
      if (user?.id) {
        const data = await teamsApi.getUserTeams(user.id)
        setTeams(data || [])
      }
    } catch (err) {
      toastError("Не удалось загрузить команды")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const fetchTeamMembers = useCallback(async (teamId: string) => {
    try {
      const data = await teamsApi.getMembers(teamId)
      setTeamMembers((prev) => ({ ...prev, [teamId]: data || [] }))
    } catch (err) {
      toastError("Не удалось загрузить участников команды")
    }
  }, [])

  // Получение команд пользователя
  useEffect(() => {
    if (user) {
      fetchUserTeams()
    }
  }, [user, fetchUserTeams])

  // Получение участников команды при выборе команды
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam)
      fetchInviteCode(selectedTeam)
    } else {
      setInviteCode(null)
      setInviteLink(null)
    }
  }, [selectedTeam, fetchTeamMembers])

  const fetchInviteCode = async (teamId: string) => {
    try {
      // Use getTeam or createInvite/getInvite logic
      const team = await teamsApi.getTeam(teamId)
      if (team && (team as any).inviteCode) {
        setInviteCode((team as any).inviteCode)
        setInviteLink(`${window.location.origin}/invite/${(team as any).inviteCode}`)
      } else {
        setInviteCode(null)
        setInviteLink(null)
      }
    } catch (err) {
      logApiError(`/api/teams/${teamId}/invite`, err, { teamId })
    }
  }

  const generateInviteCode = async () => {
    if (!selectedTeam) return
    try {
      setLoading(true)
      const data = await teamsApi.createInvite(selectedTeam)

      if (data && data.inviteCode) {
        setInviteCode(data.inviteCode)
        setInviteLink(`${window.location.origin}/invite/${data.inviteCode}`)
        success("Ссылка для приглашения успешно создана")
      } else {
        toastError("Не удалось создать код приглашения")
      }
    } catch (err) {
      toastError("Не удалось создать код приглашения")
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim() || !user) return

    try {
      setLoading(true)
      const newTeam = await teamsApi.createTeam({
        name: newTeamName,
        description: newTeamDescription,
      })

      if (newTeam) {
        setTeams((prev) => [...prev, newTeam])

        // Сброс формы
        setNewTeamName("")
        setNewTeamDescription("")

        success("Команда успешно создана!")
      }
    } catch (err: any) {
      // Simplified error handling as apiClient throws errors
      toastError(err.message || "Не удалось создать команду")
    } finally {
      setLoading(false)
    }
  }

  const removeTeamMember = async (teamId: string, userId: string) => {
    if (!user) return

    try {
      setLoading(true)
      await teamsApi.removeMember(teamId, userId)

      // Обновление участников команды
      fetchTeamMembers(teamId)
      success("Участник успешно удален!")
    } catch (err) {
      toastError("Не удалось удалить участника")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "TRAINER") {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Управление командами</h2>
        <p className="text-gray-600">Только тренеры могут управлять командами.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Управление командами</h2>

      {/* Форма создания команды */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Создать новую команду</h3>
        <form onSubmit={createTeam} className="space-y-4">
          <div>
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-gray-700 mb-1">
              Название команды *
            </label>
            <input
              type="text"
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
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
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {loading ? "Создание..." : "Создать команду"}
          </button>
        </form>
      </div>

      {/* Список команд */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Ваши команды</h3>
        {teams.length === 0 ? (
          <p className="text-gray-600">Вы еще не создали ни одной команды.</p>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTeam === team.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() =>
                  setSelectedTeam(selectedTeam === team.id ? null : team.id)
                }>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{team.name}</h4>
                  <span className="text-sm text-gray-500">
                    {teamMembers[team.id]?.length || 0} участников
                  </span>
                </div>
                {team.description && (
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Управление участниками команды */}
      {selectedTeam && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Управление участниками</h3>

          {/* Раздел приглашений */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-3">Приглашение в команду</h4>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 w-full">
                {!inviteCode ? (
                  <button
                    onClick={generateInviteCode}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                    Создать ссылку-приглашение
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Ссылка для приглашения
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteLink || ""}
                          className="flex-1 text-sm p-2 border rounded bg-white"
                        />
                        <button
                          onClick={() => {
                            if (inviteLink) {
                              navigator.clipboard.writeText(inviteLink)
                              success("Ссылка скопирована!")
                            }
                          }}
                          className="px-3 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 text-sm">
                          Копировать
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={generateInviteCode}
                      disabled={loading}
                      className="text-xs text-blue-600 hover:underline">
                      Сгенерировать новую ссылку
                    </button>
                  </div>
                )}
              </div>

              {inviteLink && (
                <div className="flex flex-col items-center p-2 bg-white rounded shadow-sm">
                  <QRCodeSVG value={inviteLink} size={100} />
                  <span className="text-xs text-gray-500 mt-1">QR код</span>
                </div>
              )}
            </div>
          </div>

          {/* Список участников */}
          <div>
            <h4 className="font-medium mb-3">Участники команды</h4>
            {teamMembers[selectedTeam]?.length === 0 ? (
              <p className="text-gray-600 mb-4">В этой команде пока нет участников.</p>
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
                        Email
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
                    {teamMembers[selectedTeam]?.map((member) => (
                      <tr key={member.id}>
                        <td
                          className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-600 sm:pl-6 cursor-pointer hover:underline"
                          onClick={() => handleUserClick(member.user)}>
                          {member.user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {member.user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.user.role === "TRAINER"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                            {member.user.role === "TRAINER" ? "Тренер" : "Атлет"}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => removeTeamMember(selectedTeam, member.userId)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50">
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
              <Button
                onClick={() => setIsAddMemberModalOpen(true)}
                variant="outline"
                className="!py-2 !px-4">
                <span>Добавить</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUserForDetail}
      />

      {selectedTeam && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          teamId={selectedTeam}
          existingMemberIds={teamMembers[selectedTeam]?.map((m) => m.userId) || []}
          onMemberAdded={() => {
            fetchTeamMembers(selectedTeam)
          }}
        />
      )}
    </div>
  )
}
