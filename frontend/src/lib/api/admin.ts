import { apiClient } from "./apiClient"
// import { Exercise } from "../../types" // Removed as we use GlobalExercise locally

// TODO: Move these types to global types file if reused elsewhere
export interface Wod {
  id: string
  name: string
  description: string
  type: string
  scheme?: string
  isGlobal: boolean
  muscleGroups?: string[]
  createdAt?: string
}

export interface News {
  id: string
  title: string
  content: string
  excerpt?: string
  imageUrl?: string
  createdAt: string
}

export interface SystemSetting {
  key: string
  value: string
  description?: string
}

export interface GlobalExercise {
  id: string
  name: string
  description?: string
  videoUrl?: string
  muscleGroups?: string[]
}

export const adminApi = {
  // --- Content: WODs ---
  getWods: () => apiClient.get<Wod[]>("/api/admin/wods"),
  createWod: (data: Omit<Wod, "id" | "createdAt">) =>
    apiClient.post<Wod>("/api/admin/wods", data),
  updateWod: (id: string, data: Partial<Wod>) =>
    apiClient.patch<Wod>(`/api/admin/wods/${id}`, data),
  deleteWod: (id: string) => apiClient.delete<void>(`/api/admin/wods/${id}`),

  // --- Content: Exercises ---
  getExercises: () => apiClient.get<GlobalExercise[]>("/api/admin/exercises"),
  createExercise: (data: Omit<GlobalExercise, "id">) =>
    apiClient.post<GlobalExercise>("/api/admin/exercises", data),
  updateExercise: (id: string, data: Partial<GlobalExercise>) =>
    apiClient.put<GlobalExercise>(`/api/admin/exercises/${id}`, data),
  deleteExercise: (id: string) => apiClient.delete<void>(`/api/admin/exercises/${id}`),

  // --- Content: News ---
  // News endpoints are shared but admin actions are typically protected
  getNews: () => apiClient.get<News[]>("/api/news"),
  createNews: (data: Omit<News, "id" | "createdAt">) =>
    apiClient.post<News>("/api/news", data),
  updateNews: (id: string, data: Partial<News>) =>
    apiClient.patch<News>(`/api/news/${id}`, data),
  deleteNews: (id: string) => apiClient.delete<void>(`/api/news/${id}`),

  // --- Settings ---
  getSettings: () => apiClient.get<SystemSetting[]>("/api/settings"),
  updateSetting: (key: string, value: string) =>
    apiClient.patch<SystemSetting>(`/api/settings/${key}`, { value }),
}
