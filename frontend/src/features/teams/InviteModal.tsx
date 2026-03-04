import React, { useState, useEffect } from "react"
import { Modal } from "../../components/ui/Modal"
import Button from "../../components/ui/Button"
import { QRCodeCanvas } from "qrcode.react"
import { logApiError } from "../../lib/logger"
import { teamsApi } from "../../lib/api/teams"

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && teamId) {
      fetchInviteCode()
      setError(null)
      setSuccess(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teamId])

  const fetchInviteCode = async () => {
    try {
      setLoading(true)
      const data = await teamsApi.getTeam(teamId)

      if (data && data.inviteCode) {
        setInviteCode(data.inviteCode)
        setInviteLink(`${window.location.origin}/invite/${data.inviteCode}`)
      } else {
        // Invite code hasn't been generated yet, which is fine
      }
    } catch (err) {
      logApiError(`/api/teams/${teamId}/invite`, err)
      setError("Ошибка при получении инвайт-кода")
    } finally {
      setLoading(false)
    }
  }

  const generateInviteCode = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const data = await teamsApi.createInvite(teamId)

      if (data && data.inviteCode) {
        setInviteCode(data.inviteCode)
        setInviteLink(`${window.location.origin}/invite/${data.inviteCode}`)
        setSuccess("Пригласительная ссылка создана")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Не удалось создать пригласительную ссылку")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Не удалось создать пригласительную ссылку")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setSuccess("Ссылка скопирована!")
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose} size="sm">
        Закрыть
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Приглашение в команду"
      size="md"
      footer={footer}>
      <div className="flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-6 items-center w-full">
          <div className="w-full">
            {!inviteCode && !loading ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4 text-sm">
                  Создайте уникальную ссылку, чтобы пригласить спортсменов в вашу команду.
                </p>
                <Button
                  onClick={generateInviteCode}
                  disabled={loading}
                  
                  className="w-full"
                >
                  Создать ссылку
                </Button>
              </div>
            ) : loading && !inviteCode ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ссылка для приглашения
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink || ""}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="sm"
                    >
                      Копировать
                    </Button>
                  </div>
                </div>
                <button
                  onClick={generateInviteCode}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors block text-center w-full mt-2"
                >
                  Сгенерировать новую ссылку
                </button>
              </div>
            )}
          </div>

          {inviteLink && (
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 mt-2">
              <QRCodeCanvas value={inviteLink} size={150} />
              <span className="text-xs text-gray-500 mt-3 font-medium text-center">
                QR код для сканирования
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
