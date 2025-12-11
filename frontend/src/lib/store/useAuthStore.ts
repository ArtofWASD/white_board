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
            console.error('Login failed:', data.message);
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      register: async (name, email, password, role, gender, userType, lastName, organizationName) => {
        try {
          console.log('Registering with data:', { name, lastName, email, role, gender, userType, organizationName });
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, lastName, email, password, role, gender, userType, organizationName }),
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
            console.error('Registration failed:', data.message);
            return false;
          }
        } catch (error) {
          console.error('Registration error:', error);
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
        // With persist middleware, we might not need this explicit initialization 
        // if we trust the persisted state. However, to match the original logic 
        // which checked localStorage manually, we can keep a simple check or rely on persist.
        // The original AuthContext checked localStorage in useEffect.
        // The persist middleware handles rehydration automatically.
        // We just need to set isLoading to false after hydration.
        set({ isLoading: false });
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
        if (state) {
            state.isLoading = false;
        }
      }
    }
  )
);
