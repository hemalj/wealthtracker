import { useEffect } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types'

export const useAuth = () => {
  const { user, loading, error, isAuthenticated, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Convert Firebase user to our User type
          const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(firebaseUser.metadata.creationTime!),
            updatedAt: new Date(firebaseUser.metadata.lastSignInTime!),
            lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime!),
            preferences: {
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
            },
            role: 'user',
          }
          setUser(appUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [setUser, setLoading])

  return {
    user,
    loading,
    error,
    isAuthenticated,
  }
}
