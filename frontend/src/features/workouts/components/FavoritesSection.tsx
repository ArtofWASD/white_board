"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Star, Dumbbell } from "lucide-react"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { eventsApi } from "@/lib/api/events"
import { Workout } from "./WorkoutCard"
import { WorkoutDetail } from "./WorkoutDetail"
import { cn } from "@/lib/utils"
import { Loader } from "@/components/ui/Loader"

function mapEventToWorkout(event: any): Workout {
  return {
    id: event.id,
    title: event.title,
    type: (event.scheme || event.exerciseType || "FOR_TIME") as Workout["type"],
    description: event.description || "",
    movements: [],
    exercises: event.exercises || [],
    timeCap: event.timeCap,
    rounds: event.rounds,
    userId: event.userId,
    teamName: event.team?.name,
    date: event.eventDate,
  }
}

export function FavoritesSection() {
  const { user } = useAuthStore()
  const [favorites, setFavorites] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchFavorites = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await eventsApi.getFavorites(user.id)
      setFavorites(data.map(mapEventToWorkout))
    } catch {
      setError("Не удалось загрузить избранное")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const handleOpenDetail = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedWorkout(null)
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>{error}</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center">
          <Star className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">В избранном пока пусто</p>
        <p className="text-sm text-center max-w-xs">
          Открой любое событие и нажми «В избранное», чтобы сохранить его здесь
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((workout) => (
          <button
            key={workout.id}
            onClick={() => handleOpenDetail(workout)}
            className={cn(
              "group relative text-left flex flex-col gap-2 rounded-xl border border-border p-4 shadow-sm transition-all",
              "hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.98]",
              "bg-[var(--card)] cursor-pointer",
            )}>
            {/* Favorite star indicator */}
            <Star className="absolute top-3 right-3 w-4 h-4 text-yellow-500 fill-yellow-500 opacity-80" />

            {/* Type badge */}
            <span
              className={cn(
                "self-start px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset",
                workout.type === "AMRAP"
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20"
                  : workout.type === "EMOM"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20"
                    : workout.type === "CARDIO"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20"
                      : workout.type === "WEIGHTLIFTING"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-500/20",
              )}>
              {workout.type === "FOR_TIME"
                ? "На время"
                : workout.type === "WEIGHTLIFTING"
                  ? "Тяжелая атлетика"
                  : workout.type === "CARDIO"
                    ? "Кардио"
                    : workout.type}
            </span>

            {/* Title */}
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 pr-6">
              {workout.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-1">
              <Dumbbell className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">
                {workout.date
                  ? new Date(workout.date).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              {workout.teamName && (
                <>
                  <span className="text-border">·</span>
                  <span className="line-clamp-1">{workout.teamName}</span>
                </>
              )}
            </div>
          </button>
        ))}
      </div>

      <WorkoutDetail
        workout={selectedWorkout}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onDelete={fetchFavorites}
        isFromFavorites={true}
      />
    </>
  )
}
