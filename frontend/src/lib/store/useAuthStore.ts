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
                // If user not found or unauthorized, logout
                console.warn('User verification failed, logging out...');
                get().logout();
                return false;
            }
            
            // Optionally update user data here if needed
            return true;
        } catch (error) {
            console.error('Verification error:', error);
            // On network error we might not want to logout immediately, but for now let's be safe
            // or just return false and let the caller decide. 
            // Better to only logout on explicit 401/404. 
            // For now, if request fails completely, we do nothing to avoid logging out offline users?
            // But the user specifically asked for "if database is empty". That implies 404/401.
            return false;
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
        if (state) {
            state.isLoading = false;
            // Verify user existence on rehydration (app load)
            if (state.isAuthenticated && state.user) {
                state.verifyUser();
            }
        }
      }
    }
  )
);
