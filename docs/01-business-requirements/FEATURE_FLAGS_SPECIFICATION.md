# Feature Flags System Specification

## Overview

Feature flags (also called feature toggles) allow admins to dynamically enable/disable features in the application without deploying new code. This provides flexibility for gradual rollouts, A/B testing, emergency kill switches, and feature gating.

---

## Business Requirements

### Use Cases

1. **Gradual Rollout**: Release features to small percentage of users first, then increase
2. **Kill Switch**: Immediately disable problematic features without redeploying
3. **Beta Features**: Enable experimental features for specific users (beta testers)
4. **Maintenance Mode**: Disable writes during maintenance windows
5. **Region-Specific Features**: Enable features for specific regions only
6. **A/B Testing**: Test different implementations with different user groups
7. **Emergency Response**: Quickly disable resource-intensive features under load

---

## Feature Flag Types

### 1. Global Feature Flags

**Description**: On/off switches that affect all users

**Examples**:
- `transactions.csv_import.enabled` - Enable/disable CSV import
- `dashboard.realtime_prices.enabled` - Enable/disable real-time price updates
- `calculators.compound_interest.enabled` - Enable/disable compound interest calculator
- `admin.manual_price_updates.enabled` - Enable/disable manual price update feature

**Storage**: Firestore `feature_flags` collection

### 2. User-Level Feature Flags

**Description**: Per-user overrides for beta testing

**Examples**:
- Enable CSV import for specific beta testers
- Enable new dashboard design for specific users

**Storage**: `users/{userId}/feature_overrides` subcollection

### 3. Percentage Rollout Flags

**Description**: Enable features for X% of users (gradual rollout)

**Examples**:
- Enable new transaction form for 10% of users
- Enable PDF export for 25% of users

**Logic**: Hash user ID, check if `hash(userId) % 100 < percentage`

### 4. Environment-Based Flags

**Description**: Different flag states for dev/staging/prod

**Examples**:
- Enable debug logging in dev/staging only
- Enable maintenance mode in staging for testing

---

## Data Model

### Firestore: `feature_flags` Collection

```typescript
interface FeatureFlag {
  flagId: string;                    // e.g., "transactions.csv_import"
  name: string;                      // Human-readable name
  description: string;               // What this flag controls
  category: 'core' | 'experimental' | 'beta' | 'deprecated';

  // Flag state
  enabled: boolean;                  // Global on/off
  rolloutPercentage: number;         // 0-100, percentage of users

  // Targeting
  allowedUserIds: string[];          // Specific users (beta testers)
  blockedUserIds: string[];          // Specific users to exclude
  allowedEnvironments: string[];     // ['development', 'staging', 'production']

  // Metadata
  createdAt: Timestamp;
  createdBy: string;                 // Admin user ID
  updatedAt: Timestamp;
  updatedBy: string;
  expiresAt: Timestamp | null;       // Optional expiration (for temporary flags)

  // Audit
  changeHistory: FlagChangeEvent[];  // Track all changes
}

interface FlagChangeEvent {
  timestamp: Timestamp;
  userId: string;
  userEmail: string;
  action: 'enabled' | 'disabled' | 'created' | 'deleted' | 'updated';
  previousValue: boolean | null;
  newValue: boolean;
  reason: string;                    // Why the change was made
}
```

### User-Level Overrides: `users/{userId}/feature_overrides` Subcollection

```typescript
interface UserFeatureOverride {
  flagId: string;                    // e.g., "transactions.csv_import"
  enabled: boolean;                  // Override value
  reason: string;                    // Why this user has override
  grantedBy: string;                 // Admin who granted override
  grantedAt: Timestamp;
  expiresAt: Timestamp | null;       // Optional expiration
}
```

---

## Feature Flags for Major Features

### Core Features (MVP)

| Flag ID | Name | Description | Default |
|---------|------|-------------|---------|
| `auth.google_oauth.enabled` | Google OAuth | Enable Google sign-in | true |
| `auth.email_password.enabled` | Email/Password Auth | Enable email/password sign-in | true |
| `accounts.create.enabled` | Create Accounts | Enable account creation | true |
| `accounts.delete.enabled` | Delete Accounts | Enable account deletion | true |
| `transactions.csv_import.enabled` | CSV Import | Enable bulk CSV import | true |
| `transactions.delete.enabled` | Delete Transactions | Enable transaction deletion | true |
| `transactions.export.enabled` | Export Transactions | Enable CSV export | true |
| `dashboard.enabled` | Dashboard | Enable portfolio dashboard | true |
| `calculators.simple_interest.enabled` | Simple Interest Calculator | Enable calculator | true |
| `calculators.compound_interest.enabled` | Compound Interest Calculator | Enable calculator | true |
| `admin.symbol_management.enabled` | Symbol Management | Enable admin symbol CRUD | true |
| `admin.manual_price_updates.enabled` | Manual Price Updates | Enable manual price upload | true |

### Experimental Features (Post-MVP)

| Flag ID | Name | Description | Default |
|---------|------|-------------|---------|
| `transactions.manual_form.enabled` | Manual Transaction Form | Enable single transaction form | false |
| `transactions.bulk_edit.enabled` | Bulk Edit | Enable bulk transaction editing | false |
| `reports.performance.enabled` | Performance Reports | Enable performance analytics | false |
| `reports.tax.enabled` | Tax Reports | Enable tax lot reporting | false |
| `api.external_access.enabled` | External API | Enable external API access | false |
| `integrations.plaid.enabled` | Plaid Integration | Enable Plaid broker sync | false |
| `notifications.email.enabled` | Email Notifications | Enable email notifications | false |
| `notifications.push.enabled` | Push Notifications | Enable push notifications (PWA) | false |

### Emergency/Maintenance Flags

| Flag ID | Name | Description | Default |
|---------|------|-------------|---------|
| `system.maintenance_mode.enabled` | Maintenance Mode | Disable writes, show maintenance banner | false |
| `system.read_only_mode.enabled` | Read-Only Mode | Disable all writes | false |
| `performance.rate_limiting.enabled` | Rate Limiting | Enable request rate limiting | true |
| `performance.heavy_operations.enabled` | Heavy Operations | Allow resource-intensive operations | true |

---

## Admin Feature Flag Management Interface

### FR-ADMIN-401: Feature Flags Dashboard

**Priority**: Should Have (MVP Month 4 or Post-MVP Month 5)

**Description**: Admin interface to view and manage all feature flags

**UI Components**:

1. **Feature Flags List**:
   - Table showing all flags
   - Columns: Name, Flag ID, Status (On/Off), Rollout %, Category, Last Updated
   - Filter by category (core, experimental, beta, deprecated)
   - Filter by status (enabled, disabled)
   - Search by name or flag ID
   - Sort by name, last updated, category

2. **Flag Details Panel**:
   - Flag ID and name
   - Description
   - Current status (enabled/disabled)
   - Rollout percentage slider (0-100%)
   - Allowed users list (beta testers)
   - Blocked users list
   - Environment filters (dev, staging, prod)
   - Change history timeline
   - Expiration date (optional)

3. **Quick Actions**:
   - Toggle On/Off (with confirmation)
   - Adjust rollout percentage
   - Add/remove beta users
   - Set expiration date
   - View change history
   - Delete flag (deprecated flags only)

### FR-ADMIN-402: Toggle Feature Flag

**Workflow**:
1. Admin clicks toggle switch next to feature flag
2. Confirmation dialog appears:
   - "Enable [Feature Name]?"
   - "This will affect X users"
   - Reason input field (required): "Why are you enabling/disabling this?"
   - Confirm / Cancel buttons
3. Admin enters reason and confirms
4. System:
   - Updates flag in Firestore
   - Logs change event with timestamp, admin, reason
   - Invalidates client-side cache
   - Sends notification to monitoring system (optional)
5. Success toast: "Feature flag updated successfully"

### FR-ADMIN-403: Gradual Rollout

**Workflow**:
1. Admin selects feature flag
2. Clicks "Rollout Settings"
3. Slider appears: "Enable for X% of users" (0-100%)
4. Admin adjusts slider (e.g., 10%)
5. Confirmation dialog:
   - "Enable for 10% of users?"
   - "Estimated users affected: ~X"
   - Reason input field
6. Admin confirms
7. System updates rollout percentage
8. Users are gradually enabled based on hash(userId)

### FR-ADMIN-404: Beta User Management

**Workflow**:
1. Admin selects feature flag
2. Clicks "Manage Beta Users"
3. Modal appears with:
   - Current beta users list (with remove button)
   - "Add Beta User" input (email or user ID)
   - Search existing users
4. Admin adds user email/ID
5. System:
   - Creates user-level feature override
   - Logs beta access grant
   - Optionally sends email to user
6. Beta user now has access to feature

### FR-ADMIN-405: Emergency Kill Switch

**Workflow**:
1. Admin detects issue with feature (e.g., CSV import causing crashes)
2. Admin goes to Feature Flags dashboard
3. Admin clicks "Emergency Disable" button next to problematic feature
4. Fast confirmation dialog (skip reason for emergencies):
   - "EMERGENCY: Disable [Feature]?"
   - "This will immediately disable the feature for all users"
   - Emergency Disable / Cancel
5. System:
   - Immediately disables flag
   - Broadcasts to all clients via Firestore listener
   - Logs emergency disable event
   - Sends alert to admin Slack/email
6. Feature instantly disabled for all users

---

## Client-Side Implementation

### React Hook: `useFeatureFlag`

```typescript
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

/**
 * Hook to check if a feature flag is enabled for the current user
 * @param flagId - Feature flag ID (e.g., 'transactions.csv_import.enabled')
 * @param defaultValue - Default value if flag not found (default: false)
 * @returns boolean indicating if feature is enabled
 */
export function useFeatureFlag(flagId: string, defaultValue = false): boolean {
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsEnabled(defaultValue);
      return;
    }

    // Listen to global feature flag
    const flagRef = doc(db, 'feature_flags', flagId);
    const unsubscribe = onSnapshot(flagRef, (snapshot) => {
      if (!snapshot.exists()) {
        setIsEnabled(defaultValue);
        return;
      }

      const flag = snapshot.data();

      // Check user-level override first
      const userOverrideRef = doc(db, `users/${user.uid}/feature_overrides`, flagId);
      onSnapshot(userOverrideRef, (overrideSnapshot) => {
        if (overrideSnapshot.exists()) {
          const override = overrideSnapshot.data();
          // Check if override expired
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

function checkGlobalFlag(flag: any, userId: string): boolean {
  // Check if globally disabled
  if (!flag.enabled) return false;

  // Check environment
  const env = import.meta.env.VITE_ENV;
  if (flag.allowedEnvironments?.length > 0 && !flag.allowedEnvironments.includes(env)) {
    return false;
  }

  // Check if user is blocked
  if (flag.blockedUserIds?.includes(userId)) return false;

  // Check if user is explicitly allowed
  if (flag.allowedUserIds?.includes(userId)) return true;

  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    const hash = hashUserId(userId);
    return (hash % 100) < flag.rolloutPercentage;
  }

  return true;
}

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

### Usage in Components

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export function TransactionImportButton() {
  const isCsvImportEnabled = useFeatureFlag('transactions.csv_import.enabled', true);

  if (!isCsvImportEnabled) {
    return null; // Feature disabled, don't render button
  }

  return (
    <Button onClick={handleImportClick}>
      Import Transactions
    </Button>
  );
}

// Conditional rendering in routes
export function AppRoutes() {
  const isManualFormEnabled = useFeatureFlag('transactions.manual_form.enabled', false);

  return (
    <Routes>
      <Route path="/transactions" element={<TransactionList />} />
      {isManualFormEnabled && (
        <Route path="/transactions/new" element={<TransactionForm />} />
      )}
    </Routes>
  );
}
```

---

## Cloud Functions Integration

### Function: Check Feature Flag (Server-Side)

```typescript
import { db } from './firebaseAdmin';

export async function isFeatureEnabled(
  flagId: string,
  userId: string,
  defaultValue = false
): Promise<boolean> {
  try {
    // Check user-level override first
    const userOverride = await db
      .collection('users')
      .doc(userId)
      .collection('feature_overrides')
      .doc(flagId)
      .get();

    if (userOverride.exists) {
      const override = userOverride.data()!;
      // Check expiration
      if (override.expiresAt && override.expiresAt.toDate() < new Date()) {
        // Override expired, fall through to global flag
      } else {
        return override.enabled;
      }
    }

    // Check global flag
    const flagDoc = await db.collection('feature_flags').doc(flagId).get();
    if (!flagDoc.exists) {
      return defaultValue;
    }

    const flag = flagDoc.data()!;

    // Check if globally disabled
    if (!flag.enabled) return false;

    // Check if user is blocked
    if (flag.blockedUserIds?.includes(userId)) return false;

    // Check if user is explicitly allowed
    if (flag.allowedUserIds?.includes(userId)) return true;

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = hashUserId(userId);
      return (hash % 100) < flag.rolloutPercentage;
    }

    return true;
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return defaultValue;
  }
}

// Usage in Cloud Function
export const createTransaction = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');

  // Check if CSV import is enabled for this user
  const canImport = await isFeatureEnabled('transactions.csv_import.enabled', userId, true);
  if (!canImport) {
    throw new functions.https.HttpsError('permission-denied', 'CSV import is currently disabled');
  }

  // Proceed with transaction creation...
});
```

---

## Security Rules

```javascript
// Firestore Security Rules for feature_flags collection
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Feature flags - Read by all authenticated users, write by admins only
    match /feature_flags/{flagId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // User feature overrides - Read by owner and admins, write by admins only
    match /users/{userId}/feature_overrides/{flagId} {
      allow read: if request.auth != null &&
                     (request.auth.uid == userId ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Development Strategy

### Phase 1: Foundation (Month 2 - Week 1)

**Goal**: Set up basic feature flag system

**Tasks**:
1. Create `feature_flags` Firestore collection
2. Implement `useFeatureFlag` React hook
3. Create initial feature flags for MVP features
4. Add feature flag checks to 2-3 critical features (CSV import, dashboard)
5. Test in development environment

**Deliverables**:
- ✅ Feature flag hook working
- ✅ 5-10 core feature flags created
- ✅ CSV import gated by feature flag

### Phase 2: Admin UI (Month 4 - Week 2 or Post-MVP Month 5)

**Goal**: Build admin interface for feature flag management

**Tasks**:
1. Create Feature Flags admin page
2. Implement toggle switches with confirmation dialogs
3. Add change history tracking
4. Implement rollout percentage slider
5. Add beta user management
6. Test emergency kill switch

**Deliverables**:
- ✅ Admin can view all feature flags
- ✅ Admin can toggle flags on/off with audit trail
- ✅ Admin can adjust rollout percentage
- ✅ Emergency kill switch works instantly

### Phase 3: Advanced Features (Post-MVP)

**Goal**: Add advanced targeting and analytics

**Tasks**:
1. Implement A/B testing support
2. Add analytics integration (track feature usage)
3. Implement scheduled flag changes (enable at specific time)
4. Add region-based targeting
5. Build feature flag dashboard with usage metrics

---

## Acceptance Criteria

### Functional

- ✅ Admin can enable/disable any feature flag
- ✅ Changes take effect immediately (< 5 seconds for all clients)
- ✅ User-level overrides work correctly
- ✅ Rollout percentage targeting works (accurate to ±2%)
- ✅ Disabled features are completely hidden from UI
- ✅ Emergency kill switch works instantly
- ✅ All flag changes are logged with reason and admin user

### Performance

- ✅ Feature flag check completes in < 50ms (client-side)
- ✅ Feature flag check completes in < 100ms (server-side)
- ✅ Flag state cached on client (not fetched on every render)
- ✅ Real-time updates via Firestore listeners (no polling)

### Security

- ✅ Only admins can modify feature flags
- ✅ All users can read feature flags
- ✅ User overrides only readable by owner and admins
- ✅ Audit trail cannot be modified (append-only)
- ✅ Emergency kill switch requires admin authentication

### Monitoring

- ✅ Flag state changes logged to audit trail
- ✅ Emergency disables trigger alerts
- ✅ Feature usage metrics tracked (optional)
- ✅ Gradual rollout progress monitored

---

## Testing

### Unit Tests

```typescript
describe('useFeatureFlag hook', () => {
  it('should return true when flag is globally enabled', async () => {
    // Test global enabled flag
  });

  it('should return false when flag is globally disabled', async () => {
    // Test global disabled flag
  });

  it('should respect user-level override', async () => {
    // Test user override takes precedence
  });

  it('should respect rollout percentage', async () => {
    // Test percentage-based targeting
  });

  it('should handle expired overrides', async () => {
    // Test override expiration
  });

  it('should return default value when flag not found', async () => {
    // Test default behavior
  });
});
```

### Integration Tests

```typescript
describe('Feature Flag Admin UI', () => {
  it('should toggle flag on/off', async () => {
    // Test admin can toggle flag
  });

  it('should record change in audit trail', async () => {
    // Test change history logged
  });

  it('should require reason for changes', async () => {
    // Test reason field required
  });

  it('should update all clients in real-time', async () => {
    // Test Firestore listener updates
  });
});
```

---

## Best Practices

### Naming Conventions

- Use dot notation: `category.feature.enabled`
- Be specific: `transactions.csv_import.enabled` (not `csv.enabled`)
- Use `.enabled` suffix for boolean flags
- Use consistent categories: `auth`, `transactions`, `dashboard`, `admin`, `system`, etc.

### Flag Lifecycle

1. **New Feature**: Create flag, set to `false` initially
2. **Beta Testing**: Enable for specific beta users via user overrides
3. **Gradual Rollout**: Increase percentage: 10% → 25% → 50% → 100%
4. **Full Release**: Set to 100% or remove flag check from code
5. **Deprecation**: Mark flag as deprecated, schedule removal
6. **Cleanup**: Remove flag from codebase and Firestore after all users on new version

### Emergency Procedures

**When to use emergency kill switch**:
- Feature causing crashes or errors
- Security vulnerability discovered
- Database overload due to feature
- External API rate limits exceeded

**Emergency disable process**:
1. Admin clicks "Emergency Disable"
2. Flag disabled instantly
3. Alert sent to admin team
4. Incident created in monitoring system
5. Post-mortem conducted
6. Fix deployed
7. Flag re-enabled after validation

---

**Last Updated**: January 28, 2026
**Status**: Ready for Implementation
**Priority**: Should Have (Month 4 or Post-MVP Month 5)
