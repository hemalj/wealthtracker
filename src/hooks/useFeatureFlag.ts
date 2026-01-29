import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

/**
 * Hash user ID to a number for percentage-based rollouts
 */
function hashUserId(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

interface FeatureFlag {
  enabled: boolean
  rolloutPercentage?: number
  allowedEnvironments?: string[]
  allowedUserIds?: string[]
  blockedUserIds?: string[]
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

interface UserOverride {
  enabled: boolean
  expiresAt?: { toDate: () => Date }
}

/**
 * Check if a global feature flag is enabled for a specific user
 */
function checkGlobalFlag(flag: FeatureFlag, userId: string): boolean {
  // If flag is disabled globally, return false
  if (!flag.enabled) return false

  // Check environment restrictions
  const env = import.meta.env.VITE_ENV || 'development'
  if (flag.allowedEnvironments?.length && !flag.allowedEnvironments.includes(env)) {
    return false
  }

  // Check if user is blocked
  if (flag.blockedUserIds?.includes(userId)) return false

  // Check if user is explicitly allowed
  if (flag.allowedUserIds?.includes(userId)) return true

  // Check percentage rollout
  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    const hash = hashUserId(userId)
    return hash % 100 < flag.rolloutPercentage
  }

  // Flag is enabled and no restrictions apply
  return true
}

/**
 * Hook to check if a feature flag is enabled for the current user
 *
 * @param flagId - The feature flag ID (e.g., 'transactions.csv_import.enabled')
 * @param defaultValue - Default value if flag doesn't exist (default: false)
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * ```tsx
 * const isCsvImportEnabled = useFeatureFlag('transactions.csv_import.enabled', true)
 *
 * if (!isCsvImportEnabled) {
 *   return null // Hide feature
 * }
 * ```
 */
export function useFeatureFlag(flagId: string, defaultValue = false): boolean {
  const [isEnabled, setIsEnabled] = useState(defaultValue)
  const user = auth.currentUser

  useEffect(() => {
    if (!user) {
      setIsEnabled(defaultValue)
      return
    }

    // Subscribe to global flag document
    const flagRef = doc(db, 'feature_flags', flagId)
    const unsubscribeFlag = onSnapshot(
      flagRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setIsEnabled(defaultValue)
          return
        }

        const flag = snapshot.data() as FeatureFlag

        // Check for user-level override
        const userOverrideRef = doc(db, `users/${user.uid}/feature_overrides`, flagId)
        const unsubscribeOverride = onSnapshot(
          userOverrideRef,
          (overrideSnapshot) => {
            if (overrideSnapshot.exists()) {
              const override = overrideSnapshot.data() as UserOverride

              // Check if override has expired
              if (override.expiresAt && override.expiresAt.toDate() < new Date()) {
                // Override expired, use global flag
                setIsEnabled(checkGlobalFlag(flag, user.uid))
              } else {
                // Use override value
                setIsEnabled(override.enabled)
              }
            } else {
              // No override, use global flag
              setIsEnabled(checkGlobalFlag(flag, user.uid))
            }
          },
          (error) => {
            console.error('Error fetching feature override:', error)
            setIsEnabled(checkGlobalFlag(flag, user.uid))
          }
        )

        return () => unsubscribeOverride()
      },
      (error) => {
        console.error('Error fetching feature flag:', error)
        setIsEnabled(defaultValue)
      }
    )

    return () => unsubscribeFlag()
  }, [flagId, defaultValue, user])

  return isEnabled
}

/**
 * Hook to get multiple feature flags at once
 */
export function useFeatureFlags(
  flagIds: string[],
  defaultValues: Record<string, boolean> = {}
): Record<string, boolean> {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    flagIds.forEach((id) => {
      initial[id] = defaultValues[id] ?? false
    })
    return initial
  })

  const user = auth.currentUser

  useEffect(() => {
    if (!user) {
      setFlags(defaultValues)
      return
    }

    const unsubscribes: (() => void)[] = []

    flagIds.forEach((flagId) => {
      const flagRef = doc(db, 'feature_flags', flagId)
      const unsubscribe = onSnapshot(
        flagRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setFlags((prev) => ({ ...prev, [flagId]: defaultValues[flagId] ?? false }))
            return
          }

          const flag = snapshot.data() as FeatureFlag
          const enabled = checkGlobalFlag(flag, user.uid)
          setFlags((prev) => ({ ...prev, [flagId]: enabled }))
        },
        (error) => {
          console.error(`Error fetching feature flag ${flagId}:`, error)
          setFlags((prev) => ({ ...prev, [flagId]: defaultValues[flagId] ?? false }))
        }
      )
      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [flagIds.join(','), user])

  return flags
}

export default useFeatureFlag
