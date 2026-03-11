import React, { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Label } from "@/components/ui/label"
import { eventsApi } from "@/lib/api/events"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { Workout } from "./WorkoutCard"

interface AddToCalendarBlockProps {
  workout: Workout
  onClose: () => void
}

export function AddToCalendarBlock({ workout, onClose }: AddToCalendarBlockProps) {
  const { user } = useAuthStore()
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split("T")[0]
  })
  const [selectedTime, setSelectedTime] = useState("09:00")
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)

  const handleAddToCalendar = async () => {
    if (!user) return
    setIsAddingToCalendar(true)
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
      await eventsApi.createEvent({
        userId: user.id,
        title: workout.title,
        eventDate: dateTime,
        exerciseType: workout.type,
        exercises: workout.exercises,
        timeCap: workout.timeCap,
        rounds: workout.rounds,
        description: workout.description,
        scheme: workout.type,
      })
      alert("Событие успешно добавлено в ваш календарь!")
      onClose()
    } catch (err) {
      console.error(err)
      alert("Не удалось добавить событие в календарь.")
    } finally {
      setIsAddingToCalendar(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 mb-2 bg-background border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sm">Добавить в свой календарь</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Дата</Label>
          <input
            type="date"
            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Время</Label>
          <input
            type="time"
            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>
      </div>
      <Button
        className="w-full min-h-[48px] h-12"
        onClick={handleAddToCalendar}
        disabled={isAddingToCalendar}>
        {isAddingToCalendar ? "Добавление..." : "Добавить в календарь"}
      </Button>
    </div>
  )
}
