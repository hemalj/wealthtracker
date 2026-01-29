import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type FieldValue,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User as AppUser, UserPreferences } from '@/types'

// Type for creating user document (uses FieldValue for timestamps)
interface CreateUserData {
  email: string
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  role: 'user' | 'admin'
  preferences: UserPreferences
  createdAt: FieldValue
  updatedAt: FieldValue
  lastLoginAt: FieldValue
}

// Default user preferences
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

// Create user document in Firestore
const createUserDocument = async (
  user: User,
  additionalData?: { displayName?: string }
): Promise<void> => {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const userData: CreateUserData = {
      email: user.email || '',
      displayName: additionalData?.displayName || user.displayName || null,
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      role: 'user',
      preferences: defaultPreferences,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    }

    await setDoc(userRef, userData)
  } else {
    // Update last login time
    await setDoc(
      userRef,
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    )
  }
}

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  // Update profile with display name
  await updateProfile(userCredential.user, { displayName })

  // Create user document in Firestore
  await createUserDocument(userCredential.user, { displayName })

  // Send email verification
  await sendEmailVerification(userCredential.user)

  return userCredential
}

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  // Update last login time
  await createUserDocument(userCredential.user)

  return userCredential
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')

  const userCredential = await signInWithPopup(auth, provider)

  // Create/update user document in Firestore
  await createUserDocument(userCredential.user)

  return userCredential
}

// Sign out
export const logout = async (): Promise<void> => {
  await signOut(auth)
}

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email)
}

// Resend email verification
export const resendEmailVerification = async (): Promise<void> => {
  const user = auth.currentUser
  if (user) {
    await sendEmailVerification(user)
  } else {
    throw new Error('No user is currently signed in')
  }
}

// Get current user from Firestore
export const getCurrentUserData = async (): Promise<AppUser | null> => {
  const user = auth.currentUser
  if (!user) return null

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return {
      id: userSnap.id,
      ...userSnap.data(),
    } as AppUser
  }

  return null
}

// Subscribe to auth state changes
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback)
}

// Get Firebase auth error message
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
  }

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.'
}
