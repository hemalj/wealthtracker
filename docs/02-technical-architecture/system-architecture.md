# System Architecture

## Overview

WealthTracker is built as a modern, cloud-native single-page application (SPA) using React for the frontend and Firebase as the backend-as-a-service (BaaS) platform.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            React SPA (TypeScript)                      │    │
│  │  ┌──────────────┬──────────────┬──────────────────┐   │    │
│  │  │   UI Layer   │  State Mgmt  │  Business Logic  │   │    │
│  │  │  (Components)│  (Zustand)   │  (Utils/Helpers) │   │    │
│  │  └──────────────┴──────────────┴──────────────────┘   │    │
│  │                                                         │    │
│  │  ┌────────────────────────────────────────────────┐   │    │
│  │  │         Firebase SDK Integration               │   │    │
│  │  │  • Auth  • Firestore  • Functions  • Storage  │   │    │
│  │  └────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Browser: Chrome, Firefox, Safari, Edge                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE PLATFORM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Firebase Hosting │  │ Firebase Auth    │  │  Firestore   │ │
│  │                  │  │                  │  │  Database    │ │
│  │ • Static Assets  │  │ • Email/Password │  │              │ │
│  │ • SPA Routing    │  │ • Google OAuth   │  │ • NoSQL DB   │ │
│  │ • CDN            │  │ • Session Mgmt   │  │ • Real-time  │ │
│  │ • SSL            │  │ • JWT Tokens     │  │ • Security   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Cloud Functions  │  │ Firebase Storage │  │  Extensions  │ │
│  │                  │  │                  │  │              │ │
│  │ • API Endpoints  │  │ • File Uploads   │  │ • Email      │ │
│  │ • Background Jobs│  │ • Exports        │  │ • Scheduled  │ │
│  │ • EODHD Proxy    │  │ • Attachments    │  │   Jobs       │ │
│  │ • Data Processing│  │                  │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   THIRD-PARTY SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   EODHD API      │  │   Stripe API     │  │  SendGrid    │ │
│  │                  │  │                  │  │              │ │
│  │ • Stock Prices   │  │ • Subscriptions  │  │ • Emails     │ │
│  │ • Symbol Data    │  │ • Payments       │  │ • Templates  │ │
│  │ • Historical Data│  │ • Invoices       │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Client Layer (Frontend)

**Technology**: React 18+ with TypeScript, Vite build tool

**Components**:
- **UI Components**: Reusable React components (Material-UI or Chakra UI)
- **Pages/Views**: Dashboard, Transactions, Accounts, Settings, Admin
- **State Management**: Zustand for global state, React Query for server state
- **Routing**: React Router v6 for SPA navigation
- **Forms**: React Hook Form for complex forms
- **Charts**: Recharts or Nivo for data visualization

**Responsibilities**:
- Render user interface
- Handle user interactions
- Manage client-side state
- Validate user inputs
- Call Firebase SDK methods
- Real-time data synchronization
- Optimistic UI updates

**Key Patterns**:
- Component-driven architecture
- Container/Presenter pattern
- Custom hooks for logic reuse
- Error boundaries for fault tolerance
- Lazy loading for performance

---

### 2. Firebase Platform Layer (Backend)

#### 2.1 Firebase Authentication

**Purpose**: User identity and access management

**Features**:
- Email/Password authentication
- Google OAuth 2.0
- JWT token generation and validation
- Session management
- Password reset flows
- Email verification

**Security**:
- Tokens expire after configurable period
- Secure password hashing (bcrypt)
- Rate limiting on login attempts
- HTTPS only

**Integration**:
```typescript
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
```

---

#### 2.2 Cloud Firestore (Database)

**Purpose**: NoSQL document database for all application data

**Data Model**: Collections and Documents
- `users/{userId}` - User profiles
- `accounts/{accountId}` - Investment accounts
- `transactions/{transactionId}` - All transactions
- `symbols/{symbolId}` - Stock ticker master data
- `portfolios/{userId}` - Calculated portfolio snapshots

**Features**:
- Real-time synchronization
- Offline support
- Automatic scaling
- Security rules for access control
- Composite indexes for complex queries
- Transactions for atomic operations

**Access Patterns**:
- User reads own data (userId filter)
- Admin reads all data (role-based)
- Real-time listeners for live updates
- Batch operations for bulk changes

**Performance Optimizations**:
- Denormalized data for read performance
- Composite indexes for common queries
- Pagination for large result sets
- Caching with React Query

---

#### 2.3 Cloud Functions (Serverless)

**Purpose**: Backend logic, API endpoints, and background jobs

**Use Cases**:

**API Endpoints** (HTTPS Callable Functions):
- `getStockPrice(symbol, exchange)` - Fetch price from EODHD
- `searchSymbols(query)` - Search stock symbols
- `calculatePortfolio(userId)` - Compute portfolio metrics
- `generateReport(userId, type)` - Create PDF reports
- `bulkImportTransactions(userId, data)` - Process CSV imports

**Background Jobs** (Scheduled Functions):
- `updatePrices()` - Daily price refresh from EODHD (cron: 0 0 * * *)
- `syncSymbols()` - Weekly symbol database sync (cron: 0 2 * * 0)
- `calculateMetrics()` - Hourly portfolio metric updates (cron: 0 * * * *)
- `sendDigests()` - Weekly user email digests (cron: 0 8 * * 1)

**Event-Triggered Functions**:
- `onUserCreate()` - Initialize user profile and default account
- `onTransactionCreate()` - Update portfolio calculations
- `onTransactionUpdate()` - Recalculate affected holdings
- `onTransactionDelete()` - Adjust portfolio data

**Example Function**:
```typescript
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const getStockPrice = onCall(async (request) => {
  const { symbol, exchange } = request.data;
  // Call EODHD API
  // Return price data
});

export const updatePrices = onSchedule('every day 00:00', async (event) => {
  // Fetch all unique symbols from database
  // Call EODHD for latest prices
  // Update Firestore documents
});
```

---

#### 2.4 Firebase Hosting

**Purpose**: Static asset hosting and CDN

**Features**:
- Global CDN for fast asset delivery
- Automatic SSL/HTTPS
- SPA routing support (rewrite all to index.html)
- Custom domain support
- Automatic gzip compression
- Cache control headers

**Configuration** (`firebase.json`):
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

#### 2.5 Firebase Storage

**Purpose**: File uploads and downloads

**Use Cases**:
- CSV import file uploads
- Bulk export downloads
- User attachments (notes, receipts)
- Generated PDF reports

**Structure**:
```
/users/{userId}/
  ├── imports/
  │   └── transactions-2026-01-26.csv
  ├── exports/
  │   └── portfolio-report-2026-01-26.pdf
  └── attachments/
      └── receipt-abc123.jpg
```

**Security Rules**:
- Users can only access their own files
- File size limits (10MB for imports)
- Allowed file types (CSV, PDF, JPG, PNG)

---

### 3. Third-Party Services Layer

#### 3.1 EODHD API (Stock Data)

**Purpose**: Real-time and historical stock market data

**Endpoints Used**:
- `GET /api/real-time/{symbol}.{exchange}` - Real-time prices
- `GET /api/eod/{symbol}.{exchange}` - End-of-day historical prices
- `GET /api/search/{query}` - Symbol search
- `GET /api/exchange-symbol-list/{exchange}` - List all symbols for exchange

**API Limits**:
- 100,000 API calls/month (Startup plan: $20/mo)
- 20 requests/second
- Historical data: 20+ years

**Caching Strategy**:
- Cache prices in Firestore (TTL: 15 minutes during market hours, 1 day off-hours)
- Cache symbol data locally (refresh weekly)
- Batch requests to minimize API calls

**Fallback**:
- Manual price entry if API unavailable
- Alpha Vantage or IEX Cloud as backup APIs

---

#### 3.2 Stripe (Payments)

**Purpose**: Subscription billing and payment processing

**Features**:
- Subscription management (create, update, cancel)
- Payment method storage
- Invoice generation
- Webhooks for payment events
- Customer portal for self-service

**Subscription Plans**:
- Free: $0 (default)
- Pro: $9/month
- Premium: $19/month (future)

**Integration**:
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create subscription
await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
});
```

**Webhooks**:
- `payment_intent.succeeded` - Update user subscription status
- `customer.subscription.updated` - Sync subscription changes
- `customer.subscription.deleted` - Downgrade to free tier

---

#### 3.3 SendGrid (Email)

**Purpose**: Transactional and marketing emails

**Email Types**:
- Welcome email on registration
- Email verification
- Password reset
- Weekly digest (optional)
- Transaction alerts (optional)
- Subscription invoices
- Support responses

**Templates**:
- Dynamic templates with branding
- Personalization with user data
- Unsubscribe links

**Integration**:
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@wealthtracker.com',
  templateId: 'd-xxx',
  dynamicTemplateData: {
    userName: user.displayName,
  },
});
```

---

## Data Flow Examples

### Example 1: User Creates Transaction

```
1. User fills out transaction form in React app
2. Form validated client-side (React Hook Form)
3. Submit button calls Firebase SDK: addDoc(collection('transactions'), data)
4. Firestore Security Rules validate (user owns account, required fields present)
5. Document written to Firestore
6. Firestore trigger fires: onTransactionCreate Cloud Function
7. Function recalculates portfolio holdings
8. Function updates portfolio document in Firestore
9. Real-time listener in React app receives updated portfolio data
10. UI updates immediately with new holdings
```

**Performance**: < 1 second end-to-end

---

### Example 2: Dashboard Load

```
1. User navigates to dashboard (React Router)
2. Dashboard component mounts
3. useEffect hook sets up Firestore listeners:
   - onSnapshot(query(collection('accounts'), where('userId', '==', uid)))
   - onSnapshot(query(collection('transactions'), where('userId', '==', uid)))
4. Firestore returns cached data instantly (offline support)
5. Firestore syncs with server and streams updates
6. React Query caches server state
7. useMemo hook calculates holdings from transactions (client-side)
8. Components render with data
9. Background: Cloud Function fetches latest prices from EODHD (if stale)
10. Real-time listener receives price updates
11. Holdings table re-renders with current prices
```

**Performance**: < 2 seconds (initial load), instant (subsequent)

---

### Example 3: Bulk CSV Import

```
1. User uploads CSV file (React Dropzone)
2. File uploaded to Firebase Storage (/users/{userId}/imports/)
3. Client calls Cloud Function: bulkImportTransactions(fileUrl)
4. Function downloads file from Storage
5. Function parses CSV (Papa Parse library)
6. Function validates each row (symbol exists, account valid, etc.)
7. Function queries symbol database for disambiguation
8. Function writes transactions in batches (500 per batch)
9. Function triggers portfolio recalculation
10. Function sends completion email via SendGrid
11. Client polls for completion or receives real-time update
12. Client displays success message with stats (imported, failed)
```

**Performance**: 1,000 rows in ~30 seconds

---

## Scalability Considerations

### Horizontal Scaling

**Firebase Auto-Scales**:
- Firestore: Automatically scales reads/writes
- Cloud Functions: Auto-scales based on load
- Hosting: Global CDN handles traffic spikes

**No Server Management**: Fully managed infrastructure

---

### Performance Optimization

**Frontend**:
- Code splitting (React.lazy, dynamic imports)
- Lazy loading images and charts
- Memoization (React.memo, useMemo, useCallback)
- Virtual scrolling for large tables
- Debounced search inputs
- Service worker for offline caching

**Backend**:
- Firestore indexes for fast queries
- Denormalized data (holdings pre-calculated)
- Pagination (limit queries to 25-100 results)
- Caching prices and symbol data
- Background jobs for heavy computation

**Network**:
- gzip compression
- Minified JS/CSS bundles
- CDN for static assets
- HTTP/2 for multiplexing

---

### Cost Optimization

**Firestore**:
- Minimize document reads (use real-time listeners, cache with React Query)
- Denormalize to reduce queries
- Use pagination to limit read operations
- Archive old data to reduce storage costs

**Cloud Functions**:
- Use scheduled functions instead of real-time triggers where possible
- Batch operations to reduce function invocations
- Optimize function memory allocation (128MB default, increase only if needed)
- Cold start optimization (keep functions warm with scheduled pings)

**EODHD API**:
- Cache prices aggressively (15-minute TTL)
- Batch symbol requests
- Only fetch prices for active holdings
- Use end-of-day data for historical analysis (cheaper than real-time)

**Estimated Costs (1,000 Users)**:
- Firebase Blaze plan: ~$100/month
- EODHD API: $50/month
- SendGrid: $15/month
- Stripe: 2.9% of revenue
- **Total**: ~$165/month + payment processing fees

---

## Security Architecture

### Authentication & Authorization

**Firebase Authentication**:
- Secure token-based authentication
- OAuth 2.0 for Google Sign-In
- Email verification required
- Password strength requirements

**Firestore Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /accounts/{accountId} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/accounts/$(accountId)).data.userId == request.auth.uid;
    }

    match /transactions/{transactionId} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/transactions/$(transactionId)).data.userId == request.auth.uid;
    }

    // Admin-only access
    match /symbols/{symbolId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

**Role-Based Access Control (RBAC)**:
- Custom claims in Firebase Auth tokens
- `admin: true` for internal users
- Checked in Security Rules and Cloud Functions

---

### Data Encryption

**In Transit**:
- HTTPS/TLS 1.3 for all connections
- Firebase SDK uses encrypted connections
- API calls over HTTPS only

**At Rest**:
- Firestore encrypts data automatically
- Firebase Storage encrypts files
- No PII stored in plain text

---

### Input Validation

**Client-Side**:
- React Hook Form validation
- Type checking with TypeScript
- Sanitize user inputs

**Server-Side**:
- Firebase Security Rules validate schema
- Cloud Functions validate inputs
- Type guards and runtime validation

---

### Compliance

**GDPR**:
- User data export functionality
- Account deletion (right to be forgotten)
- Privacy policy and terms of service
- Cookie consent

**Data Retention**:
- Active accounts: Indefinite
- Deleted accounts: 30-day grace period, then permanent deletion
- Transaction history: User controls retention

---

## Monitoring & Observability

### Application Monitoring

**Firebase Performance Monitoring**:
- Page load times
- Network request latency
- Custom traces for critical flows

**Sentry**:
- Error tracking and reporting
- Stack traces and context
- User feedback on errors
- Alerts for critical issues

**Google Analytics / Mixpanel**:
- User behavior tracking
- Feature usage analytics
- Funnel analysis
- Retention cohorts

---

### Infrastructure Monitoring

**Firebase Console**:
- Firestore usage (reads, writes, storage)
- Cloud Functions invocations and errors
- Authentication metrics
- Hosting traffic

**Uptime Monitoring**:
- UptimeRobot or Firebase App Check
- Ping health endpoint every 5 minutes
- Alert on downtime (email, SMS)

**Logging**:
- Cloud Functions logs (console.log, console.error)
- Structured logging with severity levels
- Log aggregation and search

---

## Disaster Recovery & Backup

### Data Backup

**Firestore Backup**:
- Daily automated exports to Cloud Storage
- Retention: 30 days
- Point-in-time recovery possible

**Manual Backups**:
- User-triggered full data export (CSV/JSON)
- Stored in Firebase Storage
- Available for download anytime

---

### Recovery Plan

**Scenario 1: Data Loss/Corruption**:
1. Identify affected data range
2. Restore from daily backup
3. Replay transactions if needed
4. Notify affected users

**Scenario 2: Service Outage (Firebase)**:
1. Monitor Firebase status page
2. Display maintenance message to users
3. Enable offline mode (cached data)
4. Communicate via social media/email

**Scenario 3: Security Breach**:
1. Immediately revoke compromised credentials
2. Rotate API keys and secrets
3. Audit access logs
4. Notify affected users (if PII exposed)
5. Implement additional security measures

---

## Development & Deployment Workflow

### Environments

**Local Development**:
- Firebase Emulators (Auth, Firestore, Functions, Storage)
- Hot module reloading (Vite HMR)
- Local .env.development file

**Staging**:
- Firebase project: `wealthtracker-staging`
- Deployed on push to `develop` branch
- Automated tests run before deployment
- URL: `staging.wealthtracker.com`

**Production**:
- Firebase project: `wealthtracker-prod`
- Deployed on push to `main` branch
- Manual approval required
- URL: `app.wealthtracker.com`

---

### CI/CD Pipeline (GitHub Actions)

**On Push to Develop**:
```yaml
name: Deploy Staging
on:
  push:
    branches: [develop]
jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies (npm ci)
      - Run linter (npm run lint)
      - Run tests (npm run test)
      - Build app (npm run build)
      - Deploy to Firebase Staging (firebase deploy --only hosting,functions --project staging)
      - Run smoke tests
      - Notify team (Slack)
```

**On Push to Main**:
```yaml
name: Deploy Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run full test suite
      - Build app (production mode)
      - Wait for manual approval
      - Deploy to Firebase Production
      - Run smoke tests on production
      - Tag release (git tag v1.x.x)
      - Send deployment notification
```

---

### Testing Strategy

**Unit Tests**:
- Jest + React Testing Library
- Test individual components and functions
- Target: 80%+ coverage

**Integration Tests**:
- Test Firebase interactions with emulators
- Test Cloud Functions with emulators
- Test form submissions and data flow

**End-to-End Tests**:
- Cypress or Playwright
- Test critical user journeys (register, add transaction, view dashboard)
- Run on staging before production deployment

**Manual Testing**:
- Smoke tests on production after deployment
- User acceptance testing for major features
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI framework |
| | Vite | Build tool & dev server |
| | Material-UI / Chakra UI | Component library |
| | Zustand | State management |
| | React Query | Server state & caching |
| | React Router | Client-side routing |
| | React Hook Form | Form handling |
| | Recharts | Data visualization |
| **Backend** | Firebase Auth | User authentication |
| | Firestore | NoSQL database |
| | Cloud Functions | Serverless compute |
| | Firebase Hosting | Static hosting & CDN |
| | Firebase Storage | File storage |
| **APIs** | EODHD | Stock market data |
| | Stripe | Payment processing |
| | SendGrid | Email delivery |
| **DevOps** | GitHub Actions | CI/CD pipeline |
| | Firebase CLI | Deployment tool |
| | Jest | Unit testing |
| | Cypress | E2E testing |
| **Monitoring** | Sentry | Error tracking |
| | Firebase Performance | App performance |
| | Google Analytics | User analytics |
| | Mixpanel | Product analytics |

---

## Design Decisions & Trade-offs

### Why Firebase?

**Pros**:
- Rapid development (no backend code needed for MVP)
- Auto-scaling (handles growth automatically)
- Real-time capabilities out of the box
- Strong security model (Security Rules)
- Generous free tier
- Excellent documentation and community

**Cons**:
- Vendor lock-in (Google-specific)
- Query limitations (no joins, limited filtering)
- Costs can scale with usage
- Limited control over infrastructure

**Alternatives Considered**:
- AWS (Amplify): More complex, steeper learning curve
- Supabase: Good alternative, less mature ecosystem
- Custom backend (Node.js + PostgreSQL): Slower to build, more control

**Decision**: Firebase is ideal for MVP and early growth. Can migrate to custom backend if costs become prohibitive.

---

### Why React?

**Pros**:
- Large ecosystem and community
- Excellent performance with Virtual DOM
- Great developer experience
- Strong TypeScript support
- Rich component libraries

**Cons**:
- Requires build tooling
- Learning curve for state management

**Alternatives Considered**:
- Vue.js: Simpler, smaller ecosystem
- Svelte: Faster, less mature
- Next.js: SSR/SSG not needed for private app

**Decision**: React is the safest choice for hiring and ecosystem.

---

### Why Firestore (NoSQL) instead of SQL?

**Pros**:
- Schema-less (easy to iterate)
- Real-time updates
- Auto-scaling
- Easy to get started

**Cons**:
- No complex joins
- Difficult to refactor data model
- Query limitations (no OR, limited IN)

**Mitigation**:
- Denormalize data for performance
- Use Cloud Functions for complex queries
- Consider BigQuery for analytics (future)

**Decision**: Firestore is acceptable for MVP. Monitor query complexity and costs. Consider PostgreSQL (Supabase) if data modeling becomes too constrained.

---

## Next Steps

1. Set up Firebase project (auth, firestore, hosting, functions)
2. Initialize React project with Vite and TypeScript
3. Implement authentication flows
4. Design and implement Firestore data model
5. Build core UI components and design system
6. Implement dashboard and transaction features
7. Set up CI/CD pipeline
8. Deploy to staging for testing

**Ready to proceed with data model design? See [data-models.md](data-models.md)**
