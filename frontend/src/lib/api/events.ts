/**
 * API модуль для работы с событиями (WOD, тренировки).
 *
 * @example
 * ```ts
 * import { eventsApi } from '@/lib/api/events'
 * const events = await eventsApi.getUserEvents('userId')
 * ```
 */

import { apiClient } from "./apiClient"
import { CalendarEvent, EventResult, Event, UserEventResult } from "../../types"

interface CreateEventData {
  userId: string
  title: string
  eventDate: string
  description?: string
  exerciseType?: string
  exercises?: unknown[]
  teamId?: string
  timeCap?: string
  rounds?: string
  assignees?: string[]
}

interface UpdateEventData {
  title?: string
  eventDate?: string
  description?: string
  exerciseType?: string
  exercises?: unknown[]
  timeCap?: string
  rounds?: string
}

interface AddResultData {
  time?: string
  username: string
  userId?: string
  value?: number
  scaling?: string
}

export const eventsApi = {
  /** Получить события пользователя */
  getUserEvents: (userId: string, teamId?: string) =>
    apiClient.get<Event[]>("/api/events", { userId, teamId }),

  /** Получить событие по ID */
  getEvent: (eventId: string) => apiClient.get<CalendarEvent>(`/api/events/${eventId}`),

  /** Создать событие */
  createEvent: (data: CreateEventData) =>
    apiClient.post<{ event: CalendarEvent; message: string }>("/api/events", data),

  /** Обновить событие */
  updateEvent: (eventId: string, data: UpdateEventData) =>
    apiClient.put<CalendarEvent>(`/api/events/${eventId}`, data),

  /** Удалить событие */
  deleteEvent: (eventId: string) => apiClient.delete<void>(`/api/events/${eventId}`),

  /** Обновить статус события */
  updateStatus: (eventId: string, status: string) =>
    apiClient.patch<void>(`/api/events/${eventId}/status`, { status }),

  /** Получить результаты события */
  getResults: (eventId: string) =>
    apiClient.get<EventResult[]>(`/api/events/${eventId}/results`),

  /** Добавить результат к событию */
  addResult: (eventId: string, data: AddResultData) =>
    apiClient.post<EventResult>(`/api/events/${eventId}/results`, data),

  /** Получить результаты пользователя */
  getUserResults: (userId: string) =>
    apiClient.get<UserEventResult[]>("/api/events/results/user/${userId}"),

  /** Поставить/убрать лайк результату */
  toggleLike: (resultId: string) =>
    apiClient.post<{ liked: boolean }>(`/api/events/results/${resultId}/like`),

  /** Добавить заметку/комментарий к результату */
  addNote: (resultId: string, notes: string) =>
    apiClient.post<void>(`/api/events/results/${resultId}/notes`, { notes }),
}
