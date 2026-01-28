# WealthTracker Setup Checklist

## ✅ Configuration Status

### Completed ✓
- [x] Firebase project created (wealthtrackerv2)
- [x] Firebase Web App configuration filled in
- [x] EODHD API key obtained (68a8cf733f0cf4.11179488)
- [x] Service account key downloaded
- [x] Firestore security rules file created ([firestore.rules](firestore.rules))
- [x] Environment files created ([.env.development](.env.development), [.env.production](.env.production))
- [x] Service account key file created ([functions/serviceAccountKey.json](functions/serviceAccountKey.json))

---

## 🔧 Remaining Setup Tasks

### Step 1: Complete Firestore Database Setup (5 minutes)

**Go to Firebase Console**: https://console.firebase.google.com/project/wealthtrackerv2/firestore

1. **Create Firestore Database** (if not already created):
   - Click "Create database"
   - Select **"Start in production mode"** (recommended)
   - Choose location: **northamerica-northeast2** (to match your Functions region)
   - Click "Enable"

2. **Deploy Security Rules**:
   ```bash
   cd /Users/hemal/Library/CloudStorage/OneDrive-Wholesale-Express/Documents/Hemal/wealthtracker
   firebase deploy --only firestore:rules
   ```

3. **Verify Rules Deployed**:
   - Go to Firestore Console → Rules tab
   - You should see the production-ready security rules

**Expected Result**: Firestore database created with secure production rules deployed

---

### Step 2: Enable Firebase Authentication (5 minutes)

**Go to Firebase Console**: https://console.firebase.google.com/project/wealthtrackerv2/authentication

1. **Enable Email/Password Authentication**:
   - Click "Get started" (if first time)
   - Click "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

2. **Enable Google Authentication**:
   - Click "Add new provider"
   - Select "Google"
   - Toggle "Enable" to ON
   - **Public-facing name**: "WealthTracker"
   - **Support email**: (your email)
   - Click "Save"

**Expected Result**: Both Email/Password and Google sign-in methods enabled

---

### Step 3: Initialize Firebase in Your Project (10 minutes)

**If Firebase CLI not installed**:
```bash
npm install -g firebase-tools
firebase login
```

**Initialize Firebase** (if not already done):
```bash
cd /Users/hemal/Library/CloudStorage/OneDrive-Wholesale-Express/Documents/Hemal/wealthtracker
firebase init
```

**Select the following options**:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Emulators

**Configuration**:
- Use existing project: **wealthtrackerv2**
- Firestore rules: **firestore.rules** (already exists)
- Functions language: **TypeScript**
- Functions ESLint: **Yes**
- Install dependencies: **Yes**
- Hosting public directory: **dist** (Vite build output)
- Single-page app: **Yes**
- GitHub deploys: **No** (we'll use Vercel/Netlify)
- Emulators: Select **Auth**, **Firestore**, **Functions**

**Expected Result**: `firebase.json` and `functions/` directory configured

---

### Step 4: Set Cloud Functions Environment Config (2 minutes)

```bash
cd /Users/hemal/Library/CloudStorage/OneDrive-Wholesale-Express/Documents/Hemal/wealthtracker
firebase functions:config:set eodhd.api_key="68a8cf733f0cf4.11179488"
```

**Verify configuration**:
```bash
firebase functions:config:get
```

**Expected output**:
```json
{
  "eodhd": {
    "api_key": "68a8cf733f0cf4.11179488"
  }
}
```

**Expected Result**: EODHD API key configured for Cloud Functions

---

### Step 5: Create the React App (20 minutes)

**Create Vite + React + TypeScript project**:
```bash
cd /Users/hemal/Library/CloudStorage/OneDrive-Wholesale-Express/Documents/Hemal/wealthtracker
npm create vite@latest . -- --template react-ts
```

**Install core dependencies**:
```bash
# Firebase
npm install firebase

# UI Library
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# State Management
npm install zustand

# Data Fetching
npm install @tanstack/react-query

# Routing
npm install react-router-dom

# Forms
npm install react-hook-form zod @hookform/resolvers

# Date handling
npm install date-fns

# Charts (for dashboard)
npm install recharts

# Utils
npm install axios
```

**Install dev dependencies**:
```bash
npm install -D @types/node
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
npm install -D eslint-plugin-react-hooks @typescript-eslint/eslint-plugin
```

**Expected Result**: React app scaffold created with all dependencies installed

---

### Step 6: Test Local Setup (10 minutes)

**Terminal 1 - Start Firebase Emulators**:
```bash
cd /Users/hemal/Library/CloudStorage/OneDrive-Wholesale-Express/Documents/Hemal/wealthtracker
firebase emulators:start
```

**Expected output**:
```
✔  All emulators ready! It is now safe to connect your app.
┌─────────────┬────────────────┬─────────────────────────────────┐
│ Emulator    │ Host:Port      │ View in Emulator UI             │
├─────────────┼────────────────┼─────────────────────────────────┤
│ Auth        │ localhost:9099 │ http://localhost:4000/auth      │
│ Firestore   │ localhost:8080 │ http://localhost:4000/firestore │
│ Functions   │ localhost:5001 │ http://localhost:4000/functions │
└─────────────┴────────────────┴─────────────────────────────────┘
```

**Terminal 2 - Start Dev Server**:
```bash
cd /Users/hemal/Library/CloudStorage/OneDrive-Wholesale-Express/Documents/Hemal/wealthtracker
npm run dev
```

**Expected output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Test in browser**:
- Open http://localhost:5173/
- Should see Vite + React default page
- Open http://localhost:4000/
- Should see Firebase Emulator UI

**Expected Result**: Both dev server and emulators running successfully

---

### Step 7: Create Firebase Initialization File (5 minutes)

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

**Expected Result**: Firebase properly initialized with emulator support

---

### Step 8: Update Configuration Reference (2 minutes)

Update your [configuration-reference.md](docs/03-implementation/configuration-reference.md):

**Line 139** - Firestore Database Location:
```
Location: northamerica-northeast2
```

**Line 142** - Security Rules Status:
```
- ✅ Rules deployed: YES
- Rules file location: `firestore.rules`
```

**Expected Result**: Configuration document fully up to date

---

## 🎯 You're Ready to Start Development!

### ✅ Final Checklist

Before you begin coding, verify all of these are complete:

- [ ] Firestore database created in northamerica-northeast2
- [ ] Firestore security rules deployed
- [ ] Email/Password authentication enabled
- [ ] Google authentication enabled
- [ ] Firebase CLI initialized in project
- [ ] Cloud Functions config set (EODHD API key)
- [ ] React app created with Vite
- [ ] All npm dependencies installed
- [ ] Firebase emulators running successfully
- [ ] Dev server running at http://localhost:5173/
- [ ] `src/lib/firebase.ts` created
- [ ] Can access Firebase Emulator UI at http://localhost:4000/

---

## 🚀 Next Steps - Begin MVP Development

Once all setup is complete, follow the [MVP Roadmap](docs/01-business-requirements/mvp-roadmap.md):

### Week 1-2: Authentication & Foundation
1. Create project structure (folders: components, pages, hooks, services, types)
2. Set up React Router with basic routes
3. Create authentication pages (Login, Register, Password Reset)
4. Implement authentication logic with Firebase Auth
5. Create protected route wrapper
6. Build basic layout (header, sidebar, main content)
7. Set up Material-UI theme

### Week 3-4: Account Management
1. Create accounts CRUD UI
2. Implement account service layer
3. Add account validation
4. Build account list and detail views
5. Test with Firebase Emulators

### Month 2: Transaction Management
(See [MVP Roadmap](docs/01-business-requirements/mvp-roadmap.md) for details)

---

## 📞 Need Help?

### Firebase Issues
- **Console**: https://console.firebase.google.com/project/wealthtrackerv2
- **Documentation**: https://firebase.google.com/docs
- **Community**: https://stackoverflow.com/questions/tagged/firebase

### EODHD API Issues
- **Dashboard**: https://eodhd.com/cp/dashboard
- **Documentation**: https://eodhd.com/financial-apis/
- **API Key**: 68a8cf733f0cf4.11179488

### Development Issues
- Check [Quick Start Guide](docs/03-implementation/quick-start-guide.md)
- Review [Technology Stack](docs/03-implementation/technology-stack.md)
- Consult [Feature Specifications](docs/01-business-requirements/feature-specifications.md)

---

## 🔐 Security Reminders

- ✅ `.env.development` and `.env.production` are in `.gitignore`
- ✅ `functions/serviceAccountKey.json` is in `.gitignore`
- ✅ `configuration-reference.md` is in `.gitignore`
- ⚠️ **Never commit these files to Git**
- ⚠️ **Never share API keys publicly**

---

**Good luck with your development!** 🎉

You have everything you need to start building WealthTracker. Follow the steps above, and you'll be ready to code in about an hour.

---

*Last Updated: January 28, 2026*
*Status: Ready for Development*
