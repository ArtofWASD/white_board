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
  exerciseInputSchema,
} from "../../lib/validators/event"
import { eventsApi } from "../../lib/api/events"
import { teamsApi } from "../../lib/api/teams"
import { ApiError } from "../../lib/api/apiClient"

type ExerciseFieldErrors = Partial<
  Record<
    "name" | "rxWeight" | "rxReps" | "rxDistance" | "scWeight" | "scReps" | "scDistance",
    string
  >
>

export default function AddEventForm({ user, onSubmit, onClose }: AddEventFormProps) {
  const { success, error } = useToast()
  const [teams, setTeams] = useState<Team[]>([])

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  })

  const [exerciseName, setExerciseName] = useState("")
  const [rxWeight, setRxWeight] = useState("")
  const [rxReps, setRxReps] = useState("")
  const [rxDistance, setRxDistance] = useState("")
  const [scWeight, setScWeight] = useState("")
  const [scReps, setScReps] = useState("")
  const [scDistance, setScDistance] = useState("")
  const [exerciseFieldErrors, setExerciseFieldErrors] = useState<ExerciseFieldErrors>({})

  useEffect(() => {
    const fetchTeams = async () => {
      if (user?.id) {
        try {
          const data = await teamsApi.getUserTeams(user.id)
          setTeams(data || [])
        } catch (error) {
          console.error("Failed to fetch teams", error)
        }
      }
    }
    fetchTeams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleAddExercise = () => {
    const rawData = {
      name: exerciseName,
      rxWeight: rxWeight || undefined,
      rxReps: rxReps || undefined,
      rxDistance: rxDistance || undefined,
      scWeight: scWeight || undefined,
      scReps: scReps || undefined,
      scDistance: scDistance || undefined,
    }

    const result = exerciseInputSchema.safeParse(rawData)

    if (!result.success) {
      const fieldErrors: ExerciseFieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ExerciseFieldErrors
        if (field) fieldErrors[field] = issue.message
      }
      setExerciseFieldErrors(fieldErrors)
      return
    }

    setExerciseFieldErrors({})

    append({
      id: Date.now().toString(),
      name: exerciseName,
      rxWeight: rxWeight || undefined,
      rxReps: rxReps || undefined,
      rxDistance: rxDistance || undefined,
      scWeight: scWeight || undefined,
      scReps: scReps || undefined,
      scDistance: scDistance || undefined,
      weight: rxWeight || "",
      repetitions: rxReps || "",
    })

    setExerciseName("")
    setRxWeight("")
    setRxReps("")
    setRxDistance("")
    setScWeight("")
    setScReps("")
    setScDistance("")
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
        description: "",
        eventDate: data.eventDate,
        exerciseType: data.exerciseType,
        exercises:
          data.exercises && data.exercises.length > 0 ? data.exercises : undefined,
      }

      await eventsApi.createEvent(payload)

      if (onSubmit) {
        const safeExercises =
          data.exercises?.map((e) => ({
            ...e,
            weight: e.weight || "",
            repetitions: e.repetitions || "",
          })) || []
        onSubmit(data.title, data.exerciseType, safeExercises)
      }

      reset()
      if (onClose) onClose()
      success("Событие успешно создано")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Сессия истекла — показываем toast и закрываем форму.
      // apiClient уже вызвал forceLogout(), который сбросил Zustand-стор.
      if (err instanceof ApiError && err.status === 401) {
        error("Ваша сессия истекла. Пожалуйста, войдите снова.")
        if (onClose) onClose()
        return
      }
      setError("root", {
        message: err.message || "Произошла ошибка при создании события",
      })
    }
  }

  // Helper: input class with optional error highlight
  const inputClass = (
    hasError: boolean,
    base = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  ) => `${base} ${hasError ? "border-red-500" : "border-gray-300"}`

  const smallInputClass = (hasError: boolean) =>
    `w-full px-2 py-1 border rounded ${hasError ? "border-red-500" : "border-gray-300"}`

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Добавить новое событие</h3>

      <ErrorDisplay
        error={errors.root?.message || null}
        onClose={() => setError("root", { message: "" })}
        className="mb-4"
      />

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Название события *
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            className={inputClass(!!errors.title)}
            placeholder="Введите название события"
            maxLength={150}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Team */}
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

        {/* Exercise Type */}
        <div>
          <label
            htmlFor="exerciseType"
            className="block text-sm font-medium text-gray-700 mb-1">
            Тип упражнения *
          </label>
          <select
            id="exerciseType"
            {...register("exerciseType")}
            className={inputClass(!!errors.exerciseType)}>
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

        {/* Exercises Block */}
        <div className="border p-4 rounded-md bg-gray-50">
          <h4 className="font-medium mb-3">Упражнения</h4>

          <div className="grid grid-cols-1 gap-4 mb-4">
            {/* Exercise Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название упражнения
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className={smallInputClass(!!exerciseFieldErrors.name).replace(
                  "px-2 py-1",
                  "px-3 py-2",
                )}
                placeholder="Например: Трастеры"
                maxLength={100}
              />
              {exerciseFieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{exerciseFieldErrors.name}</p>
              )}
            </div>

            {/* Rx / Sc columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Rx */}
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-center font-semibold text-blue-800 mb-2">Rx</div>
                <div className="space-y-2">
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rxWeight}
                      onChange={(e) => setRxWeight(e.target.value)}
                      className={smallInputClass(!!exerciseFieldErrors.rxWeight)}
                      placeholder="Вес (кг)"
                    />
                    {exerciseFieldErrors.rxWeight && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {exerciseFieldErrors.rxWeight}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={rxReps}
                      onChange={(e) => setRxReps(e.target.value)}
                      className={smallInputClass(!!exerciseFieldErrors.rxReps)}
                      placeholder="Повторы"
                    />
                    {exerciseFieldErrors.rxReps && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {exerciseFieldErrors.rxReps}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={rxDistance}
                      onChange={(e) => setRxDistance(e.target.value)}
                      className={smallInputClass(!!exerciseFieldErrors.rxDistance)}
                      placeholder="Дистанция (м)"
                    />
                    {exerciseFieldErrors.rxDistance && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {exerciseFieldErrors.rxDistance}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sc */}
              <div className="bg-green-50 p-3 rounded">
                <div className="text-center font-semibold text-green-800 mb-2">Sc</div>
                <div className="space-y-2">
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={scWeight}
                      onChange={(e) => setScWeight(e.target.value)}
                      className={smallInputClass(!!exerciseFieldErrors.scWeight)}
                      placeholder="Вес (кг)"
                    />
                    {exerciseFieldErrors.scWeight && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {exerciseFieldErrors.scWeight}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={scReps}
                      onChange={(e) => setScReps(e.target.value)}
                      className={smallInputClass(!!exerciseFieldErrors.scReps)}
                      placeholder="Повторы"
                    />
                    {exerciseFieldErrors.scReps && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {exerciseFieldErrors.scReps}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={scDistance}
                      onChange={(e) => setScDistance(e.target.value)}
                      className={smallInputClass(!!exerciseFieldErrors.scDistance)}
                      placeholder="Дистанция (м)"
                    />
                    {exerciseFieldErrors.scDistance && (
                      <p className="text-red-500 text-xs mt-0.5">
                        {exerciseFieldErrors.scDistance}
                      </p>
                    )}
                  </div>
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

          {/* Added exercises list */}
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
                      Rx: {field.rxWeight || "—"}кг / {field.rxReps || "—"} повт. /{" "}
                      {field.rxDistance || "—"}м | Sc: {field.scWeight || "—"}кг /{" "}
                      {field.scReps || "—"} повт. / {field.scDistance || "—"}м
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

        {/* Date */}
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
            className={inputClass(!!errors.eventDate)}
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
