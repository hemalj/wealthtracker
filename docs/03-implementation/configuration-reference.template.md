# Configuration Reference Template

## 🚨 IMPORTANT: How to Use This Template

**This is a TEMPLATE file**. To use it:

1. **Copy this file**:
   ```bash
   cp docs/03-implementation/configuration-reference.template.md \
      docs/03-implementation/configuration-reference.md
   ```

2. **Fill in your credentials**: Open `configuration-reference.md` and replace all `[FILL IN]` placeholders with your actual values

3. **Keep it secure**: The `.gitignore` is configured to prevent your filled copy from being committed to Git

4. **Never commit your filled version**: The template (`.template.md`) is safe to commit, but your filled version (`configuration-reference.md`) contains sensitive data and must stay local

---

## Overview

This document contains all configuration settings, API keys, and credentials needed to set up and run WealthTracker. Fill in the values below as you create accounts with each service.

**⚠️ SECURITY WARNING**: This file contains sensitive information.
- **DO NOT commit this file to version control**
- Add `**/configuration-reference.md` to `.gitignore`
- Keep this file secure and backed up separately
- Use environment variables for actual deployment

---

## 1. Firebase Configuration

### Firebase Project Setup

**Firebase Project Details**:
```
Project Name: [FILL IN - e.g., "wealthtracker"]
Project ID: [FILL IN - e.g., "wealthtracker-dev"]
Region: [FILL IN - e.g., "us-central1"]
```

### Firebase Console URLs
- **Firebase Console**: https://console.firebase.google.com/project/[YOUR_PROJECT_ID]
- **Firestore Database**: https://console.firebase.google.com/project/[YOUR_PROJECT_ID]/firestore
- **Authentication**: https://console.firebase.google.com/project/[YOUR_PROJECT_ID]/authentication
- **Cloud Functions**: https://console.firebase.google.com/project/[YOUR_PROJECT_ID]/functions

---

### 1.1 Firebase Web App Configuration

**How to get**: Firebase Console → Project Settings → Your apps → Web app

```javascript
// Frontend configuration (.env.development and .env.production)
VITE_FIREBASE_API_KEY="[FILL IN - e.g., AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]"
VITE_FIREBASE_AUTH_DOMAIN="[FILL IN - e.g., wealthtracker-dev.firebaseapp.com]"
VITE_FIREBASE_PROJECT_ID="[FILL IN - e.g., wealthtracker-dev]"
VITE_FIREBASE_STORAGE_BUCKET="[FILL IN - e.g., wealthtracker-dev.appspot.com]"
VITE_FIREBASE_MESSAGING_SENDER_ID="[FILL IN - e.g., 123456789012]"
VITE_FIREBASE_APP_ID="[FILL IN - e.g., 1:123456789012:web:abcdef123456]"
VITE_FIREBASE_MEASUREMENT_ID="[FILL IN - e.g., G-XXXXXXXXXX]"
```

**Purpose**: Used by the React frontend to connect to Firebase services (Auth, Firestore, Storage)

---

### 1.2 Firebase Admin SDK Configuration

**How to get**: Firebase Console → Project Settings → Service Accounts → Generate new private key

**⚠️ CRITICAL**: This file contains your private key. Never commit to version control!

**File Location**: `functions/serviceAccountKey.json`

```json
{
  "type": "service_account",
  "project_id": "[FILL IN]",
  "private_key_id": "[FILL IN]",
  "private_key": "[FILL IN - Long string starting with -----BEGIN PRIVATE KEY-----]",
  "client_email": "[FILL IN - e.g., firebase-adminsdk-xxxxx@wealthtracker-dev.iam.gserviceaccount.com]",
  "client_id": "[FILL IN]",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "[FILL IN]"
}
```

**Purpose**: Used by Cloud Functions to authenticate with Firebase Admin SDK

**Alternative for Cloud Functions**: Use Application Default Credentials (ADC) in production (no service account file needed)

---

### 1.3 Firebase Authentication Setup

**Enable Authentication Methods**: Firebase Console → Authentication → Sign-in method

**Methods to Enable**:
- ✅ **Email/Password**: Enable
- ✅ **Google**: Enable
  - **Web client ID**: [FILL IN - Auto-generated when you enable Google sign-in]
  - **Web client secret**: [FILL IN - Auto-generated]

**Authorized Domains** (for production):
```
[FILL IN - e.g., wealthtracker.com]
[FILL IN - e.g., app.wealthtracker.com]
```

---

### 1.4 Firestore Database Setup

**Database Mode**: Native mode (not Datastore mode)

**Location**: [FILL IN - e.g., "us-central" or "nam5" for multi-region]

**Security Rules Status**:
- ✅ Rules deployed: [YES/NO]
- Rules file location: `firestore.rules`

---

### 1.5 Cloud Functions Configuration

**Function Region**: [FILL IN - e.g., "us-central1"]

**Environment Variables for Functions**:
```bash
# Set using: firebase functions:config:set key="value"

# EODHD API
firebase functions:config:set eodhd.api_key="[FILL IN]"

# Stripe (when implemented)
firebase functions:config:set stripe.secret_key="[FILL IN]"
firebase functions:config:set stripe.webhook_secret="[FILL IN]"

# SendGrid (when implemented)
firebase functions:config:set sendgrid.api_key="[FILL IN]"
firebase functions:config:set sendgrid.from_email="[FILL IN - e.g., noreply@wealthtracker.com]"

# Application settings
firebase functions:config:set app.url="[FILL IN - e.g., https://wealthtracker.com]"
```

**View current config**:
```bash
firebase functions:config:get
```

---

## 2. EODHD API Configuration

### EODHD Account Details

**Website**: https://eodhd.com/

**Account Information**:
```
Email: [FILL IN]
Plan: [FILL IN - e.g., "All-World" or "Startup"]
Monthly Cost: [FILL IN - e.g., $20 or $80]
API Rate Limit: [FILL IN - e.g., "100,000 requests/month"]
```

**API Key**:
```
EODHD_API_KEY="[FILL IN - e.g., 6123456789abcdef.01234567]"
```

**How to get**: https://eodhd.com/cp/dashboard → API Token

**Where to use**:
- Frontend (for symbol search): `.env.development` and `.env.production` as `VITE_EODHD_API_KEY`
- Backend (Cloud Functions): Set via `firebase functions:config:set eodhd.api_key="YOUR_KEY"`

**API Endpoints Used**:
- Real-time price: `https://eodhd.com/api/real-time/{SYMBOL}.{EXCHANGE}?api_token={API_KEY}&fmt=json`
- EOD price: `https://eodhd.com/api/eod/{SYMBOL}.{EXCHANGE}?api_token={API_KEY}&fmt=json`
- Search: `https://eodhd.com/api/search/{QUERY}?api_token={API_KEY}&fmt=json`
- Exchange list: `https://eodhd.com/api/exchanges-list/?api_token={API_KEY}&fmt=json`

---

## 3. Static Hosting Configuration

### Option 1: Vercel (Recommended)

**Account**: [FILL IN - Email used for Vercel account]

**Project Configuration**:
```
Project Name: [FILL IN - e.g., "wealthtracker"]
Production URL: [FILL IN - e.g., https://wealthtracker.vercel.app]
Custom Domain: [FILL IN - e.g., https://wealthtracker.com]
```

**Environment Variables** (Vercel Dashboard → Project Settings → Environment Variables):
```
VITE_FIREBASE_API_KEY="[FILL IN - Same as Firebase Web App]"
VITE_FIREBASE_AUTH_DOMAIN="[FILL IN]"
VITE_FIREBASE_PROJECT_ID="[FILL IN]"
VITE_FIREBASE_STORAGE_BUCKET="[FILL IN]"
VITE_FIREBASE_MESSAGING_SENDER_ID="[FILL IN]"
VITE_FIREBASE_APP_ID="[FILL IN]"
VITE_FIREBASE_MEASUREMENT_ID="[FILL IN]"
VITE_EODHD_API_KEY="[FILL IN]"
VITE_SENTRY_DSN="[FILL IN - Once Sentry is set up]"
VITE_ENV="production"
```

**GitHub Integration**:
- Repository: [FILL IN - e.g., github.com/hemalj/wealthtracker]
- Branch: `main` (auto-deploys on push)

---

### Option 2: Netlify (Alternative)

**Account**: [FILL IN - Email used for Netlify account]

**Project Configuration**:
```
Site Name: [FILL IN - e.g., "wealthtracker"]
Production URL: [FILL IN - e.g., https://wealthtracker.netlify.app]
Custom Domain: [FILL IN]
```

**Build Settings**:
```
Build Command: npm run build
Publish Directory: dist
```

**Environment Variables**: Same as Vercel (see above)

---

## 4. Stripe Configuration (Post-MVP)

**⚠️ Note**: Not needed for MVP. Fill in when implementing subscription features (Month 5+)

**Website**: https://stripe.com/

**Account Information**:
```
Email: [FILL IN]
Business Name: [FILL IN]
```

### Test Mode (Development)

```
STRIPE_PUBLISHABLE_KEY_TEST="[FILL IN - Starts with pk_test_]"
STRIPE_SECRET_KEY_TEST="[FILL IN - Starts with sk_test_]"
STRIPE_WEBHOOK_SECRET_TEST="[FILL IN - Starts with whsec_]"
```

### Live Mode (Production)

```
STRIPE_PUBLISHABLE_KEY_LIVE="[FILL IN - Starts with pk_live_]"
STRIPE_SECRET_KEY_LIVE="[FILL IN - Starts with sk_live_]"
STRIPE_WEBHOOK_SECRET_LIVE="[FILL IN - Starts with whsec_]"
```

**Product IDs**:
```
STRIPE_PRICE_ID_PRO="[FILL IN - e.g., price_XXXXXXXXXXXXX]"
STRIPE_PRICE_ID_PREMIUM="[FILL IN - e.g., price_XXXXXXXXXXXXX]"
```

**Webhook Endpoint**:
```
URL: https://us-central1-[YOUR_PROJECT_ID].cloudfunctions.net/stripeWebhook
Events to listen: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed
```

---

## 5. SendGrid Configuration (Post-MVP)

**⚠️ Note**: Not needed for MVP. Can use Firebase Auth emails initially.

**Website**: https://sendgrid.com/

**Account Information**:
```
Email: [FILL IN]
Plan: [FILL IN - e.g., "Free" or "Essentials"]
```

**API Key**:
```
SENDGRID_API_KEY="[FILL IN - Starts with SG.]"
```

**Sender Identity**:
```
From Email: [FILL IN - e.g., noreply@wealthtracker.com]
From Name: [FILL IN - e.g., "WealthTracker"]
Reply-To Email: [FILL IN - e.g., support@wealthtracker.com]
```

**Email Templates** (Create in SendGrid Dashboard):
```
Welcome Email Template ID: [FILL IN - e.g., d-xxxxxxxxxxxxx]
Password Reset Template ID: [FILL IN]
Transaction Confirmation Template ID: [FILL IN]
Weekly Summary Template ID: [FILL IN]
```

---

## 6. Sentry Configuration (Error Tracking)

**Website**: https://sentry.io/

**Account Information**:
```
Email: [FILL IN]
Organization: [FILL IN - e.g., "wealthtracker"]
```

**DSN (Data Source Name)**:
```
VITE_SENTRY_DSN="[FILL IN - e.g., https://xxxxx@o123456.ingest.sentry.io/123456]"
SENTRY_DSN_BACKEND="[FILL IN - For Cloud Functions]"
```

**How to get**: Sentry Dashboard → Project Settings → Client Keys (DSN)

**Projects**:
- Frontend: `wealthtracker-frontend`
- Backend: `wealthtracker-backend`

---

## 7. Analytics Configuration

### Google Analytics 4

**Website**: https://analytics.google.com/

**Account Information**:
```
Property Name: [FILL IN - e.g., "WealthTracker"]
Measurement ID: [FILL IN - e.g., G-XXXXXXXXXX]
```

**Configuration**:
```javascript
VITE_GA_MEASUREMENT_ID="[FILL IN - e.g., G-XXXXXXXXXX]"
```

---

### Mixpanel (Optional)

**Website**: https://mixpanel.com/

**Account Information**:
```
Email: [FILL IN]
Project: [FILL IN - e.g., "WealthTracker"]
```

**Token**:
```
VITE_MIXPANEL_TOKEN="[FILL IN]"
```

**How to get**: Mixpanel Dashboard → Project Settings → Access Keys

---

## 8. Domain & DNS Configuration

**Domain Registrar**: [FILL IN - e.g., "Namecheap", "Google Domains", "GoDaddy"]

**Domain Name**: [FILL IN - e.g., "wealthtracker.com"]

**DNS Records** (Configure at your domain registrar):

```
# Main app
Type: A
Name: @
Value: [FILL IN - Vercel/Netlify IP or CNAME value]

# WWW subdomain
Type: CNAME
Name: www
Value: [FILL IN - e.g., cname.vercel-dns.com]

# Email (if using custom domain for SendGrid)
Type: CNAME
Name: em
Value: [FILL IN - SendGrid will provide]

Type: TXT
Name: @
Value: [FILL IN - SPF record from SendGrid]

Type: TXT
Name: _dmarc
Value: [FILL IN - DMARC record]
```

**SSL Certificate**: Automatically provided by Vercel/Netlify

---

## 9. GitHub Repository Configuration

**Repository**: https://github.com/[USERNAME]/wealthtracker

**Owner**: [FILL IN - e.g., "hemalj"]

**Repository Settings**:
```
Visibility: [FILL IN - "Public" or "Private"]
Default Branch: main
Branch Protection Rules: [YES/NO]
```

**GitHub Secrets** (Settings → Secrets and variables → Actions):
```
FIREBASE_TOKEN="[FILL IN - Generate with: firebase login:ci]"
FIREBASE_PROJECT_ID="[FILL IN]"
VERCEL_TOKEN="[FILL IN - From Vercel account settings]"
VERCEL_ORG_ID="[FILL IN]"
VERCEL_PROJECT_ID="[FILL IN]"
```

**How to get Firebase Token**:
```bash
firebase login:ci
# Copy the token that's generated
```

---

## 10. Development Environment Setup

### Local Environment Variables

**File**: `.env.development` (Frontend root directory)

```bash
# Firebase
VITE_FIREBASE_API_KEY="[FILL IN]"
VITE_FIREBASE_AUTH_DOMAIN="[FILL IN]"
VITE_FIREBASE_PROJECT_ID="[FILL IN]"
VITE_FIREBASE_STORAGE_BUCKET="[FILL IN]"
VITE_FIREBASE_MESSAGING_SENDER_ID="[FILL IN]"
VITE_FIREBASE_APP_ID="[FILL IN]"
VITE_FIREBASE_MEASUREMENT_ID="[FILL IN]"

# EODHD
VITE_EODHD_API_KEY="[FILL IN]"

# Environment
VITE_ENV="development"

# Feature Flags
VITE_ENABLE_EMULATORS="true"
VITE_ENABLE_ANALYTICS="false"
VITE_ENABLE_ERROR_TRACKING="false"
```

**File**: `.env.production` (Frontend root directory)

```bash
# Same as development but with production values
# VITE_ENV="production"
# VITE_ENABLE_EMULATORS="false"
# VITE_ENABLE_ANALYTICS="true"
# VITE_ENABLE_ERROR_TRACKING="true"
```

---

### Firebase Emulator Configuration

**File**: `firebase.json` (Already configured in project)

**Emulator Ports**:
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

**Access Emulators**:
- Emulator UI: http://localhost:4000
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001

---

## 11. Admin User Setup

**First Admin User** (Create manually in Firebase Console after first deployment):

```
Email: [FILL IN - Your admin email]
Password: [FILL IN - Strong password]
```

**Steps to create admin**:
1. Sign up via the app with your email
2. Go to Firebase Console → Firestore
3. Find your user document in `users` collection
4. Edit document and add field:
   ```
   role: "admin"
   ```

**Admin Privileges**:
- Access to admin dashboard
- Manage stock symbols
- Manual price updates (during MVP)
- View all users (Post-MVP)

---

## 12. Monitoring & Logging

### Firebase Performance Monitoring

**Setup**: Automatically enabled with Firebase SDK

**Access**: Firebase Console → Performance

### Cloud Functions Logs

**Access**: Firebase Console → Functions → Logs

**Or via CLI**:
```bash
firebase functions:log
```

---

## 13. Backup & Recovery

### Firestore Backups

**Automated Backups**: [YES/NO - Enable in Firebase Console]

**Backup Schedule**: [FILL IN - e.g., "Daily at 2 AM UTC"]

**Backup Location**: [FILL IN - e.g., "gs://wealthtracker-backups"]

### GitHub Repository Backup

**Status**: Backed up on GitHub (repository is the source of truth)

**Local Clone Location**: [FILL IN - Your local path]

---

## 14. Testing Credentials

### Test User Accounts (for development/testing)

**Test User 1**:
```
Email: [FILL IN - e.g., testuser1@example.com]
Password: [FILL IN]
Purpose: Regular user testing
```

**Test User 2**:
```
Email: [FILL IN - e.g., testuser2@example.com]
Password: [FILL IN]
Purpose: Multi-account testing
```

**Test Admin**:
```
Email: [FILL IN - e.g., admin@example.com]
Password: [FILL IN]
Purpose: Admin feature testing
```

---

## 15. Important Commands Reference

### Firebase Commands
```bash
# Login
firebase login

# Initialize project (already done)
firebase init

# Start emulators
firebase emulators:start

# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Set function config
firebase functions:config:set key="value"

# Get function config
firebase functions:config:get

# View logs
firebase functions:log
```

### Development Commands
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## 16. Support & Documentation URLs

**Firebase Documentation**: https://firebase.google.com/docs
**EODHD API Docs**: https://eodhd.com/financial-apis/
**Vite Documentation**: https://vitejs.dev/
**React Documentation**: https://react.dev/
**Material-UI Documentation**: https://mui.com/
**Stripe Documentation**: https://stripe.com/docs
**Vercel Documentation**: https://vercel.com/docs
**GitHub Actions Documentation**: https://docs.github.com/en/actions

---

## 17. Quick Setup Checklist

Use this checklist to track your configuration progress:

### Phase 1: Initial Setup (Do First)
- [ ] Create Firebase project
- [ ] Fill in Firebase Web App configuration
- [ ] Download Firebase Admin SDK service account key
- [ ] Enable Firebase Authentication (Email/Password + Google)
- [ ] Create Firestore database
- [ ] Sign up for EODHD API (free trial or paid)
- [ ] Fill in EODHD API key

### Phase 2: Development Environment (Do Second)
- [ ] Create `.env.development` file with Firebase config
- [ ] Add EODHD API key to `.env.development`
- [ ] Set up Firebase emulators
- [ ] Test local development setup

### Phase 3: Deployment Setup (Do Third)
- [ ] Create Vercel/Netlify account
- [ ] Connect GitHub repository
- [ ] Configure environment variables on hosting platform
- [ ] Deploy to production
- [ ] Set up custom domain (optional)

### Phase 4: Additional Services (Do When Needed)
- [ ] Set up Sentry for error tracking
- [ ] Set up Google Analytics
- [ ] Configure Stripe (Post-MVP)
- [ ] Configure SendGrid (Post-MVP)
- [ ] Create admin user account

---

## 18. Security Reminders

**DO**:
✅ Use environment variables for all sensitive data
✅ Never commit API keys or credentials to Git
✅ Use different keys for development and production
✅ Rotate keys regularly (every 6 months)
✅ Keep this document in a secure location
✅ Use strong passwords for all accounts
✅ Enable 2FA on all services

**DON'T**:
❌ Commit `.env` files to version control
❌ Share API keys in public channels
❌ Use production keys in development
❌ Store credentials in plain text in code
❌ Give admin access to untrusted users

---

## Notes & Additional Information

[FILL IN - Add any additional notes, decisions, or context you need to remember]

---

**Document Version**: 1.0.0
**Last Updated**: [FILL IN DATE when you complete this]
**Maintained By**: [YOUR NAME]
**Next Review Date**: [FILL IN - Suggest reviewing quarterly]
