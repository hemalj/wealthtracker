import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthState } from '@/types'

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          loading: false,
          error: null,
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) =>
        set({
          error,
          loading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
