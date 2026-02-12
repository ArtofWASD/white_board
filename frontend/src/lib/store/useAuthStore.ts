import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { User } from "../../types"
import { authApi } from "../api/auth"

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
        } catch (error) {
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
        } catch (error) {
          return false
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
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
        } catch (error) {
          return false
        }
      },

      verifyUser: async () => {
        const state = get()
        if (!state.user) return false

        try {
          // Проверяем токен, запрашивая профиль
          await authApi.getProfile(state.user.id)
          return true
        } catch (error) {
          // Если ошибка (например 401), apiClient уже попытался обновить токен.
          // Если все еще ошибка, значит токен невалиден.
          get().logout()
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
          state.isLoading = false
          // Проверка существования пользователя при регидратации
          if (state.isAuthenticated && state.user) {
            state.verifyUser()
          }
        }
      },
    },
  ),
)
