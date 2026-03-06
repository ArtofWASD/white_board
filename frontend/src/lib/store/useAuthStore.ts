import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { User } from "../../types"
import { authApi } from "../api/auth"
import { ApiError } from "../api/apiClient" // Import ApiError

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    role: "TRAINER" | "ATHLETE" | "ORGANIZATION_ADMIN",
    gender?: string,
    userType?: string,
    lastName?: string,
    organizationName?: string,
  ) => Promise<boolean>
  logout: () => Promise<void>
  initializeAuth: () => void
  updateUser: (user: User) => void
  verifyUser: () => Promise<boolean>
  refreshToken: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email, password) => {
        try {
          // authApi.login returns { user, message }
          const response = await authApi.login(email, password)

          if (response && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
            })
            return true
          }
          return false
        } catch {
          return false
        }
      },

      register: async (
        name,
        email,
        password,
        role,
        gender,
        userType,
        lastName,
        organizationName,
      ) => {
        try {
          const response = await authApi.register({
            name,
            lastName,
            email,
            password,
            role,
            gender,
            userType,
            organizationName: organizationName || undefined,
          })

          if (response && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
            })
            return true
          }
          return false
        } catch {
          return false
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Игнорируем ошибки logout
        }
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      initializeAuth: () => {
        // С middleware persist нам может не понадобиться эта явная инициализация,
        // если мы доверяем сохраненному состоянию. Однако, чтобы соответствовать оригинальной логике,
        // которая проверяла localStorage вручную, мы можем оставить простую проверку или полагаться на persist.
        // Оригинальный AuthContext проверял localStorage в useEffect.
        // Middleware persist обрабатывает регидратацию автоматически.
        // Нам просто нужно установить isLoading в false после гидратации.
        set({ isLoading: false })
      },

      updateUser: (user) => {
        set({ user })
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken()
          if (response && response.user) {
            set({ user: response.user, isAuthenticated: true })
            return true
          }
          return false
        } catch {
          return false
        }
      },

      verifyUser: async () => {
        const state = get()
        if (!state.user) return false

        // Нормализация: если в стейт попал вложенный объект { user: { ... } }
        // (последствие старого бага), извлекаем реального пользователя.
        const currentUser = (state.user as any).user || state.user
        const userId = currentUser.id

        if (!userId) {
          console.warn("[AuthStore] verifyUser: userId not found", state.user)
          // Если ID вообще нет, разлогиниваем для безопасности
          get().logout()
          return false
        }

        try {
          // Проверяем токен, запрашивая профиль
          const response = await authApi.getProfile(userId)
          // Синхронизируем локальный стор с актуальными данными с сервера
          if (response && response.user) {
            set({ user: response.user, isAuthenticated: true })
          }
          return true
        } catch (error) {
          // Если ошибка 401 или 404, токен невалиден или пользователь удален.
          if (
            error instanceof ApiError &&
            (error.status === 401 || error.status === 404)
          ) {
            get().logout()
          }
          return false
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только user и isAuthenticated, НЕ токены
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Проверка существования пользователя при регидратации
          if (state.isAuthenticated && state.user) {
            // Оставляем isLoading = true на время проверки, чтобы избежать мигания UI
            state.verifyUser().finally(() => {
              useAuthStore.setState({ isLoading: false })
            })
          } else {
            state.isLoading = false
          }
        }
      },
    },
  ),
)
