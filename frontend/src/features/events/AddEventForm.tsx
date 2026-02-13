"use client"

import React, { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "../../lib/context/ToastContext"
import { AddEventFormProps } from "../../types/AddEventForm.types"
import { Team } from "../../types"
import ErrorDisplay from "../../components/ui/ErrorDisplay"
import {
  createEventSchema,
  CreateEventFormData,
  ExerciseInputData,
  exerciseInputSchema,
} from "../../lib/validators/event"
import { eventsApi } from "../../lib/api/events"
import { teamsApi } from "../../lib/api/teams" // Assuming this exists or using fetch if not

export default function AddEventForm({ user, onSubmit, onClose }: AddEventFormProps) {
  const { success } = useToast()
  const [teams, setTeams] = useState<Team[]>([])

  // Form for the main event
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      exerciseType: "",
      eventDate: new Date().toISOString().split("T")[0],
      exercises: [],
    },
  })

  // Dynamic field array for exercises
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  })

  // Local state for "New Exercise" inputs (managed separately to avoid polluting main form validation until added)
  // We could use a separate useForm for this, but local state is fine for simple inputs
  const [exerciseName, setExerciseName] = useState("")
  const [rxWeight, setRxWeight] = useState("")
  const [rxReps, setRxReps] = useState("")
  const [scWeight, setScWeight] = useState("")
  const [scReps, setScReps] = useState("")
  const [exerciseError, setExerciseError] = useState<string | null>(null)

  // Watch selected team to handle optional team logic
  // const selectedTeamId = watch("teamId")

  useEffect(() => {
    const fetchTeams = async () => {
      if (user?.id) {
        try {
          // Assuming teamsApi.getUserTeams exists and works similar to fetch
          const data = await teamsApi.getUserTeams(user.id)
          setTeams(data || [])
        } catch (error) {
          console.error("Failed to fetch teams", error)
        }
      }
    }
    fetchTeams()
  }, [user])

  const handleAddExercise = () => {
    if (!exerciseName.trim()) {
      setExerciseError("Введите название упражнения")
      return
    }

    setExerciseError(null)

    // Add to field array
    append({
      id: Date.now().toString(),
      name: exerciseName,
      rxWeight: rxWeight || undefined,
      rxReps: rxReps || undefined,
      scWeight: scWeight || undefined,
      scReps: scReps || undefined,
      // Legacy compatibility if needed by schema (though schema marks them optional)
      weight: rxWeight || undefined,
      repetitions: rxReps || undefined,
    })

    // Reset inputs
    setExerciseName("")
    setRxWeight("")
    setRxReps("")
    setScWeight("")
    setScReps("")
  }

  const onFormSubmit = async (data: CreateEventFormData) => {
    if (!user?.id) {
      setError("root", { message: "Ошибка: Пользователь не идентифицирован" })
      return
    }

    try {
      const payload = {
        userId: user.id,
        teamId: data.teamId || undefined,
        title: data.title,
        description: "", // Schema doesn't have description yet, or backend handles it
        eventDate: data.eventDate,
        exerciseType: data.exerciseType,
        exercises:
          data.exercises && data.exercises.length > 0 ? data.exercises : undefined,
      }

      await eventsApi.createEvent(payload)

      if (onSubmit) {
        onSubmit(data.title, data.exerciseType, data.exercises)
      }

      reset()
      if (onClose) onClose()
      success("Событие успешно создано")
    } catch (error: any) {
      setError("root", {
        message: error.message || "Произошла ошибка при создании события",
      })
    }
  }

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Добавить новое событие</h3>

      <ErrorDisplay
        error={errors.root?.message || null}
        onClose={() => setError("root", { message: "" })}
        className="mb-4"
      />

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Название события *
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Введите название события"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="teamId"
            className="block text-sm font-medium text-gray-700 mb-1">
            Команда (необязательно)
          </label>
          <select
            id="teamId"
            {...register("teamId")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Личное событие</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="exerciseType"
            className="block text-sm font-medium text-gray-700 mb-1">
            Тип упражнения
          </label>
          <select
            id="exerciseType"
            {...register("exerciseType")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.exerciseType ? "border-red-500" : "border-gray-300"
            }`}>
            <option value="">Выберите тип упражнения</option>
            <option value="running">Бег</option>
            <option value="swimming">Плавание</option>
            <option value="cycling">Велоспорт</option>
            <option value="strength">Силовые тренировки</option>
            <option value="yoga">Йога</option>
            <option value="other">Другое</option>
          </select>
          {errors.exerciseType && (
            <p className="text-red-500 text-xs mt-1">{errors.exerciseType.message}</p>
          )}
        </div>

        <div className="border p-4 rounded-md bg-gray-50">
          <h4 className="font-medium mb-3">Упражнения</h4>

          {/* New Exercise Inputs */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название упражнения
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  exerciseError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Например: Трастеры"
              />
              {exerciseError && (
                <p className="text-red-500 text-xs mt-1">{exerciseError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-center font-semibold text-blue-800 mb-2">Rx</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={rxWeight}
                    onChange={(e) => setRxWeight(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Вес (кг)"
                  />
                  <input
                    type="text"
                    value={rxReps}
                    onChange={(e) => setRxReps(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Повторы"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <div className="text-center font-semibold text-green-800 mb-2">Sc</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={scWeight}
                    onChange={(e) => setScWeight(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Вес (кг)"
                  />
                  <input
                    type="text"
                    value={scReps}
                    onChange={(e) => setScReps(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Повторы"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddExercise}
              className="w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition">
              Добавить упражнение
            </button>
          </div>

          {/* List of added exercises */}
          {fields.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Список упражнений:</h5>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex justify-between items-center bg-white p-2 rounded border">
                  <div>
                    <span className="font-medium">{field.name}</span>
                    <div className="text-xs text-gray-500">
                      Rx: {field.rxWeight || "-"}кг / {field.rxReps || "-"} повт. | Sc:{" "}
                      {field.scWeight || "-"}кг / {field.scReps || "-"} повт.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 font-bold px-2">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="eventDate"
            className="block text-sm font-medium text-gray-700 mb-1">
            Дата события *
          </label>
          <input
            type="date"
            id="eventDate"
            {...register("eventDate")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.eventDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.eventDate && (
            <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            disabled={isSubmitting}>
            {isSubmitting ? "Создание..." : "Создать событие"}
          </button>
        </div>
      </form>
    </div>
  )
}
