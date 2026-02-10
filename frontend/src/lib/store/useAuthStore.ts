import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { User } from "../../types"

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
          // Получаем CSRF токен перед логином
          await fetch("/api/csrf", {
            method: "GET",
            credentials: "include",
          })

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Важно! Отправляет и получает cookies
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
            })
            return true
          } else {
            return false
          }
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
          // Получаем CSRF токен перед регистрацией
          await fetch("/api/csrf", {
            method: "GET",
            credentials: "include",
          })

          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Важно! Отправляет и получает cookies
            body: JSON.stringify({
              name,
              lastName,
              email,
              password,
              role,
              gender,
              userType,
              organizationName: organizationName || null,
            }),
          })

          const data = await response.json()

          if (response.ok && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
            })
            return true
          } else {
            return false
          }
        } catch (error) {
          return false
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          })
        } catch (error) {
          // Игнорируем ошибки logout на сервере
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
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              set({ user: data.user, isAuthenticated: true })
              return true
            }
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
          const response = await fetch(`/api/auth/user/${state.user.id}`, {
            credentials: "include",
          })

          if (!response.ok) {
            // Пытаемся обновить токен
            const refreshed = await get().refreshToken()
            if (!refreshed) {
              get().logout()
              return false
            }
            return true
          }

          return true
        } catch (error) {
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
