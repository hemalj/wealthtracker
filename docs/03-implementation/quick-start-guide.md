# Quick Start Guide

## Overview

This guide will help you set up your development environment and start building WealthTracker from scratch.

**Time to Complete**: 30-60 minutes
**Prerequisites**: Basic knowledge of React, TypeScript, and Firebase

---

## Phase 1: Environment Setup (15 minutes)

### 1. Install Required Software

**Node.js v20 LTS**:
```bash
# Download from nodejs.org or use nvm
nvm install 20
nvm use 20
node --version  # Should show v20.x.x
```

**VS Code** (Recommended):
- Download from code.visualstudio.com
- Install recommended extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Firebase
  - Error Lens

**Firebase CLI**:
```bash
npm install -g firebase-tools
firebase --version  # Should show v13.x.x
```

---

### 2. Create Firebase Project

**Step 1**: Go to [Firebase Console](https://console.firebase.google.com/)

**Step 2**: Click "Add Project"
- Project name: `wealthtracker-dev` (for development)
- Disable Google Analytics for now (can enable later)
- Click "Create Project"

**Step 3**: Enable Firebase Services

**Authentication**:
- Go to Authentication → Get Started
- Enable Email/Password
- Enable Google Sign-In
  - Add support email
  - Save

**Firestore Database**:
- Go to Firestore Database → Create Database
- Start in **Test Mode** (we'll add rules later)
- Choose location (e.g., us-central)
- Click Enable

**Storage**:
- Go to Storage → Get Started
- Start in **Test Mode**
- Click Done

**Hosting**:
- Already enabled by default

**Step 4**: Create Web App
- Go to Project Settings (gear icon) → General
- Scroll down to "Your apps"
- Click Web icon (</>)
- App nickname: `wealthtracker-web`
- Check "Also set up Firebase Hosting"
- Click "Register app"
- **Save the config object** (you'll need it later):
  ```javascript
  const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  };
  ```

---

### 3. Create EODHD Account

**Step 1**: Go to [EODHD](https://eodhd.com/)

**Step 2**: Sign up for an account

**Step 3**: Subscribe to Startup Plan ($20/month)
- Or use free tier for initial development (limited to 20 API calls/day)

**Step 4**: Get API Key
- Go to Dashboard → API Key
- **Save your API key** (you'll need it later)

---

## Phase 2: Project Setup (20 minutes)

### 1. Initialize React Project

```bash
# Create project with Vite
npm create vite@latest wealthtracker -- --template react-ts

# Navigate to project
cd wealthtracker

# Install dependencies
npm install
```

---

### 2. Install Firebase and Core Dependencies

```bash
# Firebase
npm install firebase

# UI Library (Material-UI)
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# State Management
npm install zustand
npm install @tanstack/react-query

# Routing
npm install react-router-dom

# Forms and Validation
npm install react-hook-form zod @hookform/resolvers

# Charts
npm install recharts

# Utilities
npm install date-fns lodash-es clsx numeral
npm install -D @types/lodash-es @types/numeral

# Dev Dependencies
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

---

### 3. Initialize Firebase in Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select features (use Space to select, Enter to confirm):
# - Firestore
# - Functions
# - Hosting
# - Storage
# - Emulators

# Follow prompts:
# - Use an existing project: wealthtracker-dev
# - Firestore rules: firestore.rules
# - Firestore indexes: firestore.indexes.json
# - Functions: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
# - Hosting public directory: dist
# - Single-page app: Yes
# - GitHub deploys: No (for now)
# - Storage rules: storage.rules
# - Emulators: Auth, Firestore, Functions, Storage
# - Emulator ports: Use defaults
```

---

### 4. Configure Environment Variables

Create `.env.development` file in project root:

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Environment
VITE_ENV=development

# EODHD API (will be used in Cloud Functions)
EODHD_API_KEY=your_eodhd_api_key
```

Create `.env.production` file:
```env
# Same as .env.development but with production values
VITE_ENV=production
```

Add to `.gitignore`:
```
.env.development
.env.production
.env.local
```

---

### 5. Project Structure

Create the following folder structure:

```bash
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/store
mkdir -p src/services
```

**Recommended Structure**:
```
wealthtracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Buttons, inputs, cards, etc.
│   │   ├── layout/          # Header, sidebar, footer
│   │   └── features/        # Feature-specific components
│   ├── pages/               # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Accounts.tsx
│   │   └── Settings.tsx
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # External service integrations
│   │   └── firebase.ts      # Firebase initialization
│   ├── services/            # API calls and data fetching
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── functions/               # Cloud Functions (Firebase)
│   ├── src/
│   │   ├── index.ts         # Functions entry point
│   │   ├── auth.ts          # Auth-related functions
│   │   ├── portfolio.ts     # Portfolio calculations
│   │   └── eodhd.ts         # EODHD API proxy
│   └── package.json
├── docs/                    # Documentation (this folder)
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore indexes
├── storage.rules            # Storage security rules
├── firebase.json            # Firebase config
├── .env.development         # Dev environment variables
├── .env.production          # Prod environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Phase 3: Core Implementation (25 minutes)

### 1. Initialize Firebase SDK

Create `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (import.meta.env.VITE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

### 2. Create Authentication Hook

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

---

### 3. Create Basic App Structure

Update `src/App.tsx`:

```typescript
import { useAuth } from './hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Pages (create these next)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### 4. Create Login Page

Create `src/pages/Login.tsx`:

```typescript
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Box, Button, TextField, Typography, Container } from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          WealthTracker
        </Typography>
        <form onSubmit={handleEmailLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
        <Button fullWidth variant="outlined" onClick={handleGoogleLogin} sx={{ mt: 2 }}>
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
}
```

---

### 5. Create Dashboard Placeholder

Create `src/pages/Dashboard.tsx`:

```typescript
import { Box, Typography, Button } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Dashboard() {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <Box p={4}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography>Welcome to WealthTracker!</Typography>
      <Button onClick={handleLogout} variant="outlined" sx={{ mt: 2 }}>
        Logout
      </Button>
    </Box>
  );
}
```

---

### 6. Configure Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Accounts collection
    match /accounts/{accountId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
    }

    // Transactions collection
    match /transactions/{transactionId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Phase 4: Run the Application (10 minutes)

### 1. Start Firebase Emulators

```bash
# In project root
firebase emulators:start
```

**Emulator UI**: http://localhost:4000

You should see:
- Authentication Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
- Storage Emulator: http://localhost:9199

---

### 2. Start Development Server

In a new terminal:

```bash
npm run dev
```

**App URL**: http://localhost:5173

---

### 3. Test the Application

1. Open http://localhost:5173
2. Click "Sign in with Google" (will use emulator, no real Google account needed)
3. Complete authentication
4. You should see the Dashboard page
5. Click "Logout" to test logout

**Congratulations!** You have a working authentication flow! 🎉

---

## Next Steps

Now that you have the foundation, follow these steps to build out the application:

### Week 1: Account Management
1. Create accounts list page
2. Implement account CRUD operations
3. Create account detail view
4. Add account selector component

**Reference**: `docs/01-business-requirements/feature-specifications.md` (Section 4)

---

### Week 2: Transaction Management
1. Create transactions list page
2. Build transaction form (all transaction types)
3. Implement symbol autocomplete
4. Add transaction CRUD operations
5. Add search and filtering

**Reference**: `docs/01-business-requirements/feature-specifications.md` (Section 3)

---

### Week 3: Holdings Calculation
1. Create Cloud Function to calculate holdings
2. Implement FIFO cost basis tracking
3. Build holdings table component
4. Add holdings summary cards
5. Integrate real-time price fetching (EODHD)

**Reference**: `docs/02-technical-architecture/data-models.md` (Holdings Collection)

---

### Week 4: Dashboard & Reporting
1. Complete dashboard layout
2. Add holdings charts
3. Implement dividend tracking
4. Build performance metrics
5. Add data export functionality

**Reference**: `docs/01-business-requirements/feature-specifications.md` (Section 2)

---

## Development Tips

### Hot Reload
- Vite provides instant HMR (Hot Module Replacement)
- Changes appear immediately without full refresh

### Debugging
- Use React DevTools (Chrome extension)
- Use Firebase Emulator UI to inspect data
- Use VS Code debugger for server-side (Cloud Functions)

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Deployment (when ready)
```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting + Functions
firebase deploy

# Deploy hosting only
firebase deploy --only hosting

# Deploy functions only
firebase deploy --only functions
```

---

## Common Issues & Solutions

### Issue: Firebase emulators not starting
**Solution**:
- Check if ports are already in use
- Kill processes: `lsof -ti:8080 | xargs kill`
- Try `firebase emulators:start --only firestore,auth`

### Issue: Vite can't find environment variables
**Solution**:
- Ensure `.env.development` exists
- Variables must start with `VITE_`
- Restart dev server after changing env vars

### Issue: Firebase authentication not working
**Solution**:
- Check if Auth emulator is running
- Verify `connectAuthEmulator` is called in `firebase.ts`
- Clear browser cache/cookies

### Issue: TypeScript errors
**Solution**:
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` for correct settings
- Install missing type definitions: `npm install -D @types/package-name`

---

## Resources

### Documentation
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Firebase: https://firebase.google.com/docs
- Material-UI: https://mui.com/
- Vite: https://vitejs.dev/

### Tutorials
- Firebase + React: https://firebase.google.com/docs/web/setup
- React Query: https://tanstack.com/query/latest/docs/react/overview
- React Hook Form: https://react-hook-form.com/

### Community
- Stack Overflow: Tag `reactjs`, `firebase`, `typescript`
- Firebase Discord: https://discord.gg/BN2cgc3
- Reddit: r/reactjs, r/Firebase

---

## Summary

You've successfully:
✅ Set up development environment
✅ Created Firebase project
✅ Initialized React + TypeScript project
✅ Implemented authentication
✅ Created basic app structure
✅ Started Firebase emulators

**You're ready to start building! 🚀**

**Next**: Follow the [MVP Roadmap](../01-business-requirements/mvp-roadmap.md) for development schedule.

---

## Support

If you get stuck:
1. Check the detailed documentation in `docs/` folder
2. Review Firebase documentation
3. Search Stack Overflow
4. Ask in Firebase Discord community

**Happy coding! 💻**
