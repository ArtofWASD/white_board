"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"

import Button from "../../components/ui/Button"
import { Loader } from "../../components/ui/Loader"
import { ExerciseTracker } from "../../components/dashboard/ExerciseTracker"
import { RecentActivities } from "../../components/dashboard/RecentActivities"
import { WeightTracker } from "../../components/dashboard/WeightTracker"
import { UniversalCalculator } from "../../components/dashboard/UniversalCalculator"

import { SortableItem } from "../../components/dashboard/SortableItem"
import { useAuthStore } from "../../lib/store/useAuthStore"
import { useFeatureFlagStore } from "../../lib/store/useFeatureFlagStore"
import { apiClient } from "../../lib/api/apiClient"

interface Exercise {
  id: string
  name: string
  maxWeight: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: any[]
}

interface Event {
  id: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[]
}

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore()
  const { flags } = useFeatureFlagStore()
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Пагинация
  const [exercisesPage, setExercisesPage] = useState(1)
  const [eventsPage, setEventsPage] = useState(1)
  const [hasMoreExercises, setHasMoreExercises] = useState(true)
  const [hasMoreEvents, setHasMoreEvents] = useState(true)
  const [isLoadingMoreExercises, setIsLoadingMoreExercises] = useState(false)
  const [isLoadingMoreEvents, setIsLoadingMoreEvents] = useState(false)

  // Инициализируем состояние из объекта пользователя или значений по умолчанию
  // По умолчанию универсальный калькулятор, но поддерживаются все ID
  const [items, setItems] = useState<string[]>([
    "exercise-tracker",
    "weight-tracker",
    "recent-activities",
    "universal-calculator",
  ])
  const [layoutMode, setLayoutMode] = useState<
    "asymmetric" | "symmetric" | "symmetric-1-1"
  >("asymmetric")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const handleToggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true), // По умолчанию true, если undefined
    }))
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    if (user) {
      fetchData()

      // Синхронизируем состояние с профилем пользователя
      if (user.dashboardLayout && user.dashboardLayout.length > 0) {
        const savedLayout = user.dashboardLayout
        const allWidgets = [
          "exercise-tracker",
          "weight-tracker",
          "recent-activities",
          "universal-calculator",
          "trainer-stats-widget",
        ]

        // Теперь мы поддерживаем все ID, поэтому нет необходимости принудительно выполнять миграцию, если мы не хотим стандартизации.
        // Пользователь попросил гибкости, поэтому мы уважаем ID из сохраненного макета.

        const missingWidgets = allWidgets.filter((w) => !savedLayout.includes(w))
        setItems([...savedLayout, ...missingWidgets]) // Добавляем новые виджеты в конец
      } else {
        setItems([
          "exercise-tracker",
          "weight-tracker",
          "recent-activities",
          "universal-calculator",
          "trainer-stats-widget",
        ])
      }

      if (user.dashboardLayoutMode) {
        setLayoutMode(
          user.dashboardLayoutMode as "asymmetric" | "symmetric" | "symmetric-1-1",
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const [exercisesRes, eventsRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiClient.get<any>(`/api/exercises?userId=${user.id}&page=1&limit=10`),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiClient.get<any>(`/api/events?userId=${user.id}&page=1&limit=10`),
      ])

      if (exercisesRes && exercisesRes.data) {
        setExercises(exercisesRes.data)
        setHasMoreExercises(exercisesRes.meta?.hasMore || false)
      } else if (Array.isArray(exercisesRes)) {
        setExercises(exercisesRes)
        setHasMoreExercises(false)
      }

      if (eventsRes && eventsRes.data) {
        setEvents(eventsRes.data)
        setHasMoreEvents(eventsRes.meta?.hasMore || false)
      } else if (Array.isArray(eventsRes)) {
        setEvents(eventsRes)
        setHasMoreEvents(false)
      }

      setExercisesPage(1)
      setEventsPage(1)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const loadMoreExercises = useCallback(async () => {
    if (!user || !hasMoreExercises || isLoadingMoreExercises) return
    setIsLoadingMoreExercises(true)
    try {
      const nextPage = exercisesPage + 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiClient.get<any>(
        `/api/exercises?userId=${user.id}&page=${nextPage}&limit=10`,
      )
      if (res && res.data) {
        setExercises((prev) => {
          // Avoid duplicates by checking IDs
          const newExercises = res.data.filter(
            (newEx: any) => !prev.some((ex) => ex.id === newEx.id),
          )
          return [...prev, ...newExercises]
        })
        setHasMoreExercises(res.meta?.hasMore || false)
        setExercisesPage(nextPage)
      }
    } catch {
    } finally {
      setIsLoadingMoreExercises(false)
    }
  }, [user, hasMoreExercises, isLoadingMoreExercises, exercisesPage])

  const loadMoreEvents = useCallback(async () => {
    if (!user || !hasMoreEvents || isLoadingMoreEvents) return
    setIsLoadingMoreEvents(true)
    try {
      const nextPage = eventsPage + 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiClient.get<any>(
        `/api/events?userId=${user.id}&page=${nextPage}&limit=10`,
      )
      if (res && res.data) {
        setEvents((prev) => {
          // Avoid duplicates
          const newEvents = res.data.filter(
            (newEv: any) => !prev.some((ev) => ev.id === newEv.id),
          )
          return [...prev, ...newEvents]
        })
        setHasMoreEvents(res.meta?.hasMore || false)
        setEventsPage(nextPage)
      }
    } catch {
    } finally {
      setIsLoadingMoreEvents(false)
    }
  }, [user, hasMoreEvents, isLoadingMoreEvents, eventsPage])

  const saveLayout = async (
    newItems: string[],
    newMode: "asymmetric" | "symmetric" | "symmetric-1-1",
  ) => {
    if (!user) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await apiClient.put<{ user: any }>(`/api/auth/profile/${user.id}`, {
        dashboardLayout: newItems,
        dashboardLayoutMode: newMode,
      })

      if (data && data.user) {
        // Обновляем локальное хранилище пользователя для отображения изменений
        updateUser({
          ...user,
          dashboardLayout: newItems,
          dashboardLayoutMode: newMode,
        })
      }
    } catch {}
  }

  const handleCreateExercise = useCallback(
    async (name: string, initialWeight?: number) => {
      if (!user) return
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: any = { name, userId: user.id }
        if (initialWeight) {
          body.initialWeight = initialWeight
        }

        await apiClient.post("/api/exercises", body)
        fetchData()
      } catch {}
    },
    [user, fetchData],
  )

  const handleAddRecord = useCallback(
    async (exerciseId: string, weight: number) => {
      try {
        await apiClient.post(`/api/exercises/${exerciseId}/records`, { weight })
        fetchData()
      } catch {}
    },
    [fetchData],
  )

  const handleUpdateExercise = useCallback(
    async (id: string, name: string) => {
      try {
        await apiClient.put(`/api/exercises/${id}`, { name })

        await fetchData()
      } catch {}
    },
    [fetchData],
  )

  const handleGoToProfile = useCallback(() => {
    router.push("/profile")
  }, [router])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string)
      const newIndex = items.indexOf(over.id as string)
      const newItems = arrayMove(items, oldIndex, newIndex)

      setItems(newItems)
      saveLayout(newItems, layoutMode)
    }
  }

  const handleLayoutChange = (mode: "asymmetric" | "symmetric" | "symmetric-1-1") => {
    setLayoutMode(mode)
    saveLayout(items, mode)
  }

  // Фильтруем элементы на основе флагов функций и состояния пользователя
  const visibleItems = items.filter((id) => {
    // Администраторы организации не должны видеть виджеты тренировок
    if (user?.role === "ORGANIZATION_ADMIN") {
      const trainingWidgets = [
        "exercise-tracker",
        "weight-tracker",
        "universal-calculator",
        "recent-activities",
      ]
      if (trainingWidgets.includes(id)) return false
    }

    if (id === "exercise-tracker" && !flags.showExerciseTracker) return false
    if (id === "weight-tracker" && (!flags.showWeightTracker || !user)) return false

    // Логика универсального калькулятора
    if (id === "universal-calculator") {
      // Показываем, если универсальный режим включен.
      // Мы больше не требуем строгого включения подкалькулятора для отображения контейнера виджета,
      // чтобы пользователь мог хотя бы видеть пустой виджет и знать, что ему нужно что-то включить или выбрать.
      return flags.showUniversalCalculator
    }

    // Устаревшие калькуляторы
    if (id === "strength-training-calculator" || id === "texas-method-calculator") {
      return false
    }

    return true
  })

  const renderWidget = (id: string) => {
    const isExpanded = expandedItems[id] ?? true

    // Общие свойства для всех виджетов
    const commonProps = {
      isExpanded,
      onToggle: () => handleToggleExpand(id),
    }

    switch (id) {
      case "exercise-tracker":
        return (
          <ExerciseTracker
            exercises={exercises}
            isLoading={isLoading}
            onCreateExercise={handleCreateExercise}
            onAddRecord={handleAddRecord}
            onUpdateExercise={handleUpdateExercise}
            hasMore={hasMoreExercises}
            onLoadMore={loadMoreExercises}
            {...commonProps}
          />
        )
      case "weight-tracker":
        return user ? <WeightTracker user={user} {...commonProps} /> : null
      case "recent-activities":
        return (
          <RecentActivities
            exercises={exercises}
            events={events}
            hasMoreEvents={hasMoreEvents}
            onLoadMoreEvents={loadMoreEvents}
            {...commonProps}
          />
        )
      case "universal-calculator":
        return <UniversalCalculator exercises={exercises} {...commonProps} />

      default:
        return null
    }
  }

  if (isLoading) {
    return <Loader />
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="mb-4">
          Вы должны войти в систему, чтобы просматривать эту страницу.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="text-blue-500 hover:text-blue-700 font-medium">
          Вернуться на главную страницу
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full py-2 lg:py-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mr-4 overflow-hidden border border-gray-600">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold dark:text-white">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Роль:{" "}
                {user.role === "ATHLETE"
                  ? "Атлет"
                  : user.role === "ORGANIZATION_ADMIN"
                    ? "Администратор организации"
                    : "Тренер"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleGoToProfile}
              variant="ghost"
              title="Редактировать профиль"
              className="mr-2 sm:mr-12"
              size="icon">
              <Image
                src="/edit_profile_icon.png"
                alt="Редактировать профиль"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex justify-end mb-6">
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => handleLayoutChange("asymmetric")}
            className={`p-1.5 rounded-md transition-all ${
              layoutMode === "asymmetric"
                ? "bg-white dark:bg-gray-500 shadow-sm"
                : "hover:bg-gray-200 dark:hover:bg-gray-600 opacity-60 hover:opacity-100"
            }`}
            title="2 колонки (несимметрично)">
            <Image
              src="/asymmetrical.png"
              alt="2:1"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
          <button
            onClick={() => handleLayoutChange("symmetric")}
            className={`p-1.5 rounded-md transition-all ${
              layoutMode === "symmetric"
                ? "bg-white dark:bg-gray-500 shadow-sm"
                : "hover:bg-gray-200 dark:hover:bg-gray-600 opacity-60 hover:opacity-100"
            }`}
            title="3 колонки (симметрично)">
            <Image
              src="/symmetric_3.png"
              alt="1:1:1"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
          <button
            onClick={() => handleLayoutChange("symmetric-1-1")}
            className={`p-1.5 rounded-md transition-all ${
              layoutMode === "symmetric-1-1"
                ? "bg-white dark:bg-gray-500 shadow-sm"
                : "hover:bg-gray-200 dark:hover:bg-gray-600 opacity-60 hover:opacity-100"
            }`}
            title="2 колонки (симметрично)">
            <Image
              src="/symmetric_2.png"
              alt="1:1"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <SortableContext items={visibleItems} strategy={rectSortingStrategy}>
          <div
            className={`grid grid-cols-1 gap-8 ${
              layoutMode === "symmetric-1-1" ? "lg:grid-cols-2" : "lg:grid-cols-3"
            }`}>
            {visibleItems.map((id, index) => {
              const isWide =
                (index % 4 === 0 || index % 4 === 3) && layoutMode === "asymmetric"

              // Расчет высоты для мобильных устройств
              const isExpanded = expandedItems[id] ?? true

              let mobileClass = ""
              if (!isExpanded) {
                mobileClass = "h-[50px]"
              } else {
                // Пользователь попросил не ограничивать высоту на мобильных (ранее было ограничено 600px/450px)
                // Мы используем h-auto, чтобы он рос по мере необходимости контента.
                mobileClass = "h-auto min-h-[300px]"
              }

              // Объединяем с классами для десктопа
              // На десктопе (lg), мы обычно сохраняем фиксированную высоту 450px ИЛИ разрешаем авто, если хотим.
              // Но запрос пользователя был специально сфокусирован на "смартфонах и планшетах".
              // Поэтому я переопределю высоту для мобильных устройств с помощью lg:h-[450px] (стандарт)
              // ЕСЛИ мы не хотим сворачивания и на десктопе? План говорил "Кнопка сворачивания видна только на мобильных/планшетах".
              // Так что на десктопе это всегда "Развернуто" визуально в UI, но состояние может быть любым.
              // Но если кнопка скрыта на десктопе, пользователь не может ее переключить.
              // Так что состояние isExpanded фактически игнорируется визуально на десктопе ИЛИ мы уважаем его, если позволяем им.
              // Я сохраню lg:h-[450px] фиксированным для десктопа, чтобы обеспечить стабильность сетки.

              const className = `${mobileClass} lg:h-[600px] overflow-hidden ${isWide ? "lg:col-span-2" : "lg:col-span-1"} transition-all duration-300`

              return (
                <SortableItem key={id} id={id} className={className}>
                  {renderWidget(id)}
                </SortableItem>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
