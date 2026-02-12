"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { logApiError } from "../../lib/logger"
import { teamsApi } from "../../lib/api/teams"

import { QRCodeCanvas } from "qrcode.react"
import { EditTeamModalProps, TeamMember } from "../../types/EditTeamModal.types"
import ErrorDisplay from "../../components/ui/ErrorDisplay"
import { AddMemberModal } from "./AddMemberModal"

export default function EditTeamModal({
  teamId,
  teamName,
  isOpen,
  onClose,
  onTeamUpdated,
}: EditTeamModalProps) {
  const { user } = useAuthStore()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  // Add Member Modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

  const fetchTeamMembers = useCallback(async () => {
    try {
      if (!teamId || typeof teamId !== "string" || teamId === "undefined") {
        setTeamMembers([])
        return
      }

      setLoading(true)
      const members = await teamsApi.getMembers(teamId)
      setTeamMembers(members || [])
    } catch (err: any) {
      setError(err.message || "Не удалось загрузить участников команды")
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }, [teamId])

  const fetchInviteCode = useCallback(async () => {
    try {
      // Assuming getTeam returns the invite code if user has permission
      // If not, we might need a dedicated endpoint or checking how backend behaves.
      // We'll use getTeam for now as a substitute for fetching team details which likely contains invite info for owner.
      // But wait, original code fetched `/api/teams/${teamId}`.
      const team = await teamsApi.getTeam(teamId)
      if (team && (team as any).inviteCode) {
        setInviteCode((team as any).inviteCode)
        setInviteLink(`${window.location.origin}/invite/${(team as any).inviteCode}`)
      }
    } catch (err) {
      logApiError(`/api/teams/${teamId}/invite`, err, { teamId })
    }
  }, [teamId])

  const generateInviteCode = async () => {
    try {
      setLoading(true)
      const response = await teamsApi.createInvite(teamId)

      if (response && response.inviteCode) {
        setInviteCode(response.inviteCode)
        setInviteLink(`${window.location.origin}/invite/${response.inviteCode}`)
      } else {
        setError("Не удалось создать код приглашения")
      }
    } catch (err) {
      setError("Не удалось создать код приглашения")
    } finally {
      setLoading(false)
    }
  }

  // Fetch team members and available athletes when modal opens
  useEffect(() => {
    if (isOpen && teamId && typeof teamId === "string" && teamId !== "undefined") {
      fetchTeamMembers()
      fetchInviteCode()
    } else if (isOpen) {
    }
  }, [isOpen, teamId, fetchTeamMembers, fetchInviteCode])

  const removeTeamMember = async (userId: string) => {
    if (!user) return

    try {
      setLoading(true)
      await teamsApi.removeMember(teamId, userId)

      // Refresh team members
      fetchTeamMembers()
      onTeamUpdated()
    } catch (err: any) {
      setError(err.message || "Не удалось удалить участника")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Редактировать команду: {teamName}</h2>
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

          {/* Invite Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Приглашение в команду</h3>
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Добавить
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 w-full">
                {!inviteCode ? (
                  <button
                    onClick={generateInviteCode}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                    Создать пригласительную ссылку
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
                              alert("Ссылка скопирована!")
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
                  <QRCodeCanvas value={inviteLink} size={100} />
                  <span className="text-xs text-gray-500 mt-1">QR код</span>
                </div>
              )}
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="font-medium mb-3">Участники команды</h3>
            {teamMembers && teamMembers.length === 0 ? (
              <p className="text-gray-600">В команде пока нет участников.</p>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
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
                    {teamMembers &&
                      teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {member.user.name} {member.user.lastName}
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
                              {member.user.role === "TRAINER" ? "Тренер" : "Спортсмен"}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => removeTeamMember(member.userId)}
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
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Закрыть
            </button>
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        teamId={teamId}
        existingMemberIds={teamMembers.map((m) => m.userId)}
        onMemberAdded={() => {
          fetchTeamMembers()
          onTeamUpdated()
        }}
      />
    </div>
  )
}
