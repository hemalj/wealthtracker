# Security Architecture

## Overview

Security is paramount for a portfolio management application handling sensitive financial data. This document outlines the security architecture, authentication, authorization, data protection, and compliance measures.

---

## Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Users and services have minimum necessary permissions
3. **Zero Trust**: Verify every request, trust nothing
4. **Data Encryption**: Encrypt data at rest and in transit
5. **Privacy by Design**: Minimize data collection, maximize user control
6. **Audit Trail**: Log all significant actions
7. **Regular Updates**: Keep dependencies and infrastructure updated

---

## Authentication

### Firebase Authentication

**Supported Methods**:
- Email/Password
- Google OAuth 2.0

**Security Features**:
- Secure password hashing (bcrypt)
- JWT tokens with expiration
- Email verification required
- Password reset via email
- Session management

---

### Email/Password Authentication

**Registration Flow**:
```typescript
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

async function registerUser(email: string, password: string) {
  // Password requirements: min 8 chars, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new Error('Password must be at least 8 characters with 1 uppercase and 1 number');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send verification email
    await sendEmailVerification(user);

    // Create user profile in Firestore
    await createUserProfile(user.uid, email);

    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already registered');
    }
    throw error;
  }
}
```

**Login Flow**:
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Update lastLoginAt
    await updateUserProfile(user.uid, { lastLoginAt: serverTimestamp() });

    return user;
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      // Generic error to prevent user enumeration
      throw new Error('Invalid email or password');
    }
    throw error;
  }
}
```

**Password Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- Optional: Special character

**Password Reset**:
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
  // Always return success (don't reveal if email exists)
  return { success: true, message: 'Password reset email sent if account exists' };
}
```

---

### Google OAuth

**OAuth Flow**:
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if new user (first login)
    const isNewUser = result._tokenResponse?.isNewUser;

    if (isNewUser) {
      // Create user profile
      await createUserProfile(user.uid, user.email!, user.displayName, user.photoURL);
    } else {
      // Update last login
      await updateUserProfile(user.uid, { lastLoginAt: serverTimestamp() });
    }

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    }
    throw error;
  }
}
```

**Benefits**:
- No password management
- Verified email (Google pre-verifies)
- Better user experience
- Reduced registration friction

---

### Session Management

**Token Expiration**:
- ID tokens expire after 1 hour
- Refresh tokens expire after 30 days of inactivity
- Tokens auto-refresh when user is active

**Multi-Device Login**:
- Supported (user can be logged in on multiple devices)
- View active sessions in Settings (future feature)
- "Logout All Devices" option (future feature)

**Session Revocation**:
```typescript
import { signOut } from 'firebase/auth';

async function logout() {
  await signOut(auth);
  // Clear local storage and redirect to login
  localStorage.clear();
  window.location.href = '/login';
}
```

---

### Account Lockout

**Failed Login Attempts**:
- Max 5 failed attempts within 15 minutes
- Temporary lockout for 15 minutes
- Email notification on lockout

**Implementation** (Cloud Function):
```typescript
export const trackFailedLogin = onCall(async (request) => {
  const email = request.data.email;
  const db = getFirestore();
  const attemptsRef = db.collection('loginAttempts').doc(email);

  const doc = await attemptsRef.get();
  const attempts = doc.data()?.attempts || 0;
  const lastAttempt = doc.data()?.lastAttempt?.toMillis() || 0;

  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  // Reset counter if last attempt was > 15 minutes ago
  if (now - lastAttempt > fifteenMinutes) {
    await attemptsRef.set({ attempts: 1, lastAttempt: FieldValue.serverTimestamp() });
    return { locked: false };
  }

  // Increment counter
  const newAttempts = attempts + 1;

  if (newAttempts >= 5) {
    // Lock account
    await attemptsRef.set({
      attempts: newAttempts,
      lastAttempt: FieldValue.serverTimestamp(),
      lockedUntil: new Date(now + fifteenMinutes),
    });

    // Send email notification
    await sendAccountLockEmail(email);

    return { locked: true, lockedUntil: now + fifteenMinutes };
  }

  await attemptsRef.set({
    attempts: newAttempts,
    lastAttempt: FieldValue.serverTimestamp(),
  });

  return { locked: false, attemptsRemaining: 5 - newAttempts };
});
```

---

## Authorization

### Role-Based Access Control (RBAC)

**Roles**:
- `user`: Regular user (default)
- `admin`: Internal admin (can access admin dashboard)

**Custom Claims** (Firebase Auth):
```typescript
import { getAuth } from 'firebase-admin/auth';

// Set admin role
async function setAdminRole(userId: string) {
  await getAuth().setCustomUserClaims(userId, { admin: true });
}

// Check role in Cloud Function
export const adminOnlyFunction = onCall(async (request) => {
  if (!request.auth?.token.admin) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  // Admin logic
});
```

**Check Role Client-Side**:
```typescript
import { getIdTokenResult } from 'firebase/auth';

async function checkAdminRole(user: User) {
  const idTokenResult = await getIdTokenResult(user);
  return !!idTokenResult.claims.admin;
}
```

---

### Firestore Security Rules

**Principle**: Users can only access their own data

**Rules File** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function: Check if user is admin
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    // Helper function: Check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection: Users can only read/write their own profile
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isAdmin(); // Only admins can delete users
    }

    // Accounts collection: Users can only access their own accounts
    match /accounts/{accountId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Transactions collection: Users can only access their own transactions
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid &&
        validateTransaction(request.resource.data);
      allow update: if isAuthenticated() &&
        resource.data.userId == request.auth.uid &&
        validateTransaction(request.resource.data);
      allow delete: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
    }

    // Holdings collection: Read-only for users, writable by Cloud Functions only
    match /holdings/{holdingId} {
      allow read: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow write: if false; // Only Cloud Functions can write holdings
    }

    // Symbols collection: Read by all authenticated users, write by admins only
    match /symbols/{symbolId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Prices collection: Read by all authenticated users, write by Cloud Functions only
    match /prices/{priceId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only Cloud Functions can write prices
    }

    // Admin collections: Admin access only
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }

    // Portfolio snapshots: Users can only access their own snapshots
    match /portfolioSnapshots/{snapshotId} {
      allow read: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow write: if false; // Only Cloud Functions can write snapshots
    }

    // Validation function for transactions
    function validateTransaction(data) {
      return data.keys().hasAll(['userId', 'accountId', 'transactionType', 'date', 'symbol', 'totalAmount']) &&
        data.userId is string &&
        data.accountId is string &&
        data.transactionType in ['initial_position', 'buy', 'sell', 'dividend', 'split_forward', 'split_reverse'] &&
        data.date is timestamp &&
        data.symbol is string &&
        data.totalAmount is number;
    }
  }
}
```

**Key Security Features**:
- User data isolation (userId check)
- Admin-only collections
- Input validation (validateTransaction)
- Write restrictions (holdings, prices)
- Prevent unauthorized reads

---

### Firebase Storage Security Rules

**Rules File** (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // File size limit: 10MB
    match /users/{userId}/imports/{fileName} {
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024; // 10MB
    }

    // Only allow specific file types
    match /users/{userId}/attachments/{fileName} {
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.contentType.matches('image/.*') ||
        request.resource.contentType == 'application/pdf';
    }

    // Admin access to all files
    match /{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.auth.token.admin == true;
    }
  }
}
```

---

## Data Protection

### Encryption

**Data in Transit**:
- HTTPS/TLS 1.3 for all connections
- Firebase SDK uses encrypted connections
- API calls over HTTPS only
- Strict Transport Security (HSTS) headers

**Data at Rest**:
- Firestore encrypts all data automatically (AES-256)
- Firebase Storage encrypts files (AES-256)
- Encryption keys managed by Google Cloud

**Sensitive Data**:
- No credit card data stored (Stripe handles payments)
- Account numbers are optional (user choice)
- No SSN or tax ID stored

---

### Data Minimization

**What We Collect**:
- Email address (required for account)
- Display name (optional)
- Portfolio data (user-provided)
- Usage analytics (anonymized)

**What We DON'T Collect**:
- Brokerage login credentials
- Social Security Numbers
- Credit card numbers (Stripe handles this)
- Personal identification documents
- Phone numbers (optional for 2FA in future)

---

### Input Validation & Sanitization

**Client-Side Validation** (React Hook Form + Zod):
```typescript
import { z } from 'zod';

const transactionSchema = z.object({
  symbol: z.string().min(1).max(10).regex(/^[A-Z0-9]+$/),
  quantity: z.number().positive().max(1000000),
  unitPrice: z.number().positive().max(1000000),
  totalAmount: z.number().positive().max(100000000),
});
```

**Server-Side Validation** (Cloud Functions):
```typescript
export const createTransaction = onCall(async (request) => {
  const data = request.data;

  // Validate all required fields
  if (!data.symbol || typeof data.symbol !== 'string') {
    throw new HttpsError('invalid-argument', 'Invalid symbol');
  }

  if (!data.quantity || typeof data.quantity !== 'number' || data.quantity <= 0) {
    throw new HttpsError('invalid-argument', 'Invalid quantity');
  }

  // Sanitize inputs
  const sanitizedSymbol = data.symbol.toUpperCase().trim();

  // Additional validation logic
  // ...
});
```

**XSS Prevention**:
- React escapes output by default
- Use DOMPurify for user-generated HTML (if any)
- Content Security Policy (CSP) headers

**SQL Injection Prevention**:
- Not applicable (Firestore is NoSQL)
- Firestore queries are parameterized

---

### API Security

**Cloud Functions Security**:
- Require authentication for all user-facing functions
- Validate all inputs
- Rate limiting (user-level and global)
- CORS configuration (allow only app domain)

**CORS Configuration**:
```typescript
import cors from 'cors';

const corsOptions = {
  origin: [
    'https://app.wealthtracker.com',
    'https://staging.wealthtracker.com',
    'http://localhost:5173', // Dev only
  ],
  credentials: true,
};

export const myFunction = onRequest((request, response) => {
  cors(corsOptions)(request, response, () => {
    // Function logic
  });
});
```

**Rate Limiting**:
```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

export const rateLimitedFunction = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    await rateLimiter.consume(userId);
  } catch {
    throw new HttpsError('resource-exhausted', 'Too many requests. Please try again later.');
  }

  // Function logic
});
```

---

### Content Security Policy (CSP)

**Firebase Hosting Headers** (`firebase.json`):
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://eodhd.com; frame-src 'self' https://*.firebaseapp.com;"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "geolocation=(), microphone=(), camera=()"
          }
        ]
      }
    ]
  }
}
```

---

## Compliance

### GDPR (General Data Protection Regulation)

**User Rights**:
1. **Right to Access**: Users can export all their data (Settings → Export Data)
2. **Right to Rectification**: Users can edit their profile and data
3. **Right to Erasure**: Users can delete their account (Settings → Delete Account)
4. **Right to Data Portability**: Export to CSV/JSON
5. **Right to Object**: Users can opt-out of analytics

**Data Export**:
```typescript
export const exportUserData = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const db = getFirestore();

  // Collect all user data
  const userData = await db.collection('users').doc(userId).get();
  const accounts = await db.collection('accounts').where('userId', '==', userId).get();
  const transactions = await db.collection('transactions').where('userId', '==', userId).get();
  const holdings = await db.collection('holdings').where('userId', '==', userId).get();

  const exportData = {
    profile: userData.data(),
    accounts: accounts.docs.map(doc => doc.data()),
    transactions: transactions.docs.map(doc => doc.data()),
    holdings: holdings.docs.map(doc => doc.data()),
    exportedAt: new Date().toISOString(),
  };

  // Save to Firebase Storage
  const bucket = getStorage().bucket();
  const fileName = `exports/user-data-${userId}-${Date.now()}.json`;
  const file = bucket.file(fileName);

  await file.save(JSON.stringify(exportData, null, 2), {
    contentType: 'application/json',
    metadata: {
      userId: userId,
    },
  });

  // Generate signed URL (valid for 7 days)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return { downloadUrl: url };
});
```

**Account Deletion**:
```typescript
export const deleteUserAccount = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Soft delete (mark as deleted, remove after 30 days)
  const db = getFirestore();
  await db.collection('users').doc(userId).update({
    isDeleted: true,
    deletedAt: FieldValue.serverTimestamp(),
  });

  // Schedule hard delete after 30 days
  await db.collection('deletionQueue').add({
    userId: userId,
    scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Send confirmation email
  await sendAccountDeletionEmail(userId);

  return { success: true, message: 'Account scheduled for deletion in 30 days' };
});

// Scheduled function: Hard delete after 30 days
export const processAccountDeletions = onSchedule('every day 02:00', async () => {
  const db = getFirestore();
  const now = new Date();

  const deletions = await db
    .collection('deletionQueue')
    .where('scheduledDeletionAt', '<=', now)
    .get();

  for (const doc of deletions.docs) {
    const userId = doc.data().userId;

    // Delete all user data
    await deleteUserData(userId);

    // Delete Firebase Auth account
    await getAuth().deleteUser(userId);

    // Remove from deletion queue
    await doc.ref.delete();
  }
});
```

---

### CCPA (California Consumer Privacy Act)

**User Rights** (similar to GDPR):
- Right to know what data is collected
- Right to delete data
- Right to opt-out of data sale (we don't sell data)

**Privacy Policy**: Clearly state data collection and usage practices

---

### SOC 2 (Future)

**When to Pursue**: After reaching 1,000 paid users
**Requirements**:
- Security controls documentation
- Access controls and monitoring
- Incident response procedures
- Regular audits
- Vendor risk management

---

## Audit Logging

### What to Log

**User Actions**:
- Login/Logout
- Account creation/deletion
- Password changes
- Transaction create/update/delete
- Account create/update/delete
- Data exports
- Settings changes

**Admin Actions**:
- Symbol database changes
- User impersonation (if implemented)
- Custom claims changes
- System configuration changes

**Security Events**:
- Failed login attempts
- Account lockouts
- Suspicious activity (unusual IP, multiple devices)
- API rate limit violations

---

### Implementation

**Firestore Collection**: `auditLogs/{logId}`

```typescript
interface AuditLog {
  logId: string;
  userId: string;
  action: string; // 'login', 'create_transaction', 'delete_account'
  resourceType: string | null; // 'transaction', 'account', null
  resourceId: string | null; // transactionId, accountId, null
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Timestamp;
  metadata: Record<string, any>; // Additional context
}
```

**Logging Function**:
```typescript
async function logAuditEvent(
  userId: string,
  action: string,
  resourceType: string | null = null,
  resourceId: string | null = null,
  metadata: Record<string, any> = {}
) {
  const db = getFirestore();

  await db.collection('auditLogs').add({
    userId,
    action,
    resourceType,
    resourceId,
    ipAddress: metadata.ipAddress || null,
    userAgent: metadata.userAgent || null,
    timestamp: FieldValue.serverTimestamp(),
    metadata,
  });
}

// Usage
await logAuditEvent(userId, 'create_transaction', 'transaction', transactionId, {
  symbol: 'AAPL',
  quantity: 100,
});
```

---

## Incident Response

### Security Incident Plan

**Severity Levels**:
1. **Critical**: Data breach, unauthorized access to user data
2. **High**: Vulnerability discovered, service disruption
3. **Medium**: Failed attack attempt, suspicious activity
4. **Low**: Minor security issue, no user impact

**Response Steps**:
1. **Detect**: Monitoring alerts, user reports
2. **Assess**: Determine severity and impact
3. **Contain**: Isolate affected systems, revoke access
4. **Investigate**: Root cause analysis, audit logs
5. **Remediate**: Fix vulnerability, patch systems
6. **Notify**: Inform affected users (if required by law)
7. **Review**: Post-mortem, improve processes

**Contact Plan**:
- **Critical/High**: Notify all team members immediately (Slack, SMS)
- **Medium**: Notify on-call engineer (email, Slack)
- **Low**: Create ticket, address in next sprint

---

### Data Breach Response

**Steps**:
1. **Immediate Actions**:
   - Revoke all API keys and secrets
   - Reset affected user passwords (force re-auth)
   - Take affected systems offline if needed

2. **Investigation**:
   - Review audit logs
   - Identify compromised data
   - Determine breach scope

3. **Notification** (within 72 hours):
   - Email affected users
   - Report to authorities (if required by GDPR/CCPA)
   - Public disclosure (if large-scale)

4. **Remediation**:
   - Fix vulnerabilities
   - Improve security controls
   - Conduct security audit

---

## Security Testing

### Regular Security Audits

**Quarterly**:
- Review Firestore Security Rules
- Review Firebase Storage Rules
- Check for dependency vulnerabilities (`npm audit`)
- Review access logs for anomalies
- Rotate API keys and secrets

**Annually**:
- Third-party security audit (penetration testing)
- SOC 2 audit (when mature)
- Update security documentation

---

### Dependency Scanning

**Automated Tools**:
- `npm audit` (part of CI/CD)
- Snyk or Dependabot (GitHub integration)
- Automatic PRs for dependency updates

**Policy**:
- Critical vulnerabilities: Fix within 24 hours
- High vulnerabilities: Fix within 7 days
- Medium/Low: Fix in next sprint

---

### Penetration Testing

**When**: Before public launch, then annually

**Scope**:
- Authentication bypass attempts
- Authorization vulnerabilities
- XSS and injection attacks
- API security
- Data access controls

**Vendors**: HackerOne, Bugcrowd, or independent security consultant

---

## Security Checklist (Pre-Launch)

- [ ] Firebase Authentication configured correctly
- [ ] Firestore Security Rules tested and deployed
- [ ] Firebase Storage Rules tested and deployed
- [ ] HTTPS enforced (no HTTP)
- [ ] CSP headers configured
- [ ] API keys and secrets in environment variables (not in code)
- [ ] Rate limiting implemented
- [ ] Input validation on client and server
- [ ] Audit logging functional
- [ ] GDPR compliance (data export, account deletion)
- [ ] Privacy Policy and Terms of Service published
- [ ] Cookie consent banner (if using cookies)
- [ ] Sentry error tracking configured
- [ ] Security monitoring alerts set up
- [ ] Incident response plan documented
- [ ] Dependency vulnerabilities fixed
- [ ] Penetration testing completed
- [ ] Security documentation reviewed

---

## Summary

WealthTracker implements security best practices:

1. **Strong Authentication**: Firebase Auth with email verification and OAuth
2. **Granular Authorization**: Firestore Security Rules with user isolation
3. **Data Encryption**: TLS in transit, AES-256 at rest
4. **GDPR Compliant**: Data export, account deletion, user control
5. **Audit Logging**: Track all significant actions
6. **Incident Response**: Clear plan for security incidents
7. **Regular Testing**: Dependency scanning, penetration testing, audits

**Key Principle**: Security is not a feature, it's a requirement.

**Next**: See [deployment-strategy.md](deployment-strategy.md) for production deployment
