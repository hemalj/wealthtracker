import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
  functions: {},
  storage: {},
}))

// Mock environment variables
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com')
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id')
vi.stubEnv('VITE_ENV', 'test')
vi.stubEnv('VITE_ENABLE_EMULATORS', 'false')

// Extend expect matchers
expect.extend({})
