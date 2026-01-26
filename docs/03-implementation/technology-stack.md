# Technology Stack

## Overview

This document details all technologies, libraries, tools, and services used in WealthTracker, with justifications and alternatives considered.

---

## Frontend Stack

### Core Framework

**React 18.2+**
- **Purpose**: UI library for building interactive interfaces
- **Why**: Large ecosystem, excellent performance, strong community
- **Alternatives**: Vue.js (simpler), Svelte (faster), Angular (enterprise)
- **License**: MIT

**TypeScript 5.0+**
- **Purpose**: Type-safe JavaScript with excellent IDE support
- **Why**: Catch errors at compile time, better refactoring, self-documenting
- **Alternatives**: JavaScript (no types), Flow (less popular)
- **License**: Apache 2.0

---

### Build Tools

**Vite 5.0+**
- **Purpose**: Fast build tool and dev server
- **Why**: Lightning-fast HMR, optimized production builds, modern defaults
- **Alternatives**: Create React App (slower), Webpack (complex), Parcel
- **License**: MIT
- **Configuration**:
  ```typescript
  // vite.config.ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: true,
    },
  });
  ```

---

### UI Component Library

**Option 1: Material-UI (MUI) v5** (Recommended)
- **Purpose**: Comprehensive React component library
- **Why**: Follows Material Design, accessible, customizable, large community
- **Pros**: Professional look, many components, excellent docs
- **Cons**: Bundle size larger, opinionated design
- **License**: MIT
- **Installation**: `npm install @mui/material @emotion/react @emotion/styled`

**Option 2: Chakra UI v2**
- **Purpose**: Accessible React component library
- **Why**: Lightweight, great DX, accessibility-first
- **Pros**: Smaller bundle, composable, modern design
- **Cons**: Fewer pre-built components, newer ecosystem
- **License**: MIT
- **Installation**: `npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion`

**Recommendation**: Use MUI for MVP (faster development), consider Chakra UI if bundle size becomes an issue.

---

### State Management

**Zustand 4.0+**
- **Purpose**: Lightweight state management
- **Why**: Simple API, minimal boilerplate, excellent performance
- **Use Cases**: Global UI state (theme, sidebar open/close, modal state)
- **Alternatives**: Redux (verbose), Context API (performance issues), Jotai, Valtio
- **License**: MIT
- **Installation**: `npm install zustand`
- **Example**:
  ```typescript
  import create from 'zustand';

  interface AppState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
  }

  export const useAppStore = create<AppState>((set) => ({
    theme: 'light',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  }));
  ```

**TanStack Query (React Query) v5**
- **Purpose**: Server state management and caching
- **Why**: Handles data fetching, caching, synchronization automatically
- **Use Cases**: Firestore data, API calls, background refetching
- **License**: MIT
- **Installation**: `npm install @tanstack/react-query`
- **Example**:
  ```typescript
  import { useQuery } from '@tanstack/react-query';
  import { collection, query, where } from 'firebase/firestore';

  export function useAccounts(userId: string) {
    return useQuery({
      queryKey: ['accounts', userId],
      queryFn: () => fetchAccounts(userId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }
  ```

---

### Routing

**React Router v6**
- **Purpose**: Client-side routing for SPA
- **Why**: De facto standard, declarative API, code splitting support
- **License**: MIT
- **Installation**: `npm install react-router-dom`
- **Example**:
  ```typescript
  import { createBrowserRouter, RouterProvider } from 'react-router-dom';

  const router = createBrowserRouter([
    { path: '/', element: <Dashboard />, loader: dashboardLoader },
    { path: '/transactions', element: <Transactions /> },
    { path: '/accounts', element: <Accounts /> },
    { path: '/settings', element: <Settings /> },
  ]);

  function App() {
    return <RouterProvider router={router} />;
  }
  ```

---

### Forms

**React Hook Form v7**
- **Purpose**: Performant form handling with validation
- **Why**: Minimal re-renders, great DX, built-in validation
- **Alternatives**: Formik (more re-renders), plain React state
- **License**: MIT
- **Installation**: `npm install react-hook-form`
- **Example**:
  ```typescript
  import { useForm } from 'react-hook-form';

  function TransactionForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
      // Save transaction
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('symbol', { required: true })} />
        {errors.symbol && <span>Symbol is required</span>}
        <button type="submit">Save</button>
      </form>
    );
  }
  ```

**Zod v3** (Validation Schema)
- **Purpose**: TypeScript-first schema validation
- **Why**: Type inference, composable, integrates with React Hook Form
- **License**: MIT
- **Installation**: `npm install zod @hookform/resolvers`
- **Example**:
  ```typescript
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';

  const transactionSchema = z.object({
    symbol: z.string().min(1, 'Symbol is required'),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  });

  type TransactionFormData = z.infer<typeof transactionSchema>;

  const { register, handleSubmit } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });
  ```

---

### Data Visualization

**Recharts v2**
- **Purpose**: React charts library
- **Why**: Composable, responsive, good docs
- **Alternatives**: Nivo (more advanced), Chart.js (imperative), Visx (low-level)
- **License**: MIT
- **Installation**: `npm install recharts`
- **Example**:
  ```typescript
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

  function PerformanceChart({ data }) {
    return (
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    );
  }
  ```

---

### Date & Time

**date-fns v3**
- **Purpose**: Modern JavaScript date utility library
- **Why**: Lightweight (tree-shakeable), immutable, TypeScript support
- **Alternatives**: Moment.js (deprecated), Day.js (smaller), Luxon
- **License**: MIT
- **Installation**: `npm install date-fns`
- **Example**:
  ```typescript
  import { format, parseISO, subDays } from 'date-fns';

  const formatted = format(new Date(), 'MM/dd/yyyy');
  const thirtyDaysAgo = subDays(new Date(), 30);
  ```

---

### Utilities

**lodash-es v4** (Tree-shakeable)
- **Purpose**: Utility functions (groupBy, debounce, etc.)
- **Why**: Battle-tested, comprehensive
- **License**: MIT
- **Installation**: `npm install lodash-es`

**clsx v2**
- **Purpose**: Conditional CSS class names
- **Why**: Tiny, fast, simple
- **License**: MIT
- **Installation**: `npm install clsx`

**numeral.js v2**
- **Purpose**: Number formatting
- **Why**: Format currency, percentages easily
- **License**: MIT
- **Installation**: `npm install numeral`

---

### Progressive Web App (PWA)

**Vite PWA Plugin**
- **Purpose**: Generate service worker and PWA manifest
- **Why**: Zero-config PWA setup with Vite
- **License**: MIT
- **Installation**: `npm install -D vite-plugin-pwa`
- **Features**:
  - Auto-generate service worker
  - Workbox integration
  - Offline fallback
  - Asset caching strategies
  - Web app manifest generation
- **Configuration** (`vite.config.ts`):
  ```typescript
  import { VitePWA } from 'vite-plugin-pwa';

  export default defineConfig({
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'WealthTracker',
          short_name: 'WealthTracker',
          description: 'Investment Portfolio Management',
          theme_color: '#1976d2',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firestore-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }
              }
            }
          ]
        }
      })
    ]
  });
  ```

**Workbox v7** (Included with vite-plugin-pwa)
- **Purpose**: Production-ready service worker library
- **Why**: Industry-standard PWA service worker toolkit
- **Features**:
  - Precaching
  - Runtime caching
  - Background sync
  - Offline analytics
  - Workbox strategies (CacheFirst, NetworkFirst, StaleWhileRevalidate)

**react-device-detect v2**
- **Purpose**: Detect mobile/tablet/desktop
- **Why**: Conditional rendering for device-specific features
- **License**: MIT
- **Installation**: `npm install react-device-detect`
- **Example**:
  ```typescript
  import { isMobile, isTablet, isDesktop } from 'react-device-detect';

  function Navigation() {
    return isMobile ? <BottomNav /> : <SideNav />;
  }
  ```

**react-swipeable v7**
- **Purpose**: Touch gesture support
- **Why**: Native-like swipe interactions for mobile
- **License**: MIT
- **Installation**: `npm install react-swipeable`
- **Example**:
  ```typescript
  import { useSwipeable } from 'react-swipeable';

  function Card() {
    const handlers = useSwipeable({
      onSwipedLeft: () => console.log('swiped left'),
      onSwipedRight: () => console.log('swiped right'),
    });

    return <div {...handlers}>Swipeable Card</div>;
  }
  ```

**capacitor v6** (Future - For App Store Deployment)
- **Purpose**: Package PWA as native iOS/Android app
- **Why**: Deploy to app stores without rewriting code
- **License**: MIT
- **Installation**: `npm install @capacitor/core @capacitor/cli`
- **When**: Phase 5 (App Store Deployment)
- **Features**:
  - iOS app wrapper
  - Android app wrapper
  - Native plugin access (camera, biometrics, etc.)
  - App store deployment

---

## Backend Stack (Firebase)

### Firebase Services

**Firebase Authentication**
- **Purpose**: User authentication and identity management
- **Features**: Email/Password, Google OAuth, session management
- **Pricing**: Free (up to 10K authentications/month)

**Cloud Firestore**
- **Purpose**: NoSQL document database
- **Features**: Real-time sync, offline support, scalability
- **Pricing**: Pay-as-you-go (free tier: 50K reads, 20K writes, 1GB storage/day)

**Cloud Functions (2nd Gen)**
- **Purpose**: Serverless backend logic
- **Runtime**: Node.js 20
- **Features**: HTTPS endpoints, scheduled functions, event triggers
- **Pricing**: Pay-as-you-go (free tier: 2M invocations/month)

**Firebase Hosting**
- **Purpose**: Static asset hosting with CDN
- **Features**: SSL, custom domains, SPA routing
- **Pricing**: Free (10GB storage, 10GB bandwidth/month)

**Firebase Storage**
- **Purpose**: File uploads and downloads
- **Features**: Secure uploads, access control
- **Pricing**: Free tier (5GB storage, 1GB download/day)

**Firebase Performance Monitoring**
- **Purpose**: App performance tracking
- **Features**: Page load times, network latency
- **Pricing**: Free

**Firebase Extensions** (Optional)
- **Trigger Email (SendGrid)**: Automated emails
- **Delete User Data**: GDPR compliance

---

### Cloud Functions Libraries

**firebase-admin v12**
- **Purpose**: Firebase Admin SDK for server-side
- **License**: Apache 2.0

**firebase-functions v5**
- **Purpose**: Cloud Functions framework
- **License**: MIT

**express v4** (for HTTPS functions)
- **Purpose**: Web framework for API endpoints
- **License**: MIT

**cors**
- **Purpose**: CORS middleware for API endpoints
- **License**: MIT

---

## Third-Party APIs

### EODHD (Stock Data)

**EODHD API**
- **Purpose**: Real-time and historical stock data
- **Website**: https://eodhd.com/
- **Plan**: Startup ($20/month) - 100K API calls/month
- **Upgrade Path**: All World ($80/month) - 1M API calls/month
- **Features**:
  - Real-time prices (15-min delay on free exchanges)
  - Historical EOD data (20+ years)
  - Symbol search
  - Exchange listings
  - Splits and dividends data
- **Alternatives**:
  - Alpha Vantage (free tier limited)
  - IEX Cloud (more expensive)
  - Finnhub (good free tier, limited historical)
  - Yahoo Finance (unofficial, no SLA)

**Integration**:
```typescript
import axios from 'axios';

const EODHD_API_KEY = process.env.EODHD_API_KEY;
const BASE_URL = 'https://eodhd.com/api';

export async function getRealtimePrice(symbol: string, exchange: string) {
  const response = await axios.get(
    `${BASE_URL}/real-time/${symbol}.${exchange}`,
    { params: { api_token: EODHD_API_KEY, fmt: 'json' } }
  );
  return response.data;
}
```

---

### Stripe (Payments)

**Stripe API v14**
- **Purpose**: Subscription billing and payments
- **Website**: https://stripe.com/
- **Pricing**: 2.9% + $0.30 per transaction
- **Features**:
  - Subscriptions
  - Customer portal
  - Invoices
  - Webhooks
- **Alternatives**:
  - Paddle (merchant of record)
  - Chargebee (subscription management)
  - PayPal (less developer-friendly)

**Integration**:
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

export async function createSubscription(customerId: string, priceId: string) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}
```

---

### SendGrid (Email)

**SendGrid API**
- **Purpose**: Transactional emails
- **Website**: https://sendgrid.com/
- **Plan**: Free (100 emails/day), Essentials ($15/month for 40K emails)
- **Features**:
  - Dynamic templates
  - Delivery tracking
  - Unsubscribe management
- **Alternatives**:
  - AWS SES (cheaper, more setup)
  - Mailgun (similar)
  - Resend (newer, great DX)
  - Firebase Extensions (uses SendGrid behind the scenes)

**Integration**: Use Firebase Extension "Trigger Email from Firestore"
- Simpler setup
- No code needed for basic emails
- Triggered by Firestore writes

---

## Development Tools

### Code Quality

**ESLint v8**
- **Purpose**: JavaScript/TypeScript linting
- **Config**: `eslint-config-airbnb` or `eslint-config-standard`
- **Plugins**: `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`
- **License**: MIT

**Prettier v3**
- **Purpose**: Code formatting
- **Why**: Consistent code style, no debates
- **License**: MIT
- **Config**:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100
  }
  ```

**Husky v9** (Git Hooks)
- **Purpose**: Run scripts on git hooks (pre-commit, pre-push)
- **License**: MIT
- **Usage**: Run ESLint and Prettier before commit

**lint-staged**
- **Purpose**: Run linters on staged files only
- **License**: MIT
- **Config**:
  ```json
  {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
  ```

---

### Testing

**Vitest v1** (Unit Tests)
- **Purpose**: Fast unit test runner (Vite-native)
- **Why**: 10x faster than Jest, same API
- **License**: MIT
- **Installation**: `npm install -D vitest @vitest/ui`

**React Testing Library v14**
- **Purpose**: Test React components
- **Why**: Test behavior, not implementation
- **License**: MIT
- **Installation**: `npm install -D @testing-library/react @testing-library/jest-dom`

**Firebase Emulators**
- **Purpose**: Local Firebase services for testing
- **Services**: Auth, Firestore, Functions, Storage
- **Why**: Test without production costs/side effects

**Cypress v13** or **Playwright v1** (E2E Tests)
- **Purpose**: End-to-end testing
- **Why**: Test critical user flows
- **Cypress**: Easier, better DX
- **Playwright**: Faster, multi-browser
- **License**: MIT

---

### Monitoring & Error Tracking

**Sentry v7**
- **Purpose**: Error tracking and performance monitoring
- **Website**: https://sentry.io/
- **Plan**: Free (5K events/month), Team ($26/month)
- **Features**:
  - Error tracking with stack traces
  - Performance monitoring
  - User feedback
  - Sourcemap support
- **License**: Business Source License (BSL)
- **Installation**: `npm install @sentry/react`
- **Setup**:
  ```typescript
  import * as Sentry from '@sentry/react';

  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.VITE_ENV,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  ```

---

### Analytics

**Google Analytics 4**
- **Purpose**: User analytics and behavior tracking
- **Plan**: Free
- **Features**: Pageviews, events, funnels, cohorts
- **Installation**: `npm install react-ga4`

**Mixpanel**
- **Purpose**: Product analytics
- **Plan**: Free (up to 100K tracked users/month)
- **Features**: Event tracking, funnels, retention, A/B testing
- **Why**: More developer-friendly than GA4, better for SaaS
- **Installation**: `npm install mixpanel-browser`

**Recommendation**: Use both - GA4 for general analytics, Mixpanel for product metrics

---

### CI/CD

**GitHub Actions**
- **Purpose**: Automated testing and deployment
- **Plan**: Free for public repos, 2000 minutes/month for private
- **Why**: Native to GitHub, easy to set up
- **Alternatives**: GitLab CI, CircleCI, Travis CI

**Workflow Example**:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: wealthtracker-prod
```

---

## Package Manager

**npm v10** (Bundled with Node.js)
- **Why**: Default, most compatible
- **Alternatives**: pnpm (faster, more efficient), yarn (similar to npm)

**Node.js v20 LTS**
- **Why**: Long-term support, stable
- **Required**: For Cloud Functions and local development

---

## Development Environment

**VS Code** (Recommended)
- **Extensions**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Vite
  - Firebase
  - Tailwind CSS IntelliSense (if using Tailwind)
  - Error Lens
  - GitLens

**Chrome DevTools**
- **Extensions**:
  - React Developer Tools
  - Redux DevTools (if using Redux)
  - Firebase Extensions

---

## Deployment

**Firebase Hosting**
- **Purpose**: Production hosting
- **Features**: CDN, SSL, custom domains, rollback
- **Pricing**: Free tier sufficient for MVP

**Alternative Hosting** (if needed):
- **Vercel**: Excellent for React, generous free tier
- **Netlify**: Similar to Vercel, good DX
- **AWS Amplify**: More control, steeper learning curve

---

## Documentation

**Markdown**
- **Purpose**: Documentation files
- **Tools**: VS Code, GitHub

**Docusaurus v3** (Future)
- **Purpose**: Documentation website
- **Why**: If docs grow large, create dedicated docs site
- **License**: MIT

---

## Tech Stack Summary Table

| Category | Technology | Version | License | Cost |
|----------|-----------|---------|---------|------|
| **Frontend** |
| Framework | React | 18.2+ | MIT | Free |
| Language | TypeScript | 5.0+ | Apache 2.0 | Free |
| Build Tool | Vite | 5.0+ | MIT | Free |
| UI Library | Material-UI | 5.0+ | MIT | Free |
| State (Global) | Zustand | 4.0+ | MIT | Free |
| State (Server) | TanStack Query | 5.0+ | MIT | Free |
| Routing | React Router | 6.0+ | MIT | Free |
| Forms | React Hook Form | 7.0+ | MIT | Free |
| Validation | Zod | 3.0+ | MIT | Free |
| Charts | Recharts | 2.0+ | MIT | Free |
| Dates | date-fns | 3.0+ | MIT | Free |
| **Backend** |
| Auth | Firebase Auth | - | Proprietary | Free tier |
| Database | Firestore | - | Proprietary | Pay-as-you-go |
| Functions | Cloud Functions | - | Proprietary | Pay-as-you-go |
| Hosting | Firebase Hosting | - | Proprietary | Free |
| Storage | Firebase Storage | - | Proprietary | Free tier |
| **APIs** |
| Stock Data | EODHD | - | Proprietary | $20/mo |
| Payments | Stripe | - | Proprietary | 2.9% + $0.30 |
| Email | SendGrid | - | Proprietary | Free-$15/mo |
| **DevOps** |
| Linting | ESLint | 8.0+ | MIT | Free |
| Formatting | Prettier | 3.0+ | MIT | Free |
| Testing | Vitest | 1.0+ | MIT | Free |
| E2E Testing | Cypress | 13.0+ | MIT | Free |
| Error Tracking | Sentry | 7.0+ | BSL | Free tier |
| Analytics | GA4 + Mixpanel | - | Proprietary | Free tier |
| CI/CD | GitHub Actions | - | Proprietary | Free tier |

---

## Total Cost Estimate

### Development (MVP Phase)
- Domain: $12/year
- EODHD API: $20/month
- Firebase: $0 (free tier)
- All other services: $0 (free tiers)
- **Total**: ~$20/month

### Post-Launch (100 users)
- Firebase: ~$25/month
- EODHD: $20/month
- SendGrid: $15/month
- Sentry: $0 (free tier)
- Stripe fees: ~2.9% of revenue
- **Total**: ~$60/month + Stripe fees

### Scale (1,000 users)
- Firebase: ~$100/month
- EODHD: $80/month (upgraded plan)
- SendGrid: $15/month
- Sentry: $26/month
- Stripe fees: ~2.9% of revenue
- **Total**: ~$220/month + Stripe fees

---

## Recommended Development Setup

1. **Install Node.js v20 LTS**
2. **Install VS Code** with recommended extensions
3. **Install Firebase CLI**: `npm install -g firebase-tools`
4. **Clone repository** and install dependencies: `npm install`
5. **Start Firebase Emulators**: `npm run emulators`
6. **Start dev server**: `npm run dev`
7. **Open browser**: http://localhost:5173

---

## Next Steps

1. Initialize project with Vite: `npm create vite@latest wealthtracker -- --template react-ts`
2. Install dependencies listed above
3. Configure ESLint, Prettier, and Husky
4. Set up Firebase project
5. Configure environment variables
6. Start building!

**See**: [project-structure.md](project-structure.md) for code organization
