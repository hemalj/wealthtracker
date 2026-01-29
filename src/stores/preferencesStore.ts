import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences } from '@/types'

interface PreferencesStore {
  preferences: UserPreferences
  setPreferences: (preferences: Partial<UserPreferences>) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setCurrency: (currency: string) => void
  setLanguage: (language: string) => void
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  defaultCurrency: 'USD',
  theme: 'system',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'en-US',
  notifications: {
    email: true,
    push: true,
    transactionAlerts: true,
    weeklyReports: true,
    monthlyReports: false,
  },
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,

      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            theme,
          },
        })),

      setCurrency: (defaultCurrency) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            defaultCurrency,
          },
        })),

      setLanguage: (language) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            language,
          },
        })),

      resetPreferences: () =>
        set({
          preferences: defaultPreferences,
        }),
    }),
    {
      name: 'preferences-storage',
    }
  )
)
