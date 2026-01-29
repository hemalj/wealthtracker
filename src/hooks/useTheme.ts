import { useMemo, useEffect } from 'react'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { getTheme } from '@/theme/theme'

export const useTheme = () => {
  const { preferences, setTheme } = usePreferencesStore()

  // Determine the effective theme mode
  const themeMode = useMemo(() => {
    if (preferences.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return preferences.theme
  }, [preferences.theme])

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => {
        // Force re-render by updating a dummy state or using a callback
        setTheme('system')
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [preferences.theme, setTheme])

  const theme = useMemo(() => getTheme(themeMode), [themeMode])

  return {
    theme,
    themeMode,
    themeSetting: preferences.theme,
    setTheme,
  }
}
