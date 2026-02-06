import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role: 'TRAINER' | 'ATHLETE' | 'ORGANIZATION_ADMIN',
    gender?: string,
    userType?: string,
    lastName?: string,
    organizationName?: string
  ) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
  updateUser: (user: User) => void;
  verifyUser: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email, password) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok && data.user && data.token) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
            });
            return true;
          } else {

            return false;
          }
        } catch (error) {

          return false;
        }
      },

      register: async (name, email, password, role, gender, userType, lastName, organizationName) => {
        try {

          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              name, 
              lastName, 
              email, 
              password, 
              role, 
              gender, 
              userType, 
              organizationName: organizationName || null 
            }),
          });

          const data = await response.json();

          if (response.ok && data.user && data.token) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
            });
            return true;
          } else {

            return false;
          }
        } catch (error) {

          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      },

      initializeAuth: () => {
        // С middleware persist нам может не понадобиться эта явная инициализация,
        // если мы доверяем сохраненному состоянию. Однако, чтобы соответствовать оригинальной логике,
        // которая проверяла localStorage вручную, мы можем оставить простую проверку или полагаться на persist.
        // Оригинальный AuthContext проверял localStorage в useEffect.
        // Middleware persist обрабатывает регидратацию автоматически.
        // Нам просто нужно установить isLoading в false после гидратации.
        set({ isLoading: false });
      },

      updateUser: (user) => {
        set({ user });
      },

      verifyUser: async () => {
        const state = get();
        if (!state.user || !state.token) return false;

        try {
            const response = await fetch(`/api/auth/user/${state.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });

            if (!response.ok) {
                // Если пользователь не найден или не авторизован, выйти

                get().logout();
                return false;
            }
            
            // При необходимости обновите данные пользователя здесь
            return true;
        } catch (error) {

            // При сетевой ошибке мы можем не хотеть немедленно выходить, но пока будем осторожны
            // или просто вернем false и позволим вызывающему решать. 
            // Лучше выходить только при явном 401/404. 
            // Пока, если запрос полностью не удался, мы ничего не делаем, чтобы избежать выхода офлайн пользователей?
            // Но пользователь специально просил "если база данных пуста". Это подразумевает 404/401.
            return false;
        }
      },
    }),
    {
      name: 'auth-storage', // имя элемента в хранилище (должно быть уникальным)
      storage: createJSONStorage(() => localStorage), // (необязательно) по умолчанию используется 'localStorage'
      onRehydrateStorage: () => (state) => {
        if (state) {
            state.isLoading = false;
            // Проверка существования пользователя при регидратации (загрузка приложения)
            if (state.isAuthenticated && state.user) {
                state.verifyUser();
            }
        }
      }
    }
  )
);
