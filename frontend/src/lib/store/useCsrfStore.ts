import { create } from "zustand"

interface CsrfState {
  csrfToken: string | null
  isLoading: boolean
  fetchCsrfToken: () => Promise<string | null>
  getCsrfToken: () => Promise<string | null>
}

/**
 * Zustand store для управления CSRF токеном
 * Обеспечивает кэширование и автоматическое обновление токена
 */
export const useCsrfStore = create<CsrfState>((set, get) => ({
  csrfToken: null,
  isLoading: false,

  /**
   * Получает новый CSRF токен от сервера
   */
  fetchCsrfToken: async () => {
    set({ isLoading: true })

    try {
      const response = await fetch("/api/csrf", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        console.error("Failed to fetch CSRF token:", response.statusText)
        set({ isLoading: false })
        return null
      }

      const data = await response.json()
      const token = data.csrfToken

      set({ csrfToken: token, isLoading: false })
      return token
    } catch (error) {
      console.error("Error fetching CSRF token:", error)
      set({ isLoading: false })
      return null
    }
  },

  /**
   * Возвращает текущий CSRF токен или получает новый, если его нет
   */
  getCsrfToken: async () => {
    const state = get()

    // Если токен уже есть, возвращаем его
    if (state.csrfToken) {
      return state.csrfToken
    }

    // Если идет загрузка, ждем ее завершения
    if (state.isLoading) {
      // Простая реализация ожидания - повторяем попытку через 100мс
      await new Promise((resolve) => setTimeout(resolve, 100))
      return get().csrfToken
    }

    // Иначе получаем новый токен
    return state.fetchCsrfToken()
  },
}))
