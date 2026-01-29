import type { Timestamp } from 'firebase/firestore'

export interface User {
  id: string
  email: string
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  lastLoginAt: Timestamp | Date
  preferences: UserPreferences
  role: UserRole
}

export interface UserPreferences {
  defaultCurrency: string
  theme: 'light' | 'dark' | 'system'
  language: string
  dateFormat: string
  numberFormat: string
  dashboardLayout?: DashboardLayout
  notifications: NotificationSettings
}

export interface DashboardLayout {
  widgets: DashboardWidget[]
  columns: number
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  position: { x: number; y: number }
  size: { width: number; height: number }
  settings?: Record<string, unknown>
}

export type WidgetType =
  | 'net-worth'
  | 'accounts-summary'
  | 'recent-transactions'
  | 'spending-chart'
  | 'income-chart'
  | 'investment-performance'

export interface NotificationSettings {
  email: boolean
  push: boolean
  transactionAlerts: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

export type UserRole = 'user' | 'admin'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  displayName: string
  confirmPassword: string
}

export interface UpdateProfileInput {
  displayName?: string
  photoURL?: string
  preferences?: Partial<UserPreferences>
}
