import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "../../lib/store/useAuthStore"
import Button from "../../components/ui/Button"
import AthleteEvents from "../events/AthleteEvents"
import CreateTeamModal from "../teams/CreateTeamModal"
import { DashboardEvent } from "../../types/UserDashboard.types"

interface UserDashboardProps {
  onClose?: () => void
}

export default function UserDashboard({ onClose }: UserDashboardProps) {
  const { user, logout } = useAuthStore()
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/events?userId=${user.id}`)
          const data: DashboardEvent[] = await response.json()

          if (response.ok) {
            setEvents(data)
          }
        } catch (error) {
        } finally {
          setLoading(false)
        }
      }
    }

    if (user) {
      fetchEvents()
    }
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Добро пожаловать, {user.name}
          {user.lastName ? ` ${user.lastName}` : ""} (
          {user.role === "ATHLETE" ? "Атлет" : "Тренер"})!
        </h2>
        <div className="flex space-x-2">
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Закрыть и вернуться к календарю
            </Button>
          )}
          <Button
            onClick={async () => {
              await logout()
              window.location.href = "/calendar"
            }}
            variant="outline">
            Выйти
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Ваши события</h3>
          {loading ? (
            <p className="text-gray-700">Загрузка...</p>
          ) : (
            <p className="text-gray-700">Всего событий: {events.length}</p>
          )}
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Календарь</h3>
          <p className="text-gray-700">Просматривайте и планируйте события</p>
        </div>

        <Link
          href="/profile"
          className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition duration-300">
          <h3 className="text-xl font-semibold mb-2">Профиль</h3>
          <p className="text-gray-700">Настройте ваш профиль и предпочтения</p>
        </Link>
      </div>

      {/* Create Team Button for Trainers */}
      {user.role === "TRAINER" && (
        <div className="mt-8">
          <Button onClick={() => setIsCreateTeamModalOpen(true)} variant="outline">
            Создать команду
          </Button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">События спортсмена</h3>
        <AthleteEvents userId={user.id} />
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onTeamCreated={() => {
          // Optionally refresh team data or show notification
        }}
      />
    </div>
  )
}
