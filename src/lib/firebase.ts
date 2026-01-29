import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth'
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import {
  getFunctions,
  type Functions,
  connectFunctionsEmulator,
} from 'firebase/functions'
import { getStorage, type FirebaseStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let functions: Functions
let storage: FirebaseStorage

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  functions = getFunctions(app)
  storage = getStorage(app)

  // Connect to emulators if enabled
  if (import.meta.env.VITE_ENABLE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
    connectStorageEmulator(storage, '127.0.0.1', 9199)
    console.log('🔧 Connected to Firebase Emulators')
  }

  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Error initializing Firebase:', error)
  throw error
}

export { app, auth, db, functions, storage }
