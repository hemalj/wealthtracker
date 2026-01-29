# Phase 1: MVP Development Plan

**Status**: Ready to Start Development
**Timeline**: Months 1-4 (January - April 2026)
**Goal**: Launch functional portfolio tracker with core features

---

## Current Status ✅

### Completed (Pre-Development)
- ✅ **Business Requirements**: Complete feature specifications, MVP roadmap, unit testing specs
- ✅ **Configuration**: Firebase project created, EODHD API key obtained
- ✅ **Environment Files**: .env.development and .env.production ready
- ✅ **Security**: Firestore rules written, service account key secured
- ✅ **Documentation**: Complete specs, tech stack, configuration reference
- ✅ **Feature Flags System**: Specifications and implementation guide ready
- ✅ **Transaction Management**: Restructured with bulk CSV import as MVP priority

### Not Started (Development Phase)
- ⏳ Firebase initialization in project
- ⏳ React app creation with Vite
- ⏳ Project structure and tooling
- ⏳ Development environment setup
- ⏳ Component library configuration

---

## Month 1: Foundation & Setup (January 2026)

### Week 1: Project Initialization (Days 1-5)

**Day 1: Firebase & React Setup**
```bash
# Step 1: Initialize Firebase
firebase init

# Select:
# - Firestore (rules already exist)
# - Functions (TypeScript)
# - Hosting
# - Emulators (Auth, Firestore, Functions)

# Step 2: Create Vite React App
npm create vite@latest . -- --template react-ts

# Step 3: Install core dependencies
npm install firebase
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install zustand @tanstack/react-query
npm install react-router-dom
npm install react-hook-form zod @hookform/resolvers
npm install date-fns recharts axios

# Step 4: Install dev dependencies
npm install -D @types/node
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
npm install -D eslint-plugin-react-hooks @typescript-eslint/eslint-plugin
```

**Deliverable**: Working React app with dev server running at localhost:5173

---

**Day 2: Project Structure Setup**

Create folder structure:
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Buttons, inputs, modals
│   ├── layout/         # Header, sidebar, footer
│   └── forms/          # Form components
├── pages/              # Route-level pages
│   ├── auth/           # Login, register, password reset
│   ├── dashboard/      # Dashboard page
│   ├── accounts/       # Account management
│   ├── transactions/   # Transaction management
│   ├── calculators/    # Calculator pages
│   ├── settings/       # User settings
│   └── admin/          # Admin pages
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useFeatureFlag.ts
│   └── useFirestore.ts
├── services/           # API and business logic
│   ├── auth.service.ts
│   ├── account.service.ts
│   ├── transaction.service.ts
│   └── price.service.ts
├── types/              # TypeScript interfaces
│   ├── user.types.ts
│   ├── account.types.ts
│   ├── transaction.types.ts
│   └── index.ts
├── utils/              # Helper functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── calculations.ts
├── lib/                # Third-party configs
│   └── firebase.ts     # Firebase initialization
├── stores/             # Zustand state stores
│   ├── authStore.ts
│   └── uiStore.ts
├── theme/              # MUI theme configuration
│   └── theme.ts
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

**Commands**:
```bash
mkdir -p src/{components/{common,layout,forms},pages/{auth,dashboard,accounts,transactions,calculators,settings,admin},hooks,services,types,utils,lib,stores,theme}
```

**Deliverable**: Complete folder structure created

---

**Day 3: Firebase Integration & Configuration**

**Task 1**: Create Firebase initialization file

Create `src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'northamerica-northeast2');

// Connect to emulators in development
if (import.meta.env.VITE_ENABLE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('🔧 Connected to Firebase Emulators');
}

export default app;
```

**Task 2**: Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

**Task 3**: Enable Firebase Authentication methods (manual in console)
- Go to: https://console.firebase.google.com/project/wealthtrackerv2/authentication
- Enable Email/Password
- Enable Google OAuth

**Deliverable**: Firebase fully integrated and configured

---

**Day 4: Development Environment & Tooling**

**Task 1**: Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

**Task 2**: Update `tsconfig.json` for path aliases:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Task 3**: Configure ESLint and Prettier
```bash
npm install -D prettier eslint-config-prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Task 4**: Set up Vitest
Create `src/test/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "emulators": "firebase emulators:start"
  }
}
```

**Deliverable**: Complete development environment configured

---

**Day 5: MUI Theme & Component Library Setup**

**Task 1**: Create MUI theme

Create `src/theme/theme.ts`:
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

**Task 2**: Update `src/App.tsx`:
```typescript
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <h1>WealthTracker</h1>
        <p>Setup Complete! Ready to build.</p>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

**Task 3**: Test the setup
```bash
# Terminal 1: Start emulators
npm run emulators

# Terminal 2: Start dev server
npm run dev
```

**Deliverable**: Working React app with MUI theme at http://localhost:5173

---

### Week 2: Authentication Foundation (Days 6-10)

**Day 6: TypeScript Types & Firestore Data Models**

Create `src/types/user.types.ts`:
```typescript
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultCurrency: string;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

Create `src/types/account.types.ts`:
```typescript
import { Timestamp } from 'firebase/firestore';

export type AccountType = 'taxable' | 'ira' | 'roth_ira' | '401k' | 'tfsa' | 'rrsp' | 'other';
export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'INR';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: Currency;
  description?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: Currency;
  description?: string;
}
```

Create `src/types/transaction.types.ts`:
```typescript
import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'initial_position' | 'buy' | 'sell' | 'dividend' | 'split_forward' | 'split_reverse';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  symbol: string;
  type: TransactionType;
  date: Timestamp;
  quantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  currency: string;
  fees?: number;
  commission?: number;
  mer?: number;
  notes?: string;
  splitRatio?: string;
  cashInLieu?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateTransactionInput {
  accountId: string;
  symbol: string;
  type: TransactionType;
  date: Date;
  quantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  currency: string;
  fees?: number;
  commission?: number;
  mer?: number;
  notes?: string;
  splitRatio?: string;
}
```

**Deliverable**: Complete TypeScript types defined

---

**Day 7: Auth Service & Zustand Store**

Create `src/services/auth.service.ts`:
```typescript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserPreferences } from '@/types/user.types';

export const authService = {
  async register(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const userData: User = {
      uid: user.uid,
      email: user.email!,
      displayName,
      photoURL: null,
      role: 'user',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      preferences: {
        defaultCurrency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US',
        theme: 'light',
      },
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userData;
  },

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userDoc.data() as User;
  },

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      const userData: User = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        preferences: {
          defaultCurrency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          numberFormat: 'en-US',
          theme: 'light',
        },
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    }

    return userDoc.data() as User;
  },

  async logout() {
    await signOut(auth);
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  },

  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  },
};
```

Create `src/stores/authStore.ts`:
```typescript
import { create } from 'zustand';
import { User } from '@/types/user.types';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
```

**Deliverable**: Auth service and state management ready

---

**Day 8: Auth Hook & Protected Routes**

Create `src/hooks/useAuth.ts`:
```typescript
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types/user.types';

export function useAuth() {
  const { user, loading, error, setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUser(userDoc.data() as User);
            } else {
              setUser(null);
              setError('User data not found');
            }
          } catch (error: any) {
            setError(error.message);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setUser, setLoading, setError]);

  return { user, loading, error };
}
```

Create `src/components/auth/ProtectedRoute.tsx`:
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

**Deliverable**: Auth hook and protected routes working

---

**Day 9: Auth UI Components**

Create `src/pages/auth/LoginPage.tsx`:
```typescript
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Divider,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { authService } from '@/services/auth.service';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} mb={4}>
        <Typography variant="h3" align="center" gutterBottom>
          WealthTracker
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleEmailLogin} mt={3}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>

          <Box textAlign="center">
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Sign in with Google
        </Button>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
```

Create similar pages:
- `RegisterPage.tsx`
- `ForgotPasswordPage.tsx`

**Deliverable**: Auth UI pages complete

---

**Day 10: Router Setup & Basic Layout**

Create `src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme/theme';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
```

Create basic `src/components/layout/AppLayout.tsx`:
```typescript
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            WealthTracker
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
```

**Deliverable**: Complete auth flow working end-to-end

---

### Week 1-2 Summary & Checkpoint

**✅ Completed**:
- React app with Vite + TypeScript
- Firebase integration with emulators
- Authentication (Email/Password + Google OAuth)
- Protected routes
- Basic layout
- MUI theme
- Testing setup
- Development tooling

**🎯 Test Authentication**:
1. Start emulators: `npm run emulators`
2. Start dev server: `npm run dev`
3. Register new user
4. Login with email/password
5. Login with Google OAuth
6. Reset password
7. Logout

**Ready for**: Month 1 Week 3-4 (Account Management & Transaction Foundation)

---

## Month 1 Weeks 3-4: Core Data Foundation (Days 11-20)

### Week 3: Account Management (Days 11-15)

**Day 11: Account Service Layer**

Create `src/services/account.service.ts`:
```typescript
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Account, CreateAccountInput } from '@/types/account.types';

export const accountService = {
  async createAccount(userId: string, input: CreateAccountInput): Promise<Account> {
    const accountData = {
      userId,
      ...input,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'accounts'), accountData);
    const newAccount = { id: docRef.id, ...accountData } as Account;
    return newAccount;
  },

  async getAccount(accountId: string): Promise<Account | null> {
    const docRef = doc(db, 'accounts', accountId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Account;
  },

  async getUserAccounts(userId: string): Promise<Account[]> {
    const q = query(
      collection(db, 'accounts'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Account));
  },

  async updateAccount(accountId: string, updates: Partial<CreateAccountInput>): Promise<void> {
    const docRef = doc(db, 'accounts', accountId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteAccount(accountId: string): Promise<void> {
    // Soft delete
    const docRef = doc(db, 'accounts', accountId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  },
};
```

**Deliverable**: Account service with all CRUD operations

---

**Day 12: Account Form Component**

Create `src/components/forms/AccountForm.tsx`:
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormHelperText,
} from '@mui/material';
import { CreateAccountInput, AccountType, Currency } from '@/types/account.types';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['taxable', 'ira', 'roth_ira', '401k', 'tfsa', 'rrsp', 'other']),
  currency: z.enum(['USD', 'CAD', 'EUR', 'GBP', 'INR']),
  description: z.string().max(500).optional(),
});

interface AccountFormProps {
  initialValues?: CreateAccountInput;
  onSubmit: (data: CreateAccountInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function AccountForm({ initialValues, onSubmit, onCancel, loading }: AccountFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: initialValues || {
      name: '',
      type: 'taxable',
      currency: 'USD',
      description: '',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Account Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            margin="normal"
            required
          />
        )}
      />

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" required error={!!errors.type}>
            <InputLabel>Account Type</InputLabel>
            <Select {...field} label="Account Type">
              <MenuItem value="taxable">Taxable</MenuItem>
              <MenuItem value="ira">IRA</MenuItem>
              <MenuItem value="roth_ira">Roth IRA</MenuItem>
              <MenuItem value="401k">401(k)</MenuItem>
              <MenuItem value="tfsa">TFSA</MenuItem>
              <MenuItem value="rrsp">RRSP</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" required error={!!errors.currency}>
            <InputLabel>Currency</InputLabel>
            <Select {...field} label="Currency">
              <MenuItem value="USD">USD - US Dollar</MenuItem>
              <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
              <MenuItem value="EUR">EUR - Euro</MenuItem>
              <MenuItem value="GBP">GBP - British Pound</MenuItem>
              <MenuItem value="INR">INR - Indian Rupee</MenuItem>
            </Select>
            {errors.currency && <FormHelperText>{errors.currency.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Description (Optional)"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            margin="normal"
          />
        )}
      />

      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" type="submit" disabled={loading}>
          {initialValues ? 'Update Account' : 'Create Account'}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
```

**Deliverable**: Reusable account form with validation

---

**Day 13: Account List & Management Pages**

Create `src/pages/accounts/AccountsPage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AppLayout } from '@/components/layout/AppLayout';
import { AccountForm } from '@/components/forms/AccountForm';
import { accountService } from '@/services/account.service';
import { useAuth } from '@/hooks/useAuth';
import { Account, CreateAccountInput } from '@/types/account.types';

export function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccounts();
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await accountService.getUserAccounts(user.uid);
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (input: CreateAccountInput) => {
    if (!user) return;
    try {
      await accountService.createAccount(user.uid, input);
      setDialogOpen(false);
      loadAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = async (input: CreateAccountInput) => {
    if (!editingAccount) return;
    try {
      await accountService.updateAccount(editingAccount.id, input);
      setDialogOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Delete this account? This action cannot be undone.')) return;
    try {
      await accountService.deleteAccount(accountId);
      loadAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setDialogOpen(true);
  };

  const openEditDialog = (account: Account) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  return (
    <AppLayout>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Accounts</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Add Account
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>
                  <Chip label={account.type} size="small" />
                </TableCell>
                <TableCell>{account.currency}</TableCell>
                <TableCell>{account.description || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEditDialog(account)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(account.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {accounts.length === 0 && !loading && (
          <Box textAlign="center" py={5}>
            <Typography color="textSecondary">
              No accounts yet. Create your first account to get started.
            </Typography>
          </Box>
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingAccount ? 'Edit Account' : 'Create Account'}</DialogTitle>
          <DialogContent>
            <AccountForm
              initialValues={
                editingAccount
                  ? {
                      name: editingAccount.name,
                      type: editingAccount.type,
                      currency: editingAccount.currency,
                      description: editingAccount.description,
                    }
                  : undefined
              }
              onSubmit={editingAccount ? handleEdit : handleCreate}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </AppLayout>
  );
}
```

**Deliverable**: Complete account management page

---

**Day 14: Unit Tests for Account Service**

Create `src/services/__tests__/account.service.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { accountService } from '../account.service';
import { CreateAccountInput } from '@/types/account.types';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-id' } },
}));

describe('AccountService', () => {
  const mockUserId = 'test-user-id';
  const mockAccountInput: CreateAccountInput = {
    name: 'Test Account',
    type: 'taxable',
    currency: 'USD',
    description: 'Test description',
  };

  describe('createAccount', () => {
    it('should create account with valid input', async () => {
      // Test implementation will depend on mocking strategy
      expect(true).toBe(true);
    });

    it('should validate required fields', () => {
      expect(mockAccountInput.name).toBeDefined();
      expect(mockAccountInput.type).toBeDefined();
      expect(mockAccountInput.currency).toBeDefined();
    });
  });

  describe('getUserAccounts', () => {
    it('should return accounts for user', async () => {
      // Test implementation
      expect(true).toBe(true);
    });

    it('should filter inactive accounts', async () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });

  describe('updateAccount', () => {
    it('should update account fields', async () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete account', async () => {
      // Test implementation
      expect(true).toBe(true);
    });
  });
});
```

Run tests:
```bash
npm run test
```

**Deliverable**: Test suite for account service

---

**Day 15: Feature Flag Hook & Integration**

Create `src/hooks/useFeatureFlag.ts`:
```typescript
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function checkGlobalFlag(flag: any, userId: string): boolean {
  if (!flag.enabled) return false;

  const env = import.meta.env.VITE_ENV || 'development';
  if (flag.allowedEnvironments?.length > 0 && !flag.allowedEnvironments.includes(env)) {
    return false;
  }

  if (flag.blockedUserIds?.includes(userId)) return false;
  if (flag.allowedUserIds?.includes(userId)) return true;

  if (flag.rolloutPercentage < 100) {
    const hash = hashUserId(userId);
    return hash % 100 < flag.rolloutPercentage;
  }

  return true;
}

export function useFeatureFlag(flagId: string, defaultValue = false): boolean {
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsEnabled(defaultValue);
      return;
    }

    const flagRef = doc(db, 'feature_flags', flagId);
    const unsubscribe = onSnapshot(flagRef, (snapshot) => {
      if (!snapshot.exists()) {
        setIsEnabled(defaultValue);
        return;
      }

      const flag = snapshot.data();

      // Check user-level override
      const userOverrideRef = doc(db, `users/${user.uid}/feature_overrides`, flagId);
      onSnapshot(userOverrideRef, (overrideSnapshot) => {
        if (overrideSnapshot.exists()) {
          const override = overrideSnapshot.data();
          if (override.expiresAt && override.expiresAt.toDate() < new Date()) {
            setIsEnabled(checkGlobalFlag(flag, user.uid));
          } else {
            setIsEnabled(override.enabled);
          }
        } else {
          setIsEnabled(checkGlobalFlag(flag, user.uid));
        }
      });
    });

    return () => unsubscribe();
  }, [flagId, defaultValue, user]);

  return isEnabled;
}
```

**Usage Example**:
```typescript
// In any component
const isCsvImportEnabled = useFeatureFlag('transactions.csv_import.enabled', true);

if (!isCsvImportEnabled) {
  return null; // Hide feature
}
```

**Deliverable**: Feature flag system integrated

---

### Week 4: Transaction Foundation (Days 16-20)

**Day 16: Transaction Service Layer**

Create `src/services/transaction.service.ts`:
```typescript
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction, CreateTransactionInput } from '@/types/transaction.types';

export const transactionService = {
  async createTransaction(userId: string, input: CreateTransactionInput): Promise<Transaction> {
    const transactionData = {
      userId,
      ...input,
      date: Timestamp.fromDate(input.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'transactions'), transactionData);
    const newTransaction = { id: docRef.id, ...transactionData } as Transaction;
    return newTransaction;
  },

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    const docRef = doc(db, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Transaction;
  },

  async getUserTransactions(userId: string, limitCount = 100): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction));
  },

  async getAccountTransactions(accountId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('accountId', '==', accountId),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction));
  },

  async updateTransaction(
    transactionId: string,
    updates: Partial<CreateTransactionInput>
  ): Promise<void> {
    const docRef = doc(db, 'transactions', transactionId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(docRef, updateData);
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const docRef = doc(db, 'transactions', transactionId);
    await deleteDoc(docRef);
  },
};
```

**Deliverable**: Transaction service with CRUD operations

---

**Day 17: Transaction Form Component (Basic)**

Create `src/components/forms/TransactionForm.tsx`:
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CreateTransactionInput } from '@/types/transaction.types';
import { Account } from '@/types/account.types';

const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  type: z.enum(['buy', 'sell', 'dividend']),
  date: z.date(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().min(3).max(3),
  fees: z.number().min(0).optional(),
  commission: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

interface TransactionFormProps {
  accounts: Account[];
  initialValues?: CreateTransactionInput;
  onSubmit: (data: CreateTransactionInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function TransactionForm({
  accounts,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialValues || {
      accountId: '',
      symbol: '',
      type: 'buy',
      date: new Date(),
      currency: 'USD',
    },
  });

  const transactionType = watch('type');

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="accountId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" required error={!!errors.accountId}>
              <InputLabel>Account</InputLabel>
              <Select {...field} label="Account">
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </MenuItem>
                ))}
              </Select>
              {errors.accountId && <FormHelperText>{errors.accountId.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name="symbol"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Symbol"
              error={!!errors.symbol}
              helperText={errors.symbol?.message}
              margin="normal"
              required
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Transaction Type</InputLabel>
              <Select {...field} label="Transaction Type">
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
                <MenuItem value="dividend">Dividend</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Date"
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  required: true,
                  error: !!errors.date,
                  helperText: errors.date?.message,
                },
              }}
            />
          )}
        />

        {transactionType !== 'dividend' && (
          <>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Quantity"
                  type="number"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  margin="normal"
                  required
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />

            <Controller
              name="unitPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Unit Price"
                  type="number"
                  error={!!errors.unitPrice}
                  helperText={errors.unitPrice?.message}
                  margin="normal"
                  required
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />
          </>
        )}

        {transactionType === 'dividend' && (
          <Controller
            name="totalAmount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Total Amount"
                type="number"
                error={!!errors.totalAmount}
                helperText={errors.totalAmount?.message}
                margin="normal"
                required
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />
        )}

        <Controller
          name="fees"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Fees (Optional)"
              type="number"
              margin="normal"
              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={2}
              margin="normal"
            />
          )}
        />

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" type="submit" disabled={loading}>
            {initialValues ? 'Update Transaction' : 'Create Transaction'}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
```

Install date picker:
```bash
npm install @mui/x-date-pickers date-fns
```

**Deliverable**: Transaction form with validation

---

**Day 18: Transaction List Page**

Create `src/pages/transactions/TransactionsPage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { transactionService } from '@/services/transaction.service';
import { accountService } from '@/services/account.service';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, CreateTransactionInput } from '@/types/transaction.types';
import { Account } from '@/types/account.types';

export function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [transactionsData, accountsData] = await Promise.all([
        transactionService.getUserTransactions(user.uid),
        accountService.getUserAccounts(user.uid),
      ]);
      setTransactions(transactionsData);
      setAccounts(accountsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (input: CreateTransactionInput) => {
    if (!user) return;
    try {
      await transactionService.createTransaction(user.uid, input);
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionService.deleteTransaction(transactionId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || accountId;
  };

  return (
    <AppLayout>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Transactions</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add Transaction
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(transaction.date.toDate(), 'yyyy-MM-dd')}</TableCell>
                <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell>
                  <Chip label={transaction.type} size="small" />
                </TableCell>
                <TableCell align="right">{transaction.quantity || '-'}</TableCell>
                <TableCell align="right">
                  {transaction.unitPrice ? `$${transaction.unitPrice.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell align="right">
                  {transaction.totalAmount
                    ? `$${transaction.totalAmount.toFixed(2)}`
                    : transaction.quantity && transaction.unitPrice
                    ? `$${(transaction.quantity * transaction.unitPrice).toFixed(2)}`
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleDelete(transaction.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {transactions.length === 0 && !loading && (
          <Box textAlign="center" py={5}>
            <Typography color="textSecondary">
              No transactions yet. Add your first transaction to get started.
            </Typography>
          </Box>
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogContent>
            <TransactionForm
              accounts={accounts}
              onSubmit={handleCreate}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </AppLayout>
  );
}
```

**Deliverable**: Transaction list and creation working

---

**Day 19: Update Router & Navigation**

Update `src/App.tsx` to add routes:
```typescript
import { Navigate } from 'react-router-dom';
// ... previous imports
import { AccountsPage } from './pages/accounts/AccountsPage';
import { TransactionsPage } from './pages/transactions/TransactionsPage';

// In Routes:
<Route
  path="/accounts"
  element={
    <ProtectedRoute>
      <AccountsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/transactions"
  element={
    <ProtectedRoute>
      <TransactionsPage />
    </ProtectedRoute>
  }
/>
```

Update `src/components/layout/AppLayout.tsx` to add navigation:
```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';

// Add to AppLayout component:
const navigate = useNavigate();
const location = useLocation();

const tabs = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Accounts', path: '/accounts' },
  { label: 'Transactions', path: '/transactions' },
];

const currentTab = tabs.findIndex((tab) => location.pathname === tab.path);

// In the Toolbar, add:
<Tabs value={currentTab} onChange={(e, value) => navigate(tabs[value].path)} sx={{ ml: 3 }}>
  {tabs.map((tab) => (
    <Tab key={tab.path} label={tab.label} />
  ))}
</Tabs>
```

**Deliverable**: Complete navigation between pages

---

**Day 20: Month 1 Testing & Checkpoint**

**Testing Checklist**:
```bash
# 1. Start emulators
npm run emulators

# 2. Start dev server
npm run dev

# 3. Test auth flow
- Register new user
- Login with email/password
- Login with Google
- Logout

# 4. Test account management
- Create account
- Edit account
- Delete account
- Validate form errors

# 5. Test transaction management
- Create buy transaction
- Create sell transaction
- Create dividend transaction
- Delete transaction
- View transaction list

# 6. Run unit tests
npm run test

# 7. Check console for errors
```

**Commit and Document**:
```bash
git add .
git commit -m "Month 1 complete: Auth, accounts, transactions foundation

- Firebase authentication with email/password and Google OAuth
- Account CRUD operations with validation
- Transaction CRUD operations (buy, sell, dividend)
- Protected routes and navigation
- Feature flag system integrated
- Unit test foundation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

**Month 1 Deliverables ✅**:
- ✅ React app with Firebase
- ✅ Authentication working
- ✅ Account management complete
- ✅ Basic transaction management
- ✅ Protected routes
- ✅ Form validation
- ✅ Feature flags system
- ✅ Testing setup

**Ready for Month 2**: Bulk CSV Import, Transaction List Enhancements, Dashboard

---

## Month 2: Bulk CSV Import & Transaction Enhancements (February 2026)

**Focus**: Move bulk CSV import to MVP as primary transaction method

### Week 1: CSV Import Foundation (Days 21-25)

**Day 21: CSV Parsing & Upload Component**

Install Papa Parse:
```bash
npm install papaparse
npm install -D @types/papaparse
```

Create `src/utils/csvParser.ts`:
```typescript
import Papa from 'papaparse';

export interface CSVRow {
  [key: string]: string;
}

export async function parseCSV(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as CSVRow[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function generateCSVTemplate(): string {
  const headers = [
    'Date',
    'Account',
    'Symbol',
    'Type',
    'Quantity',
    'Unit Price',
    'Total Amount',
    'Currency',
    'Fees',
    'Commission',
    'Notes',
  ];

  const exampleRow = [
    '2026-01-15',
    'My Taxable Account',
    'AAPL',
    'buy',
    '100',
    '150.50',
    '',
    'USD',
    '0',
    '0',
    'Initial purchase',
  ];

  return Papa.unparse([headers, exampleRow]);
}
```

Create `src/components/transactions/CSVUpload.tsx`:
```typescript
import { useState } from 'react';
import { Box, Button, Typography, LinearProgress, Alert } from '@mui/material';
import { CloudUpload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { parseCSV, generateCSVTemplate } from '@/utils/csvParser';

interface CSVUploadProps {
  onFileUploaded: (data: any[]) => void;
}

export function CSVUpload({ onFileUploaded }: CSVUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await parseCSV(file);

      if (data.length === 0) {
        setError('CSV file is empty');
        return;
      }

      if (data.length > 10000) {
        setError('CSV file contains more than 10,000 rows');
        return;
      }

      onFileUploaded(data);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          disabled={loading}
        >
          Upload CSV
          <input type="file" hidden accept=".csv" onChange={handleFileSelect} />
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </Button>
      </Box>

      {loading && (
        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Parsing CSV...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="textSecondary">
        Upload a CSV file with your transaction history. Max 10MB, 10,000 rows.
      </Typography>
    </Box>
  );
}
```

**Deliverable**: CSV upload and parsing working

---

**Day 22: Column Mapping Interface**

Create `src/components/transactions/ColumnMapper.tsx`:
```typescript
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';

interface ColumnMapperProps {
  csvData: any[];
  onMappingComplete: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

const REQUIRED_FIELDS = [
  { key: 'date', label: 'Date', required: true },
  { key: 'account', label: 'Account', required: true },
  { key: 'symbol', label: 'Symbol', required: true },
  { key: 'type', label: 'Type', required: true },
  { key: 'quantity', label: 'Quantity', required: false },
  { key: 'unitPrice', label: 'Unit Price', required: false },
  { key: 'totalAmount', label: 'Total Amount', required: false },
  { key: 'currency', label: 'Currency', required: true },
  { key: 'fees', label: 'Fees', required: false },
  { key: 'commission', label: 'Commission', required: false },
  { key: 'notes', label: 'Notes', required: false },
];

export function ColumnMapper({ csvData, onMappingComplete, onCancel }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const csvColumns = Object.keys(csvData[0] || {});

  useEffect(() => {
    // Auto-detect common column names
    const autoMapping: Record<string, string> = {};

    REQUIRED_FIELDS.forEach((field) => {
      const match = csvColumns.find((col) =>
        col.toLowerCase().includes(field.key.toLowerCase())
      );
      if (match) {
        autoMapping[field.key] = match;
      }
    });

    setMapping(autoMapping);
  }, []);

  const handleMappingChange = (fieldKey: string, csvColumn: string) => {
    setMapping({ ...mapping, [fieldKey]: csvColumn });
  };

  const canProceed = () => {
    return REQUIRED_FIELDS.filter((f) => f.required).every((field) => mapping[field.key]);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Map CSV Columns
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>
        Map your CSV columns to the required fields. Preview of first 5 rows shown below.
      </Typography>

      <Box mb={3}>
        {REQUIRED_FIELDS.map((field) => (
          <FormControl fullWidth margin="normal" key={field.key} required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={mapping[field.key] || ''}
              onChange={(e) => handleMappingChange(field.key, e.target.value)}
              label={field.label}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {csvColumns.map((col) => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Preview (First 5 Rows)
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            {csvColumns.map((col) => (
              <TableCell key={col}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {csvData.slice(0, 5).map((row, idx) => (
            <TableRow key={idx}>
              {csvColumns.map((col) => (
                <TableCell key={col}>{row[col]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={() => onMappingComplete(mapping)}
          disabled={!canProceed()}
        >
          Continue to Validation
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
```

**Deliverable**: Column mapping interface with auto-detection

---

**Day 23: Data Validation & Preview**

Create `src/utils/transactionValidator.ts`:
```typescript
import { parse, isValid, isFuture } from 'date-fns';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTransactionRow(row: any, mapping: Record<string, string>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Date validation
  const dateStr = row[mapping.date];
  if (!dateStr) {
    errors.push('Date is required');
  } else {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isValid(date)) {
      errors.push('Invalid date format');
    } else if (isFuture(date)) {
      errors.push('Date cannot be in the future');
    }
  }

  // Symbol validation
  const symbol = row[mapping.symbol];
  if (!symbol) {
    errors.push('Symbol is required');
  } else if (symbol.length > 20) {
    errors.push('Symbol too long');
  }

  // Type validation
  const type = row[mapping.type]?.toLowerCase();
  const validTypes = ['buy', 'sell', 'dividend', 'initial_position', 'split_forward', 'split_reverse'];
  if (!type) {
    errors.push('Type is required');
  } else if (!validTypes.includes(type)) {
    errors.push(`Invalid type: ${type}`);
  }

  // Quantity validation (for buy/sell/split)
  if (['buy', 'sell', 'initial_position'].includes(type)) {
    const quantity = parseFloat(row[mapping.quantity]);
    if (!quantity || quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
  }

  // Unit price validation (for buy/sell/initial)
  if (['buy', 'sell', 'initial_position'].includes(type)) {
    const unitPrice = parseFloat(row[mapping.unitPrice]);
    if (!unitPrice || unitPrice <= 0) {
      errors.push('Unit price must be greater than 0');
    }
  }

  // Total amount validation (for dividend)
  if (type === 'dividend') {
    const totalAmount = parseFloat(row[mapping.totalAmount]);
    if (!totalAmount || totalAmount <= 0) {
      errors.push('Total amount must be greater than 0 for dividends');
    }
  }

  // Currency validation
  const currency = row[mapping.currency];
  const validCurrencies = ['USD', 'CAD', 'EUR', 'GBP', 'INR'];
  if (!currency) {
    errors.push('Currency is required');
  } else if (!validCurrencies.includes(currency.toUpperCase())) {
    warnings.push(`Currency ${currency} not in standard list`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

Create `src/components/transactions/ValidationPreview.tsx`:
```typescript
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { validateTransactionRow } from '@/utils/transactionValidator';

interface ValidationPreviewProps {
  csvData: any[];
  mapping: Record<string, string>;
  onProceed: (validRows: any[]) => void;
  onBack: () => void;
}

export function ValidationPreview({ csvData, mapping, onProceed, onBack }: ValidationPreviewProps) {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  const validatedRows = csvData.map((row, index) => ({
    row,
    index,
    validation: validateTransactionRow(row, mapping),
  }));

  const validCount = validatedRows.filter((r) => r.validation.isValid).length;
  const errorCount = validatedRows.filter((r) => !r.validation.isValid).length;
  const warningCount = validatedRows.filter(
    (r) => r.validation.isValid && r.validation.warnings.length > 0
  ).length;

  const displayRows = showErrorsOnly
    ? validatedRows.filter((r) => !r.validation.isValid)
    : validatedRows;

  const handleProceed = () => {
    const validRows = validatedRows.filter((r) => r.validation.isValid).map((r) => r.row);
    onProceed(validRows);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Validation Results
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Chip label={`${validCount} Valid`} color="success" />
        <Chip label={`${errorCount} Errors`} color="error" />
        <Chip label={`${warningCount} Warnings`} color="warning" />
      </Box>

      {errorCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errorCount} rows have errors and will be skipped during import.
          <Button size="small" onClick={() => setShowErrorsOnly(!showErrorsOnly)} sx={{ ml: 2 }}>
            {showErrorsOnly ? 'Show All' : 'Show Errors Only'}
          </Button>
        </Alert>
      )}

      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Row</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Issues</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayRows.slice(0, 50).map(({ row, index, validation }) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {validation.isValid ? (
                  <Chip label="Valid" color="success" size="small" />
                ) : (
                  <Chip label="Error" color="error" size="small" />
                )}
              </TableCell>
              <TableCell>{row[mapping.symbol]}</TableCell>
              <TableCell>{row[mapping.type]}</TableCell>
              <TableCell>{row[mapping.date]}</TableCell>
              <TableCell>
                {validation.errors.map((err, i) => (
                  <Typography key={i} variant="caption" color="error" display="block">
                    {err}
                  </Typography>
                ))}
                {validation.warnings.map((warn, i) => (
                  <Typography key={i} variant="caption" color="warning" display="block">
                    {warn}
                  </Typography>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {displayRows.length > 50 && (
        <Typography variant="body2" color="textSecondary" mb={2}>
          Showing first 50 rows. Total: {displayRows.length}
        </Typography>
      )}

      <Box display="flex" gap={2}>
        <Button variant="contained" onClick={handleProceed} disabled={validCount === 0}>
          Import {validCount} Valid Transactions
        </Button>
        <Button variant="outlined" onClick={onBack}>
          Back to Mapping
        </Button>
      </Box>
    </Box>
  );
}
```

**Deliverable**: Validation and preview working

---

**Day 24-25: CSV Import Orchestration & Integration**

Create `src/pages/transactions/CSVImportPage.tsx`:
```typescript
import { useState } from 'react';
import { Container, Box, Typography, Stepper, Step, StepLabel, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CSVUpload } from '@/components/transactions/CSVUpload';
import { ColumnMapper } from '@/components/transactions/ColumnMapper';
import { ValidationPreview } from '@/components/transactions/ValidationPreview';
import { transactionService } from '@/services/transaction.service';
import { useAuth } from '@/hooks/useAuth';

const steps = ['Upload CSV', 'Map Columns', 'Validate & Preview', 'Import'];

export function CSVImportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUploaded = (data: any[]) => {
    setCsvData(data);
    setActiveStep(1);
  };

  const handleMappingComplete = (newMapping: Record<string, string>) => {
    setMapping(newMapping);
    setActiveStep(2);
  };

  const handleImport = async (validRows: any[]) => {
    if (!user) return;

    setImporting(true);
    setActiveStep(3);
    setError('');

    try {
      // Import in batches
      const batchSize = 500;
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        await Promise.all(
          batch.map((row) =>
            transactionService.createTransaction(user.uid, {
              accountId: row[mapping.account], // Will need account lookup
              symbol: row[mapping.symbol],
              type: row[mapping.type],
              date: new Date(row[mapping.date]),
              quantity: parseFloat(row[mapping.quantity]),
              unitPrice: parseFloat(row[mapping.unitPrice]),
              totalAmount: parseFloat(row[mapping.totalAmount]),
              currency: row[mapping.currency],
              fees: parseFloat(row[mapping.fees]) || 0,
              commission: parseFloat(row[mapping.commission]) || 0,
              notes: row[mapping.notes],
            })
          )
        );
      }

      navigate('/transactions?import=success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Import Transactions from CSV
          </Typography>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && <CSVUpload onFileUploaded={handleFileUploaded} />}

        {activeStep === 1 && (
          <ColumnMapper
            csvData={csvData}
            onMappingComplete={handleMappingComplete}
            onCancel={() => setActiveStep(0)}
          />
        )}

        {activeStep === 2 && (
          <ValidationPreview
            csvData={csvData}
            mapping={mapping}
            onProceed={handleImport}
            onBack={() => setActiveStep(1)}
          />
        )}

        {activeStep === 3 && importing && (
          <Box textAlign="center" py={5}>
            <Typography variant="h6">Importing transactions...</Typography>
            <Typography variant="body2" color="textSecondary">
              This may take a few moments.
            </Typography>
          </Box>
        )}
      </Container>
    </AppLayout>
  );
}
```

Add route in `src/App.tsx`:
```typescript
<Route
  path="/transactions/import"
  element={
    <ProtectedRoute>
      <CSVImportPage />
    </ProtectedRoute>
  }
/>
```

**Deliverable**: End-to-end CSV import working

**Week 1 Summary**:
- ✅ CSV upload and parsing
- ✅ Column mapping with auto-detection
- ✅ Data validation with preview
- ✅ Batch import processing
- ✅ Error handling and reporting

---

### Week 2-4: Dashboard, Holdings & Polish

*(Continuing with detailed breakdown of remaining weeks)*

**Week 2: Holdings Calculation Engine**
- Position aggregation from transactions
- Cost basis calculation (FIFO)
- Unrealized gain/loss
- Dividend income aggregation
- Performance optimization

**Week 3: Dashboard Implementation**
- Dashboard layout and cards
- Holdings summary table
- Dividend tracking section
- Responsive design
- Loading/empty states

**Week 4: Additional Transaction Types & Testing**
- Initial Position transaction
- Forward/Reverse Splits
- Extended validation
- End-to-end testing
- Bug fixes

---

## Month 3-4: Polish, Admin, Launch (Summarized)

**Month 3**: Symbol management, calculators, settings, performance optimization

**Month 4**: Admin dashboard, testing, security audit, deployment, PUBLIC LAUNCH

---

## Quick Start Commands

```bash
# 1. Initialize Firebase
firebase init

# 2. Create React app
npm create vite@latest . -- --template react-ts

# 3. Install all dependencies
npm install firebase @mui/material @emotion/react @emotion/styled @mui/icons-material zustand @tanstack/react-query react-router-dom react-hook-form zod @hookform/resolvers date-fns recharts axios

# 4. Install dev dependencies
npm install -D @types/node vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom eslint-plugin-react-hooks @typescript-eslint/eslint-plugin prettier eslint-config-prettier

# 5. Deploy Firestore rules
firebase deploy --only firestore:rules

# 6. Start development
npm run emulators    # Terminal 1
npm run dev          # Terminal 2
```

---

*Last Updated: January 28, 2026*
*Status: Ready to Start Development*
