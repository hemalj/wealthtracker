# Feature Specifications

## Overview

This document provides detailed functional specifications for all WealthTracker features, organized by module and priority.

---

## 1. Authentication & User Management

### 1.1 User Registration

**Priority**: Must Have (MVP)

**Description**: Users can create accounts using email/password or Google OAuth.

**Functional Requirements**:

**FR-AUTH-001**: Email/Password Registration
- User provides email, password (min 8 chars, 1 uppercase, 1 number)
- System validates email format and uniqueness
- System sends verification email with link
- User must verify email before full access
- Password is hashed using Firebase Authentication

**FR-AUTH-002**: Google OAuth Registration
- User clicks "Sign up with Google" button
- System redirects to Google OAuth consent screen
- User authorizes WealthTracker access to email/profile
- System creates user profile automatically
- No email verification required (pre-verified by Google)

**FR-AUTH-003**: User Profile Creation
- System creates user document in Firestore
- Initial fields: userId, email, displayName, createdAt, subscriptionTier (default: 'free')
- System creates default preferences (currency: USD, dateFormat, timezone)

**Acceptance Criteria**:
- User can register with email/password
- User can register with Google OAuth
- Email verification email sent within 1 minute
- User profile created in database
- Registration completes in < 5 seconds

---

### 1.2 User Authentication

**Priority**: Must Have (MVP)

**FR-AUTH-101**: Login
- User provides email/password or uses Google OAuth
- System validates credentials
- System creates session token (Firebase Auth)
- User redirected to dashboard

**FR-AUTH-102**: Password Reset
- User clicks "Forgot Password"
- User enters email address
- System sends password reset email
- User clicks link and sets new password
- User automatically logged in after reset

**FR-AUTH-103**: Session Management
- Session persists across browser restarts
- Session expires after 30 days of inactivity
- User can logout manually
- Multi-device login supported

**FR-AUTH-104**: Account Security
- Max 5 failed login attempts before 15-minute lockout
- Email notification on new device login
- Option to view active sessions
- Option to logout all devices

---

## 2. Dashboard (Homepage)

### 2.1 Portfolio Summary

**Priority**: Must Have (MVP)

**Description**: Primary landing page showing portfolio overview and key metrics.

**FR-DASH-001**: Holdings Summary Cards
- Display total portfolio value across all accounts
- Show total unrealized gain/loss ($ and %)
- Show today's change ($ and %)
- Display count of positions and accounts

**FR-DASH-002**: Holdings Summary by Currency
- Group holdings by currency (USD, CAD, INR, etc.)
- Show total value in each currency
- Show converted value in base currency
- Display currency breakdown pie chart

**FR-DASH-003**: Holdings Summary by Account
- List each account with total value
- Show account-level gain/loss
- Show number of positions per account
- Link to filter holdings by account

**FR-DASH-004**: Holdings Summary by Account Type
- Group by account type (Taxable, IRA, 401k, etc.)
- Show allocation percentages
- Display bar chart visualization

**FR-DASH-005**: Refresh Mechanism
- Manual refresh button
- Last updated timestamp
- Real-time price updates (with EODHD API limits)
- Background refresh every 15 minutes during market hours

**Acceptance Criteria**:
- Dashboard loads in < 2 seconds
- All calculations accurate to 2 decimal places
- Responsive design (mobile/tablet/desktop)
- Empty state shown for new users
- Graceful error handling if data unavailable

---

### 2.2 Holdings Table

**Priority**: Must Have (MVP)

**FR-DASH-101**: Holdings Display
- Table columns: Symbol, Name, Quantity, Avg Cost, Current Price, Market Value, Gain/Loss ($), Gain/Loss (%), Account, Currency
- Default sort: By market value (descending)
- Color coding: Green for gains, red for losses
- Show total row at bottom

**FR-DASH-102**: Holdings Filtering
- Filter by account (dropdown, multi-select)
- Filter by account type (dropdown)
- Filter by currency (dropdown)
- Filter by symbol (search input)
- "Show All" option to reset filters

**FR-DASH-103**: Holdings Sorting
- Sort by any column (ascending/descending)
- Default: Market value descending
- Persist sort preference in session
- Visual indicator of active sort

**FR-DASH-104**: Holdings Actions
- Click symbol to view transaction history
- Click account to filter by that account
- Hover tooltip showing additional details
- Quick action button to add transaction

**FR-DASH-105**: Pagination
- 25 positions per page (default)
- Options: 10, 25, 50, 100, All
- Page navigation controls
- Total count display

---

### 2.3 Dividend Summary

**Priority**: Must Have (MVP)

**FR-DASH-201**: Dividend Earnings Summary
- Show total dividends received (YTD, Last 12 months, All time)
- Display dividend income by month (bar chart)
- Show top dividend payers
- Display dividend yield of portfolio

**FR-DASH-202**: Dividend Earnings Table
- Columns: Date, Symbol, Amount, Currency, Account
- Sort by date (recent first)
- Filter by date range, account, symbol
- Show running total
- Export to CSV option

**FR-DASH-203**: Upcoming Dividends
- Show scheduled dividend payments (next 90 days)
- Display ex-dividend dates
- Estimate based on historical dividends
- Total expected income

---

## 3. Transaction Management

### 3.1 Bulk CSV Import (Primary Transaction Method)

**Priority**: Must Have (MVP)

**Description**: Bulk CSV import is the **primary method** for adding transactions in MVP. Users can import their transaction history from broker statements or spreadsheets, enabling quick onboarding with years of historical data.

**Rationale for MVP**:
- Most users have historical transaction data from brokers (CSV exports)
- Onboarding users with existing portfolios is critical for adoption
- Entering hundreds of historical transactions manually is impractical
- Bulk import provides immediate value (vs. manual entry being tedious)
- Users can export from Fidelity/Schwab/Interactive Brokers and import directly

**FR-TRANS-001**: CSV File Upload & Validation
- User uploads CSV file (max 10MB, 10,000 rows)
- Supported formats: UTF-8 CSV
- Drag-and-drop or file picker
- File size and row count preview
- Validate CSV structure and encoding
- Progress indicator during upload
- Clear error messages for invalid files

**FR-TRANS-002**: Column Mapping Interface
- Preview first 10 rows from CSV
- User maps CSV columns to system fields:
  - **Required**: Date, Account, Symbol, Type, Quantity (for Buy/Sell/Initial/Split), Unit Price (for Buy/Sell/Initial)
  - **Optional**: Total Amount, Currency, Fees, Commission, MER, Notes, Split Ratio
- Auto-detect common column names (Date, Symbol, Type, Qty, Price, Amount, Account, etc.)
- Save/load mapping templates for reuse
- Support for multiple date formats (ISO 8601, MM/DD/YYYY, DD/MM/YYYY, etc.)
- Currency code recognition (USD, CAD, EUR, GBP, INR)

**FR-TRANS-003**: Data Validation & Preview
- Validate all rows before import:
  - Date format and not in future
  - Account exists or can be created
  - Symbol format valid
  - Transaction type valid (Buy, Sell, Dividend, Split, Initial Position)
  - Quantity > 0 where required
  - Unit Price > 0 where required
  - Split ratio format correct (e.g., "2:1", "1:5")
  - Total Amount > 0 for Dividends
- Preview table shows validation status per row:
  - Green: Valid, ready to import
  - Yellow: Warning (e.g., symbol not in database, will be added)
  - Red: Error, must be fixed or skipped
- User can edit data directly in preview table
- Allow partial import (import valid rows, skip errors)
- Download error report CSV with detailed error descriptions

**FR-TRANS-004**: Symbol & Account Disambiguation
- **Symbol Disambiguation**:
  - Auto-detect duplicate symbols (e.g., SHOP on NASDAQ vs TSX)
  - User provides mapping: Symbol + Currency → Exchange
  - System saves symbol-to-exchange mapping permanently
  - Apply mapping to all matching rows in current and future imports
  - "Resolve All" button to fix all ambiguous symbols at once
- **Account Matching**:
  - Auto-match account names (case-insensitive, fuzzy matching)
  - Suggest close matches if exact match not found
  - Options if account not found:
    1. Create new account on-the-fly (name, type, currency)
    2. Map to existing account
    3. Skip transactions for this account
  - Bulk account mapping interface

**FR-TRANS-005**: Import Processing & Progress
- Process in batches (500 rows per batch for performance)
- Real-time progress indicator:
  - Progress bar with percentage
  - Current batch / total batches
  - Rows processed / total rows
  - Estimated time remaining
- Background processing for large imports (>1,000 rows)
- Email notification on completion (for background imports)
- User can cancel import in progress (rollback partial import)

**FR-TRANS-006**: Post-Import Summary & Rollback
- **Post-Import Summary**:
  - Total transactions imported
  - Transactions skipped (with reasons)
  - Accounts affected (list)
  - Symbols imported (unique count)
  - Date range of transactions
  - Import completion time
- **Actions**:
  - View imported transactions (filtered list)
  - Download full import report (summary + detailed errors)
  - Undo/Rollback import within 24 hours
- **Rollback Feature**:
  - Delete all transactions from that specific import
  - Confirmation dialog with impact warning
  - Audit trail of rollback action
  - Rollback disabled after 24 hours (prevent accidental data loss)

**FR-TRANS-007**: CSV Template & Import History
- **CSV Template Download**:
  - Sample CSV template with example data
  - All transaction types included (Buy, Sell, Dividend, Split, Initial Position)
  - Required vs optional fields clearly marked
  - Date format examples
  - Split ratio examples
  - Currency codes (USD, CAD, EUR, GBP, INR)
  - Instructions document explaining each field
- **Broker-Specific Templates**:
  - Fidelity format
  - Schwab format
  - Interactive Brokers format
  - Template instructions for each broker
- **Import History**:
  - List of all previous imports:
    - Import date/time
    - File name
    - Rows imported / skipped / failed
    - Status (completed, partial, failed)
    - User who performed import
  - View details of any past import
  - Rollback available for 24 hours

**Acceptance Criteria**:
- ✅ Import 1,000 transactions in < 30 seconds
- ✅ Support common broker CSV formats (Fidelity, Schwab, Interactive Brokers)
- ✅ Clear validation errors with row numbers and descriptions
- ✅ No data loss during import process
- ✅ Rollback available for 24 hours after import
- ✅ Column mapping templates saved for reuse
- ✅ Symbol and account mappings persist across imports
- ✅ Email notification for background imports
- ✅ Detailed import report downloadable

---

### 3.2 Transaction List, Search & Bulk Actions

**Priority**: Must Have (MVP)

**Description**: View, search, filter, and perform bulk actions on transactions.

**FR-TRANS-101**: Transaction Table
- Columns: Date, Account, Symbol, Type, Quantity, Unit Price, Total, Currency, Actions
- Default sort: Date descending (most recent first)
- Color coding by transaction type:
  - Buy: Green
  - Sell: Red
  - Dividend: Blue
  - Split: Purple
  - Initial Position: Orange
- Action buttons: Edit, Delete, Duplicate

**FR-TRANS-102**: Search & Filters
- Search by symbol (partial match, case-insensitive)
- Filter by account (multi-select dropdown)
- Filter by transaction type (multi-select: Buy, Sell, Dividend, Split, Initial Position)
- Filter by date range (from/to date pickers, presets: Last 7 days, Last 30 days, Last 3 months, Last year, All time)
- Filter by currency (multi-select: USD, CAD, EUR, etc.)
- "Clear all filters" button
- Filter state persists across page refreshes

**FR-TRANS-103**: Sorting
- Sort by any column (click column header)
- Multi-column sort (hold Shift + click)
- Visual indicator of active sort (arrow icon)
- Persist sort preferences per user

**FR-TRANS-104**: Pagination
- 50 transactions per page (default)
- Options: 25, 50, 100, 500, All
- Virtual scrolling for "All" option (performance optimization)
- Page navigation controls (First, Previous, Next, Last)
- Jump to page number

**FR-TRANS-105**: Bulk Actions
- Select multiple transactions (checkboxes)
- Bulk delete with confirmation dialog
- Bulk export to CSV (filtered or selected)
- Select all on current page
- Select all matching current filter
- Bulk edit common fields (account, notes) - Post-MVP

**Acceptance Criteria**:
- ✅ Table loads < 2 seconds for 1,000 transactions
- ✅ Search/filter results instant (<500ms)
- ✅ Bulk export 10,000 transactions in < 10 seconds
- ✅ Responsive design works on mobile (320px+)
- ✅ Sort order and filters persist

---

### 3.3 Transaction Type Reference

**Priority**: Must Have (MVP - Documentation & Import Validation)

**Description**: Defines all supported transaction types and their business logic. This section is used for CSV import validation and future manual entry implementation.

**FR-TRANS-201**: Transaction Types Supported

**Initial Position**:
- **Purpose**: Record existing holdings when starting to track a position
- **Use Case**: User has 100 shares purchased over many years and wants to start tracking from current point forward
- **Required Fields**: Symbol, Quantity, Unit Price (average cost), Date, Account
- **Behavior**: Creates position without affecting cash balance
- **CRITICAL RULE**: Initial Position takes **absolute priority** over BUY transactions
  - Any BUY transactions dated **on or before** the Initial Position date are **IGNORED** for cost basis calculations
  - Only BUY transactions **after** the Initial Position date are included in cost basis
  - If multiple Initial Positions exist for same symbol, use the most recent one
- **Example**:
  - BUY 50 shares on Jan 1 @ $100 (ignored)
  - BUY 30 shares on Jan 5 @ $110 (ignored)
  - **INITIAL POSITION**: 100 shares on Jan 10 @ $105 (this is the starting point)
  - BUY 20 shares on Jan 15 @ $108 (included)
  - **Result**: Position = 120 shares with cost basis = (100 × $105) + (20 × $108) = $12,660

**Buy Transaction**:
- **Purpose**: Record purchase of shares/units
- **Required Fields**: Symbol, Quantity, Unit Price, Date, Account
- **Optional Fields**: Fees, Commission, MER
- **Calculation**: Total = (Quantity × Unit Price) + Fees + Commission + MER
- **Behavior**: Increases position quantity, adds to cost basis

**Sell Transaction**:
- **Purpose**: Record sale of shares/units
- **Required Fields**: Symbol, Quantity, Unit Price, Date, Account
- **Optional Fields**: Fees, Commission
- **Calculation**: Total = (Quantity × Unit Price) - Fees - Commission
- **Behavior**:
  - Decreases position quantity
  - Calculates realized gain/loss using FIFO (First-In-First-Out) method
  - Validation: Cannot sell more than current position quantity

**Dividend Transaction**:
- **Purpose**: Record dividend/distribution income
- **Required Fields**: Symbol, Total Amount, Date, Account
- **Optional Fields**: None (quantity and unit price not applicable)
- **Behavior**:
  - Records dividend income (does not affect position quantity or cost basis)
  - Links to symbol for dividend history tracking
  - Updates total dividend income metrics

**Split Transaction - Forward**:
- **Purpose**: Record forward stock split (e.g., 2:1 where 1 share becomes 2)
- **Required Fields**: Symbol, Split Ratio (format: "2:1"), Date, Account
- **Calculation**: Multiplier = new/old (e.g., 2:1 = 2.0)
- **Behavior**:
  - Quantity multiplied by multiplier
  - Cost per share divided by multiplier
  - **Total cost basis remains unchanged**
- **Example**: 100 shares @ $50 with 2:1 split → 200 shares @ $25

**Split Transaction - Reverse**:
- **Purpose**: Record reverse stock split (e.g., 1:5 where 5 shares become 1)
- **Required Fields**: Symbol, Split Ratio (format: "1:5"), Date, Account
- **Optional Fields**: Cash in Lieu (for fractional shares)
- **Calculation**: Multiplier = new/old (e.g., 1:5 = 0.2)
- **Behavior**:
  - **Whole shares only**: Quantity = floor(oldQuantity × multiplier)
  - Cost per share increased proportionally
  - **CRITICAL**: Cost basis adjusted to exclude fractional shares
  - Fractional shares paid as cash in lieu (treated as partial sale)
- **Example**:
  - Before: 27 shares @ $10 avg cost = $270 total cost basis
  - 1:5 split: 27 ÷ 5 = 5.4 → 5 whole shares
  - 25 old shares convert to 5 new shares (cost: $250)
  - 2 old shares don't convert (cost: $20), paid as cash in lieu
  - After: 5 shares @ $50 avg cost = $250 total cost basis (NOT $270)
  - Cash in lieu: $20, Realized gain/loss: $20 - $20 = $0

**FR-TRANS-202**: Field Definitions

| Field | Type | Required For | Description |
|-------|------|-------------|-------------|
| Date | Date | All | Transaction date (ISO 8601 format, cannot be future) |
| Account | String | All | Account name (must match existing account) |
| Symbol | String | All | Stock/ETF ticker symbol (EODHD format: AAPL.US, SHOP.TO) |
| Transaction Type | Enum | All | Buy, Sell, Dividend, Split, Initial Position |
| Quantity | Number | Buy, Sell, Initial, Split | Number of shares/units (must be > 0) |
| Unit Price | Number | Buy, Sell, Initial | Price per share/unit (must be > 0) |
| Total Amount | Number | Dividend | Total dividend received (must be > 0) |
| Currency | String | All | ISO 4217 currency code, auto-determined from symbol's exchange (see FR-TRANS-203) |
| Fees | Number | Optional | Other transaction fees (brokerage fees, wire fees, etc.) |
| Commission | Number | Optional | Trading commission paid to broker |
| MER | Number | Optional | Management Expense Ratio deduction (for mutual funds/ETFs) |
| Notes | String | Optional | User notes (max 500 characters) |
| Split Ratio | String | Split only | Format: "new:old" (e.g., "2:1", "1:5") |
| Cash in Lieu | Number | Reverse Split | Cash received for fractional shares (optional) |

**Acceptance Criteria**:
- ✅ All transaction types validated correctly during CSV import
- ✅ Initial Position priority rule enforced
- ✅ FIFO method used for sell transactions
- ✅ Forward splits increase quantity, maintain cost basis
- ✅ Reverse splits handle fractional shares correctly
- ✅ Dividends tracked separately from cost basis

**FR-TRANS-203**: Transaction Currency Determination

Currency is automatically determined by the symbol's exchange. Users do not manually select a currency in the transaction form.

| Exchange | Currency |
|----------|----------|
| US (NYSE, NASDAQ, OTC) | USD |
| TO (Toronto Exchange / TSX) | CAD |
| V (TSX Venture Exchange) | CAD |
| NEO (NEO Exchange) | CAD |

**Rules**:
- When a symbol is selected from the autocomplete dropdown, the currency is set automatically based on the symbol's exchange
- When a symbol is free-typed (not matched in the static data), currency defaults to USD
- Currency is not editable by the user in the transaction form
- Currency is displayed in the transaction list for visibility
- For CSV import: if currency column is omitted, derive from the symbol's exchange using the mapping above

---

### 3.4 Individual Transaction Entry (Post-MVP - Nice to Have)

**Priority**: Could Have (Post-MVP - Month 5+)

**Description**: Manual form-based transaction entry for one-off additions or corrections. While useful, this is **not required for MVP** since bulk CSV import covers the primary use case of importing historical data.

**Post-MVP Rationale**:
- Bulk CSV import handles the primary onboarding use case (90% of initial data entry)
- Most users will import historical data once via CSV, then use periodic CSV imports for new transactions from broker
- Manual entry is useful for ad-hoc corrections and single transaction additions, but not critical for launch
- Adds UI complexity (form design, autocomplete, validation, mobile optimization)
- Can be added quickly (1-2 weeks) in Post-MVP based on user feedback
- Transaction editing and deletion (for imported transactions) is still available in MVP

**When to Implement**: Month 5-6 (Post-MVP Phase 1)

**FR-TRANS-301**: Manual Transaction Form (Post-MVP)
- Form-based UI for creating single transactions
- Same fields as CSV import (Date, Account, Symbol, Type, Quantity, Price, etc.)
- Symbol autocomplete with EODHD API integration
- Real-time validation with helpful error messages
- Save and add another workflow
- Duplicate transaction feature (copy and modify existing)

**FR-TRANS-302**: Transaction Editing (MVP - Limited)
- **MVP**: Edit via re-import (delete and re-upload CSV)
- **Post-MVP**: In-place editing with form
- Edit any transaction field
- System recalculates affected positions automatically
- Audit trail of changes (who, what, when)
- Confirmation dialog before saving

**FR-TRANS-303**: Transaction Deletion (MVP - Available)
- Delete single transaction via transaction list
- Confirmation dialog with impact warning (affects X holdings)
- System recalculates affected positions
- Soft delete (marked as deleted, retained for audit)
- Admin can restore deleted transactions (Post-MVP)

**Acceptance Criteria** (Post-MVP):
- ✅ Transaction form saves in < 1 second
- ✅ Portfolio recalculated immediately after save
- ✅ Symbol autocomplete returns results in < 500ms
- ✅ Form validation prevents invalid data
- ✅ Mobile-responsive form (320px+)

---

### 3.5 Position Calculation Logic

**Priority**: Must Have (MVP)

**Description**: Explains how current portfolio positions (holdings) are calculated from transaction history using FIFO cost basis accounting.

#### Overview

Positions are **calculated in real-time** from transaction history, not stored separately. The Holdings collection acts as a **denormalized cache** for performance, but is always recalculated when transactions change.

**Calculation Trigger Events**:
- User creates/edits/deletes a transaction
- Price data is updated (15-minute intervals during market hours)
- User refreshes dashboard
- Background job (nightly reconciliation)

---

#### Cost Basis Methods (MVP vs Post-MVP)

**The system supports TWO cost basis calculation methods:**

### 1. Average Cost Basis (MVP - Always Enabled)

**Priority**: Must Have (MVP)

- **What it is**: Simple average of all purchase costs
- **Formula**: Total cost basis ÷ Total shares = Average cost per share
- **Computation**: Lightweight, minimal overhead
- **Storage**: Low - just 4 fields per holding
- **Example**: Buy 100 @ $10, Buy 50 @ $12 → Avg cost = ($1000 + $600) / 150 = $10.67/share
- **Target Users**: 90% of investors (casual investors, long-term holders)

**Why MVP?**
- Matches what users see in brokerage statements
- Simple to understand and explain
- Low computational overhead
- Sufficient for most investment tracking needs
- Fast dashboard performance

### 2. Tax Lot (FIFO) Basis (Post-MVP - Opt-In Feature)

**Priority**: Should Have (Post-MVP, Months 5-7)

- **What it is**: Tracks each purchase as a separate lot, sells use First-In-First-Out
- **Computation**: Heavy - requires 3-5x more processing
- **Storage**: High - stores array of lots per holding (10-50 lots typical)
- **Example**: Same purchases tracked as Lot 1 (100 @ $10) and Lot 2 (50 @ $12)
- **Target Users**: Power users, tax-conscious investors, accountants

**Why Post-MVP & Opt-In?**
- **Resource Optimization**: Only compute for users who need it
- **Cost Management**: Tax lot tracking uses 3-5x more storage and compute
- **User Segmentation**: Most casual investors don't need this complexity
- **Performance**: Keep system fast for majority of users

**Opt-In Mechanism:**
- User enables `preferences.enableTaxLotTracking = true` in Settings
- System begins calculating and storing tax lots for that user
- Previous transactions are processed to generate historical lots
- User can disable anytime (tax lot data preserved but not updated)

**Key Differences:**

| Aspect | Average Cost (MVP) | Tax Lot FIFO (Post-MVP) |
|--------|-------------------|-------------------------|
| **Phase** | ✅ MVP | 🔄 Post-MVP (Months 5-7) |
| **Enabled By** | Default (all users) | Opt-in (power users only) |
| **Calculation** | Simple average | Tracks individual lots |
| **Computation** | Lightweight | Heavy (3-5x overhead) |
| **Storage** | Low | High (arrays of lots) |
| **Realized Gains** | Approximate | Precise FIFO |
| **Tax Reporting** | Approximate | Schedule D ready |
| **Use Case** | Daily tracking | Tax optimization |
| **Target Users** | 90% of users | 10% power users |

---

#### FR-TRANS-301: Position Aggregation Algorithm

**Step 1: Fetch All Transactions**
- Query all transactions for the position (userId + accountId + symbol)
- Sort by date ascending (oldest first)
- Include: Initial Position, Buy, Sell, Dividend, Split (Forward/Reverse)
- **CRITICAL**: Identify the most recent Initial Position transaction (if any)

**Step 2: Apply Initial Position Priority Rule**

**CRITICAL RULE**: Initial Position takes **absolute priority** over BUY transactions.

```typescript
// Find the most recent Initial Position transaction for this symbol
const initialPosition = transactions.find(
  t => t.transactionType === 'initial_position'
).sort((a, b) => b.date - a.date)[0];  // Most recent if multiple

if (initialPosition) {
  // Filter out ALL BUY transactions on or before Initial Position date
  transactions = transactions.filter(t => {
    if (t.transactionType === 'buy' && t.date <= initialPosition.date) {
      return false;  // IGNORE this buy transaction
    }
    return true;  // Keep all other transactions
  });
}
```

**Why This Rule Exists:**
- Initial Position represents the "starting point" when you begin tracking
- It already includes the average cost of all prior purchases
- Including prior BUY transactions would double-count shares and cost basis
- Example:
  - Jan 1: BUY 50 @ $100 (ignored)
  - Jan 5: BUY 30 @ $110 (ignored)
  - **Jan 10: INITIAL POSITION 100 @ $105** ← This is the reset point
  - Jan 15: BUY 20 @ $108 (included)
  - **Result**: Position = 120 shares (100 from Initial + 20 from Jan 15 buy)

**Step 3: Initialize Position**
```typescript
position = {
  quantity: 0,
  costBasis: 0,
  avgCostPerShare: 0,
  realizedGain: 0,
  dividendIncome: 0,
  taxLots: []  // FIFO queue of purchase lots
}
```

**Step 4: Process Each Transaction Chronologically**

**Initial Position Transaction**:
```typescript
// Creates opening position (resets cost basis to known starting point)
// All BUY transactions on or before this date have been filtered out
position.quantity += transaction.quantity
position.costBasis += transaction.totalAmount
position.taxLots.push({
  transactionId: transaction.id,
  date: transaction.date,
  quantity: transaction.quantity,
  costBasis: transaction.totalAmount,
  costPerShare: transaction.unitPrice
})
```

**Buy Transaction**:
```typescript
// Adds to position
position.quantity += transaction.quantity
position.costBasis += transaction.totalAmount + transaction.fees
position.taxLots.push({
  transactionId: transaction.id,
  date: transaction.date,
  quantity: transaction.quantity,
  costBasis: transaction.totalAmount + transaction.fees,
  costPerShare: (transaction.totalAmount + transaction.fees) / transaction.quantity
})
```

**Sell Transaction (FIFO Method)**:
```typescript
// Removes shares using First-In-First-Out
let remainingToSell = transaction.quantity
let realizedGain = 0
let totalCostBasis = 0

while (remainingToSell > 0 && position.taxLots.length > 0) {
  const lot = position.taxLots[0]  // Oldest lot first (FIFO)

  if (lot.quantity <= remainingToSell) {
    // Sell entire lot
    totalCostBasis += lot.costBasis
    realizedGain += (transaction.unitPrice * lot.quantity) - lot.costBasis
    remainingToSell -= lot.quantity
    position.taxLots.shift()  // Remove lot
  } else {
    // Partial lot sale
    const soldFromLot = remainingToSell
    const costBasisSold = lot.costPerShare * soldFromLot
    totalCostBasis += costBasisSold
    realizedGain += (transaction.unitPrice * soldFromLot) - costBasisSold

    // Update remaining lot
    lot.quantity -= soldFromLot
    lot.costBasis -= costBasisSold
    remainingToSell = 0
  }
}

// Update position
position.quantity -= transaction.quantity
position.costBasis -= totalCostBasis
position.realizedGain += realizedGain - transaction.fees

// Store tax lot details in transaction for tax reporting
transaction.taxLots = [...calculated tax lots]
transaction.costBasis = totalCostBasis
transaction.realizedGain = realizedGain - transaction.fees
```

**Dividend Transaction**:
```typescript
// Does not affect position quantity or cost basis
position.dividendIncome += transaction.totalAmount
```

**Split Transaction - Forward** (e.g., 2:1 split):
```typescript
// Multiplies quantity, divides cost per share
const multiplier = transaction.splitRatioMultiplier  // 2.0 for 2:1

position.quantity *= multiplier
// Cost basis stays the same (value doesn't change in split)

// Adjust each tax lot
position.taxLots.forEach(lot => {
  lot.quantity *= multiplier
  lot.costPerShare /= multiplier
  // lot.costBasis stays the same
})
```

**Split Transaction - Reverse** (e.g., 1:5 split):
```typescript
// Divides quantity (whole shares only), increases cost per share
const multiplier = transaction.splitRatioMultiplier  // 0.2 for 1:5

// Calculate new quantity (whole shares only)
const oldQuantity = position.quantity
const newQuantity = Math.floor(oldQuantity * multiplier)
const fractionalNewShares = (oldQuantity * multiplier) - newQuantity

// CRITICAL: Calculate how many OLD shares don't convert to whole NEW shares
// These OLD shares are paid as cash in lieu
const oldSharesConverted = newQuantity / multiplier  // Whole old shares that convert
const oldSharesNotConverted = oldQuantity - oldSharesConverted  // Fractional old shares

position.quantity = newQuantity

// IMPORTANT: Cost basis adjustment
// Only the cost basis of shares that convert to whole shares remains
// The cost basis of fractional shares is removed (treated as a disposal)
const fractionalCostBasis = (oldSharesNotConverted / oldQuantity) * position.costBasis
position.costBasis -= fractionalCostBasis

// Adjust each tax lot proportionally
position.taxLots.forEach(lot => {
  const oldLotQty = lot.quantity
  const newLotQty = Math.floor(oldLotQty * multiplier)
  const oldLotSharesConverted = newLotQty / multiplier
  const oldLotSharesNotConverted = oldLotQty - oldLotSharesConverted

  // Reduce lot cost basis by the fractional portion
  const lotFractionalCostBasis = (oldLotSharesNotConverted / oldLotQty) * lot.costBasis
  lot.costBasis -= lotFractionalCostBasis
  lot.quantity = newLotQty
  lot.costPerShare = lot.costBasis / lot.quantity  // Recalculate
})

// Handle cash in lieu as a disposal (partial sale)
if (oldSharesNotConverted > 0 && transaction.cashInLieu > 0) {
  // Cash in lieu is treated as a sale of fractional shares
  // Realized gain = cash received - cost basis of fractional shares
  const realizedGainOnFractional = transaction.cashInLieu - fractionalCostBasis
  position.realizedGain += realizedGainOnFractional
}
```

**Example: 1:5 Reverse Split**
```
Before Split:
  - 27 shares at $10/share average cost
  - Cost basis: $270
  - Total value: $270

Reverse Split (1:5 = 5 old shares become 1 new share):
  - 27 old shares ÷ 5 = 5.4 new shares
  - Whole shares: 5 new shares
  - Fractional: 0.4 new shares (represents 2 old shares)

Shares that convert to whole shares:
  - 25 old shares → 5 new shares
  - Cost basis: $250 (25 × $10)

Fractional shares (paid as cash in lieu):
  - 2 old shares → 0.4 new fractional shares
  - Cost basis: $20 (2 × $10)
  - Cash in lieu: 0.4 new shares × $50/share = $20 (if market price is $50/share)
  - Realized gain: $20 - $20 = $0

After Split:
  - 5 shares at $50/share average cost
  - Cost basis: $250 (NOT $270!)
  - Total value: $250
  - Realized gain from cash in lieu: $0
```

**🚨 CRITICAL IMPLEMENTATION NOTE: Reverse Split Cost Basis**

The cost basis after a reverse split must ONLY include shares that convert to whole shares. Do NOT use the full original cost basis.

**Incorrect Approach** ❌:
```typescript
// WRONG: This keeps the full cost basis
position.quantity = 5
position.costBasis = 270  // ❌ WRONG!
position.avgCostPerShare = 270 / 5 = 54  // ❌ Incorrect!
```

**Correct Approach** ✅:
```typescript
// RIGHT: Cost basis adjusted for fractional shares removed
const oldSharesNotConverted = 2  // These don't become whole shares
const fractionalCostBasis = (2 / 27) * 270 = 20
position.costBasis = 270 - 20 = 250  // ✅ Correct!
position.quantity = 5
position.avgCostPerShare = 250 / 5 = 50  // ✅ Correct!
```

**Why this matters**: The fractional shares (2 old shares) are disposed of via cash in lieu payment, so their cost basis must be removed from the position. Keeping the full $270 cost basis would overstate the cost basis and understate gains when the position is eventually sold.

---

**Step 4: Calculate Current Metrics (Both Cost Basis Methods)**

```typescript
// Market value (common to both methods)
position.marketValue = position.quantity * currentPrice

// --- AVERAGE COST BASIS (Default View) ---
position.avgCost = {
  costBasis: position.costBasis,  // Total cost from all tax lots
  costPerShare: position.quantity > 0 ? position.costBasis / position.quantity : 0,
  unrealizedGain: position.marketValue - position.costBasis,
  unrealizedGainPercent: (position.marketValue - position.costBasis) / position.costBasis * 100
}

// --- TAX LOT BASIS (FIFO - for tax optimization) ---
// Tax lots are already maintained from Step 3 processing
position.taxLots = position.taxLots.map(lot => {
  const currentDate = new Date()
  const purchaseDate = lot.date
  const holdingPeriodDays = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24)

  return {
    lotId: lot.transactionId,
    purchaseDate: lot.date,
    transactionId: lot.transactionId,
    quantity: lot.quantity,
    costBasis: lot.costBasis,
    costPerShare: lot.costPerShare,
    unrealizedGain: (currentPrice * lot.quantity) - lot.costBasis,
    holdingPeriod: holdingPeriodDays >= 365 ? 'long' : 'short'
  }
})

// Tax lot summary
position.taxLotSummary = {
  totalCostBasis: position.taxLots.reduce((sum, lot) => sum + lot.costBasis, 0),
  shortTermLots: position.taxLots.filter(lot => lot.holdingPeriod === 'short').length,
  longTermLots: position.taxLots.filter(lot => lot.holdingPeriod === 'long').length,
  oldestLotDate: position.taxLots[0]?.purchaseDate || null
}

// Total return (realized + unrealized + dividends)
position.totalReturn = position.realizedGain + position.avgCost.unrealizedGain + position.dividendIncome
position.totalReturnPercent = (position.totalReturn / (position.costBasis + Math.abs(position.realizedGain))) * 100
```

**Example Output for User with 100 shares:**

**Average Cost View** (Default):
```
Quantity: 100 shares
Cost Basis: $1,050
Avg Cost/Share: $10.50
Current Value: $1,500
Unrealized Gain: $450 (+42.9%)
```

**Tax Lot View** (Detailed):
```
Lot 1: 50 shares @ $10/share (Jan 15, 2025) - Long term
  Cost: $500, Value: $750, Gain: $250 (+50%)
Lot 2: 30 shares @ $11/share (Aug 20, 2025) - Short term
  Cost: $330, Value: $450, Gain: $120 (+36.4%)
Lot 3: 20 shares @ $11/share (Nov 10, 2025) - Short term
  Cost: $220, Value: $300, Gain: $80 (+36.4%)

Total: 100 shares, $1,050 cost basis
Long-term lots: 1 (50 shares)
Short-term lots: 2 (50 shares)
```

**Tax Optimization Insight**: If user sells 50 shares, selling Lot 1 first (FIFO) triggers long-term capital gains (lower tax rate).

```

**Step 5: Store in Holdings Collection**
```typescript
// Save calculated position to holdings/{holdingId}
await firestore.collection('holdings').doc(holdingId).set(position)
```

---

#### FR-TRANS-302: Position Recalculation Rules

**When to Recalculate**:
1. **Immediate Recalculation** (real-time):
   - After any transaction create/update/delete
   - Recalculate affected symbol in affected account only
   - Update Holdings document

2. **Batch Recalculation** (scheduled):
   - Nightly job recalculates all positions for data integrity
   - Price updates trigger batch recalculation of all holdings
   - Catches any missed updates or data inconsistencies

3. **Manual Recalculation**:
   - User-triggered refresh on dashboard
   - Admin tool to recalculate specific user/account/symbol

**Recalculation Performance**:
- Target: < 100ms per position
- Typical position: 10-50 transactions
- Optimize by caching intermediate results
- Use denormalized Holdings collection to avoid recalculation on every page load

---

#### FR-TRANS-303: Edge Cases & Validation

**Short Position (Negative Quantity)**:
- **Not Supported in MVP**: System validates quantity never goes negative
- If sell quantity > position quantity, reject transaction with error
- Error: "Cannot sell more shares than owned. Current position: {quantity}"

**Wash Sale Tracking**:
- **Not Supported in MVP**: No wash sale adjustments
- Future feature: Track sells followed by buys within 30 days

**Corporate Actions**:
- **Supported**: Stock splits (forward/reverse with cash in lieu)
- **Not Supported in MVP**: Mergers, spin-offs, rights offerings, tender offers
- Future: Add transaction types for complex corporate actions

**Partial Lot Sales**:
- **Fully Supported**: FIFO algorithm handles partial lot sales
- Remaining portion of lot stays in tax lot queue

**Zero Position Cleanup**:
- When position.quantity reaches 0, keep Holdings document with historical data
- Set `isClosedPosition: true` flag
- Allows reporting on closed positions and total realized gains
- User can filter to show/hide closed positions

---

#### FR-TRANS-304: Tax Lot Reporting

**Tax Lot Details** (for each sell transaction):
- Transaction ID of original purchase (buy or initial position)
- Purchase date
- Quantity sold from this lot
- Cost basis from this lot
- Gain/loss from this lot
- Holding period: "short" (< 1 year) or "long" (>= 1 year)

**Example Tax Lot Data**:
```json
{
  "transactionId": "sell_txn_123",
  "transactionType": "sell",
  "taxLots": [
    {
      "buyTransactionId": "buy_txn_001",
      "purchaseDate": "2025-01-15",
      "quantity": 30,
      "costBasis": 4200.00,
      "gain": 600.00,
      "holdingPeriod": "long"
    },
    {
      "buyTransactionId": "buy_txn_045",
      "purchaseDate": "2025-08-20",
      "quantity": 20,
      "costBasis": 3100.00,
      "gain": 400.00,
      "holdingPeriod": "short"
    }
  ],
  "totalCostBasis": 7300.00,
  "totalRealizedGain": 1000.00
}
```

**Use Cases**:
- Tax reporting (Schedule D for capital gains)
- Performance analysis by purchase cohort
- Audit trail for cost basis
- Tax loss harvesting opportunities

---

#### FR-TRANS-305: Acceptance Criteria

**Correctness**:
- Position quantity matches sum of all buys minus sells (adjusted for splits)
- Cost basis calculated accurately using FIFO
- Realized gains match FIFO lot assignments
- Split adjustments maintain total cost basis

**Performance**:
- Recalculate position with 100 transactions in < 100ms
- Dashboard loads with 50 positions in < 2 seconds
- Real-time recalculation after transaction create/edit

**Data Integrity**:
- Positions always reconcile with transaction history
- Nightly reconciliation job catches discrepancies
- Alert admin if position calculation fails

**Edge Cases Handled**:
- Partial lot sales
- Multiple splits on same symbol
- Fractional shares in reverse splits (cash in lieu)
- Same-day multiple transactions
- Transactions out of chronological entry order (but processed chronologically)

---

## 4. Account Management

### 4.1 Account CRUD

**Priority**: Must Have (MVP)

**Description**: Manage investment accounts that hold positions.

**FR-ACCT-001**: Create Account
- Form fields:
  - Account Name (text, required, e.g., "Fidelity Taxable")
  - Account Number (text, optional, e.g., "X1234-5678")
  - Account Type (dropdown: Taxable, Traditional IRA, Roth IRA, 401k, 403b, Other)
  - Broker/Institution (text, optional)
  - Base Currency (dropdown, required, default: USD)
  - Notes (text area, optional)
- System generates unique accountId
- CreatedAt timestamp

**FR-ACCT-002**: List Accounts
- Display all accounts in table or card view
- Show: Name, Number, Type, Broker, Currency, Position Count, Total Value
- Sort by name, value, or date created
- Click to view account details

**FR-ACCT-003**: Update Account
- Edit any field except accountId
- Confirm if changing currency (affects all transactions)
- Audit trail of changes

**FR-ACCT-004**: Delete Account
- Confirmation dialog warning about transactions
- Cannot delete if transactions exist (must delete/reassign transactions first)
- OR: Cascade delete option (delete account and all transactions)
- Soft delete with restore option

**FR-ACCT-005**: Account Details View
- Overview: Summary stats (value, positions, transactions)
- Holdings: Positions in this account only
- Transactions: Transaction list filtered by account
- Performance: Account-specific returns and gains

**Acceptance Criteria**:
- Create account in < 2 seconds
- Account immediately available for transactions
- Cannot have duplicate account names
- Validation errors are clear

---

## 5. Calculators

### 5.1 Simple Interest Calculator

**Priority**: Must Have (MVP)

**FR-CALC-001**: Simple Interest Calculator
- Input fields:
  - Principal amount ($)
  - Interest rate (% per year)
  - Time period (years)
- Calculation: Interest = Principal × Rate × Time / 100
- Output:
  - Total interest earned
  - Total amount (principal + interest)
- Real-time calculation as user types
- Clear/Reset button

**Acceptance Criteria**:
- Accurate calculations to 2 decimal places
- Handles large numbers (up to $1 billion)
- Input validation (positive numbers only)
- Mobile-friendly interface

---

### 5.2 Compound Interest Calculator

**Priority**: Must Have (MVP)

**FR-CALC-101**: Compound Interest Calculator
- Input fields:
  - Principal amount ($)
  - Interest rate (% per year)
  - Time period (years)
  - Compounding frequency (dropdown: Annually, Semi-Annually, Quarterly, Monthly, Daily)
  - Additional contributions ($ per period, optional)
  - Contribution frequency (dropdown, optional)
- Calculation: A = P(1 + r/n)^(nt)
- Output:
  - Total interest earned
  - Total contributions
  - Final amount
  - Year-by-year breakdown table
  - Growth chart visualization
- Export results to CSV/PDF

**FR-CALC-102**: Visualization
- Line chart showing principal vs total value over time
- Breakdown by principal, contributions, and interest
- Interactive hover tooltips
- Responsive chart

**Acceptance Criteria**:
- Accurate calculations to 2 decimal places
- Chart renders smoothly
- Handles up to 50-year periods
- Mobile-responsive

---

## 6. Settings

### 6.1 User Profile

**Priority**: Must Have (MVP)

**FR-SETTINGS-001**: Profile Management
- Display/edit fields:
  - Display Name
  - Email (read-only, change via email workflow)
  - Default Currency (dropdown)
  - Date Format (dropdown: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  - Number Format (dropdown: 1,234.56 or 1.234,56)
  - Timezone (dropdown)
- Change Password (for email/password users)
- Delete Account (with confirmation)

**FR-SETTINGS-002**: Preferences (MVP)
- Default view settings (dashboard layout)
- Email notifications (on/off for various events)
- Default account for new transactions

**FR-SETTINGS-003**: Tax Lot Tracking (Post-MVP)

**Priority**: Should Have (Post-MVP, Months 5-7)

- **Enable Tax Lot Tracking** (Toggle, opt-in feature):
  - When OFF (Default): Only average cost basis calculated
  - When ON: System calculates and stores individual tax lots (FIFO)
  - **Warning**: "Enabling this feature increases storage and computation. Best for power users who need tax optimization."
  - **Note**: "Your transaction history will be processed to generate tax lots. This may take a few minutes."

- **Tax Lot Display Options** (only shown when tax lot tracking is enabled):
  - Group by holding period (short-term vs long-term)
  - Sort by purchase date, cost basis, or unrealized gain
  - Highlight lots eligible for tax-loss harvesting
  - Show/hide long-term lots (>1 year holding period)
  - Export tax lots to CSV for tax filing

- **Disable Tax Lot Tracking**:
  - Confirmation dialog: "Tax lot data will be preserved but not updated. You can re-enable anytime."
  - User can re-enable later and system resumes from last calculation

---

### 6.2 Subscription Management

**Priority**: Should Have (Post-MVP)

**FR-SETTINGS-101**: Subscription Tier Display
- Show current plan: Free, Pro, Premium (future)
- Show features included in current plan
- Show usage stats (transactions, accounts, API calls)
- Upgrade/Downgrade CTA

**FR-SETTINGS-102**: Plan Upgrade
- Compare plans side-by-side
- Stripe payment integration
- Pro-rated billing
- Invoice history

**FR-SETTINGS-103**: Plan Cancellation
- Downgrade to Free tier
- Export data option before downgrade
- Confirmation workflow
- Feedback form (why canceling?)

---

## 7. Admin Dashboard

### 7.1 Master Stock Database

**Priority**: Must Have (MVP)

**Description**: Admin interface to manage stock ticker symbols.

**FR-ADMIN-001**: Stock Symbol List
- Table view of all symbols in system
- Columns: Symbol, Name, Exchange, Currency, Country, Sector, Industry, Type, Active Status, Last Updated
- Search by symbol, name, or company
- Filter by exchange, currency, country, sector, industry, asset type, active status
- Sort by any column
- Pagination (100 per page)
- Export to CSV option

**FR-ADMIN-002**: Add/Edit Stock Symbol
- Form fields:

  **Basic Information**:
  - Symbol (text, required, e.g., "AAPL")
  - Company Name (text, required, e.g., "Apple Inc.")
  - Exchange (dropdown: NYSE, NASDAQ, TSX, NSE, LSE, etc., required)
  - Currency (dropdown: USD, CAD, EUR, GBP, INR, etc., required)
  - Country (dropdown, required)
  - ISIN (text, optional, e.g., "US0378331005")
  - EODHDCode (text, required, e.g., "AAPL.US")

  **Classification** (for portfolio analytics):
  - Asset Type (dropdown: Common Stock, Preferred Stock, ETF, Mutual Fund, Index, Bond, REIT, ADR, required)
  - Sector (dropdown: Technology, Healthcare, Financial Services, Consumer Cyclical, Consumer Defensive, Industrials, Energy, Utilities, Real Estate, Basic Materials, Communication Services, required for stocks)
  - Industry (dropdown, depends on sector, optional, e.g., "Consumer Electronics", "Biotechnology", "Regional Banks")
  - Industry Group (text, optional, e.g., "Technology Hardware")

  **Additional Metadata**:
  - Market Cap Category (dropdown: Mega Cap, Large Cap, Mid Cap, Small Cap, Micro Cap, optional)
  - Is Dividend Paying (boolean, default: false)
  - Dividend Frequency (dropdown: Monthly, Quarterly, Semi-Annual, Annual, optional)
  - Index Memberships (multi-select: S&P 500, Dow Jones, NASDAQ 100, Russell 2000, etc., optional)

  **Status**:
  - Active (boolean, default: true)
  - Is Delisted (boolean, default: false)
  - Delist Date (date, optional)
  - Delist Reason (text, optional)

  **Data Source**:
  - Last Updated From EODHD (timestamp, auto)
  - Manual Override (boolean, default: false - allows admin to manually maintain data)

- Validate uniqueness: Symbol + Exchange
- Save triggers API test to EODHD to verify symbol exists
- Auto-populate sector/industry from EODHD when available

**FR-ADMIN-003**: Bulk Symbol Import
- Upload CSV with symbol data
- Validate and preview
- Import in background
- Email notification on completion

**FR-ADMIN-004**: Symbol Sync with EODHD
- Fetch symbol list from EODHD API
- Compare with local database
- Identify missing/new symbols
- Bulk update/add symbols
- Schedule daily sync

---

### 7.2 Customer Support

**Priority**: Should Have (Post-MVP)

**FR-ADMIN-101**: Customer Search
- Search by email, userId, or name
- Display user list with key info
- Click to view user details

**FR-ADMIN-102**: User Details View
- Profile information
- Account list and holdings summary
- Transaction count and recent transactions
- Subscription status
- Activity log (logins, actions)

**FR-ADMIN-103**: View User Transactions
- Full transaction table for user
- Same features as user-facing transaction list
- Read-only (admin cannot edit user transactions)
- Export option

**FR-ADMIN-104**: Support Actions
- Send email to user
- Add internal notes to user account
- Reset user password (send reset email)
- View error logs for user
- Manual symbol mapping assistance

---

### 7.3 Master Customer Symbols

**Priority**: Should Have (Post-MVP)

**FR-ADMIN-201**: Customer Symbol Usage
- List all unique symbols used by customers
- Show usage count (how many users have this symbol)
- Identify symbols not in master database
- Bulk add missing symbols to master database

**FR-ADMIN-202**: Symbol Mapping Conflicts
- Identify transactions with ambiguous symbols
- Show user, transaction details, and possible symbols
- Provide interface to suggest correct symbol to user
- Email notification to user for confirmation

---

### 7.4 Manual Price Updates (MVP Development)

**Priority**: Must Have (MVP Development Phase Only)

**Description**: Admin interface to manually update stock prices during development to minimize EODHD API costs and enable use of free data sources.

**FR-ADMIN-301**: Manual Price Update Endpoint

**Purpose**: Temporary development feature to reduce API costs before automated EODHD integration is fully implemented.

**Functional Requirements**:

- **Admin-Only Access**: Secured endpoint accessible only to users with `role: 'admin'` in their user document
- **Update Frequency**: Intended for once-daily manual updates during development
- **Data Format**: Accept price data in CSV or JSON format
- **Endpoint Type**: Cloud Function with HTTP trigger
- **Endpoint URL**: `https://{region}-{project-id}.cloudfunctions.net/updatePricesManual`

**FR-ADMIN-302**: Data Input Format

**CSV Format** (Preferred for bulk updates):
```csv
symbol,date,open,high,low,close,volume,adjustedClose
AAPL.US,2026-01-27,150.00,152.50,149.75,151.80,45678900,151.80
GOOGL.US,2026-01-27,2800.00,2825.00,2790.00,2810.50,1234567,2810.50
MSFT.US,2026-01-27,380.00,385.00,378.50,383.25,23456789,383.25
```

**JSON Format** (Alternative):
```json
{
  "date": "2026-01-27",
  "prices": [
    {
      "symbol": "AAPL.US",
      "open": 150.00,
      "high": 152.50,
      "low": 149.75,
      "close": 151.80,
      "volume": 45678900,
      "adjustedClose": 151.80
    },
    {
      "symbol": "GOOGL.US",
      "open": 2800.00,
      "high": 2825.00,
      "low": 2790.00,
      "close": 2810.50,
      "volume": 1234567,
      "adjustedClose": 2810.50
    }
  ]
}
```

**Required Fields**:
- `symbol` (string, required): EODHD format (e.g., "AAPL.US", "SHOP.TO")
- `date` (string, required): ISO 8601 format (YYYY-MM-DD)
- `close` (number, required): Closing price
- `adjustedClose` (number, optional): Adjusted close (defaults to close if not provided)
- `open`, `high`, `low`, `volume` (optional): Additional market data

**FR-ADMIN-303**: Update Processing Logic

1. **Authentication**:
   - Verify Firebase Auth token in request header
   - Check user role is 'admin' in Firestore users collection
   - Reject unauthorized requests with 403 Forbidden

2. **Validation**:
   - Validate date format (ISO 8601)
   - Validate required fields present
   - Validate numeric values (prices > 0, volume >= 0)
   - Check symbols exist in symbols collection (warn if not found, but allow)
   - Maximum 1,000 symbols per request

3. **Price Storage**:
   - For each symbol, upsert document in `prices` collection:
   ```typescript
   {
     priceId: "{symbol}_{date}",  // e.g., "AAPL.US_2026-01-27"
     symbol: "AAPL.US",
     date: "2026-01-27",
     open: 150.00,
     high: 152.50,
     low: 149.75,
     close: 151.80,
     adjustedClose: 151.80,
     volume: 45678900,
     source: "manual",           // Track that this was manually entered
     updatedAt: timestamp,
     updatedBy: adminUserId,
     ttl: null                   // No TTL for manual entries (don't expire)
   }
   ```

4. **Response**:
   - Return summary:
     - Total symbols processed
     - Successful updates
     - Failed updates (with error details)
     - Warnings (e.g., symbol not found in master database)

**Example Response**:
```json
{
  "success": true,
  "summary": {
    "totalSymbols": 150,
    "successful": 148,
    "failed": 2,
    "warnings": 5
  },
  "errors": [
    {
      "symbol": "INVALID.US",
      "error": "Invalid price value"
    }
  ],
  "warnings": [
    {
      "symbol": "NEWCO.US",
      "warning": "Symbol not found in master database"
    }
  ],
  "processedAt": "2026-01-27T10:30:00Z",
  "processedBy": "admin@example.com"
}
```

**FR-ADMIN-304**: Web Interface (Optional)

**Priority**: Could Have (Nice to have for MVP development)

- Simple admin page in WealthTracker dashboard (admin-only route)
- File upload field (CSV or JSON)
- Date picker (defaults to today)
- "Upload Prices" button
- Progress indicator
- Result display with success/error summary
- Download sample CSV template button

**FR-ADMIN-305**: Security Requirements

- **Authentication**: Firebase Auth required
- **Authorization**: User document must have `role: 'admin'`
- **Rate Limiting**: Max 10 requests per hour per admin user
- **Audit Logging**: Log all manual price updates with:
  - Timestamp
  - Admin user ID and email
  - Number of symbols updated
  - Source file name (if uploaded via UI)
- **CORS**: Restrict to app domain only

**FR-ADMIN-306**: Data Sources for Development

**Free/Low-Cost APIs for Manual Price Collection**:

1. **Yahoo Finance** (via yfinance Python library or web scraping)
   - Free, no API key required
   - EOD prices available
   - Can export to CSV

2. **Alpha Vantage** (Free Tier)
   - 25 requests/day free
   - Export to CSV format

3. **Twelve Data** (Free Tier)
   - 800 requests/day free
   - CSV export available

4. **Manual Entry from Brokerage**
   - Copy prices from broker statements
   - Paste into CSV template

**Workflow During Development**:
1. Developer/admin collects prices from free source (once per day)
2. Formats data as CSV
3. Uploads via manual price update endpoint
4. All portfolio calculations use cached prices
5. No EODHD API calls needed during development

**FR-ADMIN-307**: Transition to Production

**When to Remove This Feature**:
- After MVP launch when EODHD integration is fully automated
- When automated price fetching is implemented (background Cloud Function)
- Estimated: Post-MVP (Month 5+)

**Migration Path**:
- Manual entries marked with `source: 'manual'`
- Automated system can overwrite manual entries
- Keep endpoint available but deprecated
- Remove UI from admin dashboard
- Eventually delete Cloud Function

**FR-ADMIN-308**: Acceptance Criteria

**Functionality**:
- ✅ Admin can upload CSV with 100+ symbols in < 5 seconds
- ✅ Prices immediately available for portfolio calculations
- ✅ Non-admin users receive 403 Forbidden error
- ✅ Invalid data returns clear error messages
- ✅ Duplicate symbol/date combinations update existing record

**Performance**:
- Process 1,000 symbols in < 10 seconds
- Firestore batch writes for efficiency
- No blocking of dashboard during update

**Security**:
- Only admins can access endpoint
- All requests logged to audit trail
- Rate limiting prevents abuse
- CORS configured correctly

**Data Integrity**:
- Prices stored in correct format
- Date validation prevents future dates
- Numeric validation prevents invalid prices
- Manual entries clearly marked with source field

**Usability** (if web interface implemented):
- Clear upload instructions
- Sample CSV template downloadable
- Real-time progress indicator
- Clear success/error messaging
- Mobile-responsive (admin can update from phone)

---

**⚠️ IMPORTANT NOTE**: This is a **temporary development feature**. It will be replaced by automated EODHD price fetching in Post-MVP phase. Do not build complex UI around this feature.

**Development Priority**: Implement early in MVP (Month 1-2) to enable development and testing without incurring EODHD API costs.

---

### 7.5 Feature Flags System

**Priority**: Should Have (Month 4 or Post-MVP Month 5)

**Description**: Admin-controlled feature flags to dynamically enable/disable features without deploying code. Provides flexibility for gradual rollouts, emergency kill switches, beta testing, and A/B testing.

**Use Cases**:
- **Gradual Rollout**: Release features to 10% → 25% → 50% → 100% of users
- **Kill Switch**: Immediately disable problematic features
- **Beta Testing**: Enable experimental features for specific users
- **Maintenance Mode**: Disable writes during maintenance
- **Emergency Response**: Quickly disable resource-intensive features under load

**Feature Flag Types**:

1. **Global Feature Flags**: On/off switches affecting all users
2. **User-Level Feature Flags**: Per-user overrides for beta testing (stored in `users/{userId}/feature_overrides`)
3. **Percentage Rollout Flags**: Enable for X% of users using hash-based consistent rollout (`hash(userId) % 100 < percentage`)
4. **Environment-Based Flags**: Different states for dev/staging/prod

**FR-ADMIN-401**: Feature Flags Dashboard

**Components**:
- List all feature flags with status (enabled/disabled)
- Filter by category (core, experimental, beta, deprecated)
- Search by feature name or flag ID
- Quick toggle switches with confirmation dialogs
- Change history for each flag (who, when, why)

**FR-ADMIN-402**: Toggle Feature Flag

**Workflow**:
1. Admin clicks toggle switch
2. Confirmation dialog: "Enable [Feature]? This will affect X users"
3. Reason input field (required): "Why are you enabling/disabling this?"
4. System updates flag, logs change, invalidates cache
5. All clients receive update via Firestore listener within 5 seconds

**FR-ADMIN-403**: Gradual Rollout Management

**Features**:
- Percentage slider: Enable for X% of users (0-100%)
- User targeting: Hash-based consistent rollout
- Estimated users affected display
- Rollout history and current percentage
- "Increase by 10%" quick action button

**FR-ADMIN-404**: Beta User Management

**Features**:
- Add/remove specific users for beta testing
- User search by email or ID
- Per-user feature overrides
- Expiration dates for beta access (optional)
- Email notification to beta users (optional)

**FR-ADMIN-405**: Emergency Kill Switch

**Features**:
- "Emergency Disable" button (red, prominent)
- Fast confirmation (skip reason for emergencies)
- Instant flag disable (<2 seconds)
- Alert sent to admin team (Slack/email)
- Automatic incident creation in monitoring system

**Complete Feature Flags List**:

**Core Features (MVP)** - Default: Enabled

| Flag ID | Name | Description |
|---------|------|-------------|
| `auth.google_oauth.enabled` | Google OAuth | Enable Google sign-in |
| `auth.email_password.enabled` | Email/Password Auth | Enable email/password sign-in |
| `accounts.create.enabled` | Create Accounts | Enable account creation |
| `accounts.delete.enabled` | Delete Accounts | Enable account deletion |
| `transactions.csv_import.enabled` | CSV Import | Enable bulk CSV import |
| `transactions.delete.enabled` | Delete Transactions | Enable transaction deletion |
| `transactions.export.enabled` | Export Transactions | Enable CSV export |
| `dashboard.enabled` | Dashboard | Enable portfolio dashboard |
| `dashboard.realtime_prices.enabled` | Real-Time Prices | Enable live price updates |
| `calculators.simple_interest.enabled` | Simple Interest Calculator | Enable calculator |
| `calculators.compound_interest.enabled` | Compound Interest Calculator | Enable calculator |
| `admin.symbol_management.enabled` | Symbol Management | Enable admin symbol CRUD |
| `admin.manual_price_updates.enabled` | Manual Price Updates | Enable manual price upload |

**Experimental Features (Post-MVP)** - Default: Disabled

| Flag ID | Name | Description |
|---------|------|-------------|
| `transactions.manual_form.enabled` | Manual Transaction Form | Enable single transaction form |
| `transactions.bulk_edit.enabled` | Bulk Edit | Enable bulk transaction editing |
| `reports.performance.enabled` | Performance Reports | Enable performance analytics |
| `reports.tax.enabled` | Tax Reports | Enable tax lot reporting |
| `api.external_access.enabled` | External API | Enable external API access |
| `integrations.plaid.enabled` | Plaid Integration | Enable Plaid broker sync |
| `notifications.email.enabled` | Email Notifications | Enable email notifications |
| `notifications.push.enabled` | Push Notifications | Enable push notifications (PWA) |

**Emergency/Maintenance Flags** - Default: Varies

| Flag ID | Name | Description | Default |
|---------|------|-------------|---------|
| `system.maintenance_mode.enabled` | Maintenance Mode | Disable writes, show maintenance banner | false |
| `system.read_only_mode.enabled` | Read-Only Mode | Disable all writes | false |
| `performance.rate_limiting.enabled` | Rate Limiting | Enable request rate limiting | true |
| `performance.heavy_operations.enabled` | Heavy Operations | Allow resource-intensive operations | true |

**Client-Side Integration**:

```typescript
// React Hook usage
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function TransactionImportButton() {
  const isCsvImportEnabled = useFeatureFlag('transactions.csv_import.enabled', true);

  if (!isCsvImportEnabled) {
    return null; // Feature disabled, hide button
  }

  return <Button onClick={handleImport}>Import CSV</Button>;
}
```

**Data Model**:

**Firestore Collection**: `feature_flags`

```typescript
interface FeatureFlag {
  flagId: string;                    // e.g., "transactions.csv_import.enabled"
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

**Firestore Subcollection**: `users/{userId}/feature_overrides`

```typescript
interface UserFeatureOverride {
  flagId: string;                    // e.g., "transactions.csv_import.enabled"
  enabled: boolean;                  // Override value
  reason: string;                    // Why this user has override
  grantedBy: string;                 // Admin who granted override
  grantedAt: Timestamp;
  expiresAt: Timestamp | null;       // Optional expiration
}
```

**Acceptance Criteria**:
- ✅ Admin can toggle any feature on/off with reason
- ✅ Changes propagate to all clients within 5 seconds
- ✅ User-level overrides work correctly for beta testing
- ✅ Rollout percentage targeting accurate to ±2%
- ✅ Disabled features completely hidden from UI
- ✅ Emergency kill switch works instantly (<2 seconds)
- ✅ All changes logged with timestamp, admin, and reason
- ✅ Only admins can modify flags
- ✅ Feature flag checks complete in <50ms client-side

**Development Strategy**:
- **Month 2 Week 1**: Set up basic feature flag system and React hook
- **Month 4 Week 2 or Post-MVP Month 5**: Build admin UI for flag management
- **Post-MVP**: Add advanced targeting, analytics, and scheduled changes

---

## 8. Reporting & Analytics

### 8.1 Performance Reports

**Priority**: Should Have (Post-MVP)

**FR-REPORT-001**: Portfolio Performance Summary
- Total return ($ and %)
- Time-weighted return (TWR)
- Money-weighted return (IRR)
- Unrealized gains/losses
- Realized gains/losses
- Time periods: YTD, 1M, 3M, 6M, 1Y, 3Y, 5Y, All Time

**FR-REPORT-002**: Performance vs Benchmark
- Compare portfolio returns to S&P 500, NASDAQ, custom benchmark
- Line chart overlay
- Outperformance/underperformance metrics
- Alpha and Beta calculations

**FR-REPORT-003**: Asset Allocation
- Breakdown by asset class (stocks, bonds, cash, etc.)
- Pie chart and table view
- Historical allocation over time
- Rebalancing suggestions

**FR-REPORT-004**: Sector Allocation
- Breakdown by sector (Technology, Healthcare, Finance, etc.)
- Compare to benchmark sector weights
- Over/under weight analysis

**FR-REPORT-005**: Geographic Allocation
- Breakdown by country/region
- Map visualization
- Currency exposure

---

## 9. Additional Recommended Features

### 9.1 Portfolio Insights (Recommended)

**Priority**: Could Have (Future)

**FR-INSIGHT-001**: Cost Basis Tracking
- Track tax lots (FIFO, LIFO, Specific Identification)
- Show unrealized gains by tax lot
- Identify short-term vs long-term gains
- Tax loss harvesting opportunities

**FR-INSIGHT-002**: Dividend Calendar
- Upcoming ex-dividend dates
- Estimated dividend payments
- Dividend growth trends
- Dividend aristocrats identification

**FR-INSIGHT-003**: Position Alerts
- Price alerts (above/below threshold)
- Position size alerts (exceeds % of portfolio)
- Dividend missed alert
- Unusual activity alerts

---

### 9.2 Data Export & Backup (Recommended)

**Priority**: Should Have (Post-MVP)

**FR-EXPORT-001**: Full Data Export
- Export all user data (transactions, accounts, holdings)
- Formats: CSV, JSON, PDF
- Include all calculated fields
- Scheduled exports (weekly/monthly)
- Email delivery

**FR-EXPORT-002**: Portfolio Snapshots
- Save portfolio snapshot at point in time
- Compare snapshots over time
- Historical holdings view

---

### 9.3 Mobile-First Design & PWA

**Priority**: Must Have (MVP for mobile-first, PWA in Phase 4)

**FR-MOBILE-001**: Mobile-First Responsive Design
- **Design Approach**: Mobile-first (320px+), progressively enhanced for tablet (768px+) and desktop (1024px+)
- **Touch-Optimized**: 44px minimum touch targets, swipe gestures, pull-to-refresh
- **Mobile Navigation**: Bottom navigation bar for thumb-friendly access
- **Simplified Views**: Progressive disclosure (show essentials, hide complexity)
- **Performance**: < 2 seconds page load on 3G connection
- **Viewport**: Proper viewport meta tag, no horizontal scrolling
- **Images**: Responsive images with srcset, lazy loading

**FR-MOBILE-002**: Progressive Web App (PWA) - Phase 4
- **Service Worker**: Offline support and asset caching
- **Web App Manifest**: Installable on home screen (Add to Home Screen)
- **App Shell**: Fast initial load with app shell architecture
- **Offline Mode**: View portfolio and cached data without internet
- **Background Sync**: Queue transactions when offline, sync when online
- **Push Notifications**: Price alerts, dividend payments, portfolio updates (Phase 4+)
- **App-Like Experience**: Standalone display mode, splash screen
- **Update Strategy**: Auto-update when new version available

**FR-MOBILE-003**: Touch Interactions
- **Swipe Gestures**: Swipe to delete transactions, navigate between screens
- **Long Press**: Long press for contextual actions
- **Pull to Refresh**: Native-like pull-to-refresh for data updates
- **Pinch to Zoom**: Chart zoom on mobile
- **Haptic Feedback**: Vibration feedback for actions (optional)

**FR-MOBILE-004**: Mobile-Specific Features (Phase 4+)
- **Bottom Sheet**: Modal actions from bottom (native-like)
- **Floating Action Button**: Quick add transaction
- **Search Overlay**: Full-screen search on mobile
- **Card-Based Layout**: Swipeable cards for transactions/holdings
- **Camera Integration**: Scan receipts/documents (future)

---

### 9.4 Collaboration Features (Future)

**Priority**: Could Have (Future)

**FR-COLLAB-001**: Portfolio Sharing
- Generate shareable link (read-only)
- Password protection option
- Expiration date setting
- View-only access for financial advisors

**FR-COLLAB-002**: Notes & Annotations
- Add notes to transactions, positions, accounts
- Rich text formatting
- Attach files/screenshots
- Timestamp and user tracking

---

## Feature Priority Matrix

### Must Have (MVP Launch - 3-4 months)
1. Authentication (Email + Google OAuth)
2. Dashboard (Holdings, Dividend Summary)
3. Transaction Management (CRUD, all transaction types)
4. Account Management (CRUD)
5. Simple & Compound Interest Calculators
6. User Profile Settings
7. Admin: Stock Symbol Management
8. Mobile Responsive Design

### Should Have (Post-MVP - 3-6 months)
1. Bulk Transaction Import/Export
2. Performance Reports & Analytics
3. Admin: Customer Support Interface
4. Subscription Management
5. Data Export & Backup
6. Advanced Filtering & Search

### Could Have (Future - 6-12 months)
1. Portfolio Insights & Alerts
2. Tax Optimization Tools
3. Benchmark Comparison
4. Portfolio Sharing
5. Mobile Native App
6. API Access

### Won't Have (Not Planned)
1. Automated Broker Integration (Plaid)
2. Live Trading
3. Social/Community Features
4. Cryptocurrency Wallets
5. Loan/Mortgage Calculators

---

## Non-Functional Requirements

### Performance
- Page load time: < 2 seconds (desktop), < 3 seconds (mobile)
- Transaction save: < 1 second
- Dashboard refresh: < 2 seconds
- Bulk import (1,000 rows): < 30 seconds
- Support 10,000+ transactions per user

### Scalability
- Support 10,000 concurrent users
- 100,000 registered users in first year
- 1M+ transactions total in database
- 99.5% uptime SLA

### Security
- HTTPS only (TLS 1.3)
- Firebase Authentication
- Firestore Security Rules
- Data encryption at rest and in transit
- GDPR compliant
- Regular security audits

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader compatible
- High contrast mode
- Font size adjustable

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Unit Testing Requirements

### Testing Strategy Overview

**Philosophy**: Test-driven approach with comprehensive unit test coverage for all business logic, especially calculations involving money, positions, and tax lots.

**Coverage Targets**:
- **Overall**: 80%+ code coverage
- **Business Logic**: 95%+ coverage (calculations, validations, state management)
- **UI Components**: 70%+ coverage (critical user flows)
- **Cloud Functions**: 90%+ coverage (backend logic, API endpoints)

**Testing Tools**:
- **Unit Tests**: Vitest + React Testing Library
- **Component Tests**: React Testing Library + @testing-library/jest-dom
- **Integration Tests**: Firebase Emulators
- **E2E Tests**: Cypress or Playwright (critical user flows only)

---

### 1. Authentication & User Management Tests

**Module**: `src/features/auth/`

#### Test Suite: User Registration (FR-AUTH-001, FR-AUTH-002, FR-AUTH-003)

**Unit Tests**:
```typescript
describe('User Registration', () => {
  describe('Email/Password Registration', () => {
    it('should register user with valid email and password', async () => {
      // Test: Valid email format, password meets requirements
      // Expected: User created, verification email sent
    });

    it('should reject weak passwords', () => {
      // Test: Password < 8 chars, no uppercase, no number
      // Expected: Validation error with specific message
    });

    it('should reject invalid email formats', () => {
      // Test: Email without @, invalid domain
      // Expected: Validation error
    });

    it('should reject duplicate email addresses', async () => {
      // Test: Register with existing email
      // Expected: Error "Email already in use"
    });

    it('should create user profile in Firestore after registration', async () => {
      // Test: After successful registration
      // Expected: User document exists with correct initial fields
    });
  });

  describe('Google OAuth Registration', () => {
    it('should register user via Google OAuth', async () => {
      // Test: Google OAuth flow
      // Expected: User created without email verification
    });

    it('should auto-populate profile from Google', async () => {
      // Test: OAuth response includes name, email, photo
      // Expected: Profile populated with Google data
    });
  });
});
```

**Coverage Requirements**:
- ✅ All validation rules tested
- ✅ Success and error paths covered
- ✅ Firestore user document creation verified
- ✅ Email verification flow tested

---

#### Test Suite: User Authentication (FR-AUTH-101, FR-AUTH-102, FR-AUTH-103, FR-AUTH-104)

**Unit Tests**:
```typescript
describe('User Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials', async () => {
      // Expected: Session token created, user redirected
    });

    it('should reject invalid credentials', async () => {
      // Expected: Error message, no session created
    });

    it('should enforce rate limiting after 5 failed attempts', async () => {
      // Test: 6 consecutive failed logins
      // Expected: 15-minute lockout after 5th failure
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      // Test: Valid email provided
      // Expected: Reset email sent
    });

    it('should reset password with valid token', async () => {
      // Test: Click reset link, enter new password
      // Expected: Password updated, auto-login
    });
  });

  describe('Session Management', () => {
    it('should persist session across browser restarts', () => {
      // Test: Close and reopen browser
      // Expected: User still logged in
    });

    it('should expire session after 30 days of inactivity', async () => {
      // Test: Simulate 30 days inactivity
      // Expected: Session expired, user logged out
    });
  });
});
```

---

### 2. Dashboard & Holdings Tests

**Module**: `src/features/dashboard/`

#### Test Suite: Portfolio Summary (FR-DASH-001 to FR-DASH-005)

**Unit Tests**:
```typescript
describe('Portfolio Summary', () => {
  describe('Holdings Summary Calculation', () => {
    it('should calculate total portfolio value correctly', () => {
      // Test: Multiple holdings across accounts
      // Expected: Sum of all market values accurate to 2 decimals
    });

    it('should calculate unrealized gain/loss correctly', () => {
      // Test: Holdings with gains and losses
      // Expected: (marketValue - costBasis) calculated correctly
    });

    it('should calculate unrealized gain percentage correctly', () => {
      // Test: Various cost basis and market values
      // Expected: ((marketValue - costBasis) / costBasis) * 100
    });

    it('should handle zero cost basis edge case', () => {
      // Test: Position with zero cost basis
      // Expected: No division by zero error, return 0% or N/A
    });
  });

  describe('Currency Grouping', () => {
    it('should group holdings by currency', () => {
      // Test: Holdings in USD, CAD, INR
      // Expected: Grouped totals accurate
    });

    it('should convert to base currency', () => {
      // Test: User base currency USD, holdings in CAD
      // Expected: Conversion rate applied correctly
    });
  });

  describe('Account Grouping', () => {
    it('should calculate account-level totals', () => {
      // Test: Holdings across 3 accounts
      // Expected: Each account total accurate
    });
  });
});
```

---

#### Test Suite: Holdings Table (FR-DASH-101 to FR-DASH-105)

**Unit Tests**:
```typescript
describe('Holdings Table', () => {
  describe('Filtering', () => {
    it('should filter holdings by account', () => {
      // Test: Select single account filter
      // Expected: Only holdings from that account displayed
    });

    it('should filter holdings by multiple accounts', () => {
      // Test: Select 2 accounts
      // Expected: Holdings from both accounts displayed
    });

    it('should filter holdings by currency', () => {
      // Expected: Only USD holdings shown
    });
  });

  describe('Sorting', () => {
    it('should sort by market value descending by default', () => {
      // Expected: Largest position first
    });

    it('should sort by any column ascending/descending', () => {
      // Test: Click column header twice
      // Expected: Sort order toggles
    });
  });

  describe('Pagination', () => {
    it('should paginate holdings correctly', () => {
      // Test: 100 holdings, 25 per page
      // Expected: 4 pages, correct holdings on each page
    });
  });
});
```

---

### 3. Transaction Management Tests

**Module**: `src/features/transactions/`

#### Test Suite: Transaction CRUD (FR-TRANS-001 to FR-TRANS-006)

**Unit Tests**:
```typescript
describe('Transaction Creation', () => {
  describe('Buy Transaction', () => {
    it('should create buy transaction with valid data', async () => {
      // Test: All required fields provided
      // Expected: Transaction saved to Firestore
    });

    it('should calculate total amount correctly', () => {
      // Test: quantity=100, unitPrice=150.50, fees=5, commission=9.99
      // Expected: totalAmount = 15050 + 5 + 9.99 = 15064.99
    });

    it('should validate quantity is positive', () => {
      // Test: quantity = 0 or negative
      // Expected: Validation error
    });

    it('should validate unit price is positive', () => {
      // Test: unitPrice = 0 or negative
      // Expected: Validation error
    });
  });

  describe('Sell Transaction', () => {
    it('should create sell transaction', async () => {
      // Expected: Transaction saved
    });

    it('should prevent selling more than owned', async () => {
      // Test: Position has 50 shares, try to sell 60
      // Expected: Validation error
    });

    it('should calculate realized gain correctly', () => {
      // Test: Sell 50 @ $175, cost basis $150
      // Expected: realizedGain = (175 - 150) * 50 = $1,250
    });
  });

  describe('Initial Position Transaction', () => {
    it('should create initial position', async () => {
      // Test: Symbol, quantity, unitPrice, date
      // Expected: Transaction created
    });

    it('should not affect cash balance', () => {
      // Expected: totalAmount set but no cash movement
    });
  });

  describe('Dividend Transaction', () => {
    it('should create dividend transaction', async () => {
      // Test: Symbol, totalAmount (no quantity/price)
      // Expected: Transaction saved
    });

    it('should not require quantity or unit price', () => {
      // Expected: Null values accepted for these fields
    });
  });

  describe('Split Transaction', () => {
    it('should create forward split transaction', async () => {
      // Test: splitRatio = "2:1"
      // Expected: splitRatioMultiplier = 2.0
    });

    it('should create reverse split transaction', async () => {
      // Test: splitRatio = "1:5"
      // Expected: splitRatioMultiplier = 0.2
    });

    it('should parse split ratio correctly', () => {
      // Test: "4:1", "1:10", "3:2"
      // Expected: Correct multipliers calculated
    });
  });
});
```

---

### 4. Position Calculation Logic Tests

**Module**: `src/features/holdings/calculations/`

**CRITICAL**: These tests are the most important for data integrity and accuracy.

#### Test Suite: Position Calculation (FR-TRANS-301)

**Unit Tests**:
```typescript
describe('Position Calculation Engine', () => {
  describe('Initial Position Priority Rule', () => {
    it('should ignore BUY transactions on or before Initial Position date', () => {
      // Test:
      // - BUY 50 @ $100 on Jan 1
      // - BUY 30 @ $110 on Jan 5
      // - INITIAL POSITION 100 @ $105 on Jan 10
      // - BUY 20 @ $108 on Jan 15
      // Expected:
      // - Position: 120 shares
      // - Cost basis: (100 * 105) + (20 * 108) = $12,660
      // - Avg cost: $105.50/share
    });

    it('should include BUY transactions after Initial Position date', () => {
      // Test: Initial Position on Jan 10, BUY on Jan 15
      // Expected: Both included in position
    });

    it('should handle multiple Initial Positions (use most recent)', () => {
      // Test: Initial Position on Jan 1, another on Jan 10
      // Expected: Jan 10 Initial Position used, Jan 1 ignored
    });
  });

  describe('Average Cost Calculation', () => {
    it('should calculate average cost correctly', () => {
      // Test: BUY 100 @ $10, BUY 50 @ $12
      // Expected: avgCost = ($1000 + $600) / 150 = $10.67/share
    });

    it('should include fees and commissions in cost basis', () => {
      // Test: BUY 100 @ $10, fees=$5, commission=$9.99
      // Expected: costBasis = $1014.99, avgCost = $10.15/share
    });

    it('should include MER in cost basis', () => {
      // Test: BUY 100 @ $10, mer=$12.50
      // Expected: costBasis = $1012.50
    });
  });

  describe('FIFO Sell Calculation', () => {
    it('should sell from oldest lot first (FIFO)', () => {
      // Test:
      // - LOT 1: 50 @ $10 on Jan 1
      // - LOT 2: 30 @ $12 on Feb 1
      // - SELL 60 on Mar 1
      // Expected:
      // - Sell all of LOT 1 (50 shares)
      // - Sell 10 from LOT 2
      // - Remaining: LOT 2 with 20 shares
    });

    it('should calculate realized gain correctly', () => {
      // Test: Sell 50 @ $15, cost basis $10/share
      // Expected: realizedGain = (15 - 10) * 50 = $250
    });

    it('should handle partial lot sales', () => {
      // Test: LOT has 100 shares, sell 30
      // Expected: LOT reduced to 70 shares, cost basis adjusted
    });

    it('should subtract fees from realized gain', () => {
      // Test: Realized gain $250, commission $9.99
      // Expected: netRealizedGain = $240.01
    });
  });

  describe('Forward Stock Split', () => {
    it('should multiply quantity and divide cost per share', () => {
      // Test: 100 shares @ $50, 2:1 split
      // Expected:
      // - Quantity: 200 shares
      // - Cost per share: $25
      // - Total cost basis: $5000 (unchanged)
    });

    it('should adjust all tax lots proportionally', () => {
      // Test: LOT 1: 50 @ $50, LOT 2: 50 @ $60, 2:1 split
      // Expected:
      // - LOT 1: 100 @ $25
      // - LOT 2: 100 @ $30
    });
  });

  describe('Reverse Stock Split', () => {
    it('should handle whole shares only', () => {
      // Test: 27 shares, 1:5 split
      // Expected: 5 whole shares (27 / 5 = 5.4, floor to 5)
    });

    it('should calculate cash in lieu for fractional shares', () => {
      // Test:
      // - 27 old shares @ $10, 1:5 split
      // - New share price: $50
      // - 0.4 fractional new shares
      // Expected:
      // - cashInLieu = 0.4 * $50 = $20
    });

    it('should adjust cost basis to exclude fractional shares', () => {
      // Test:
      // - 27 shares @ $10 = $270 cost basis
      // - 1:5 split → 5 new shares
      // - 25 old shares convert (5 * 5 = 25)
      // - 2 old shares paid as cash in lieu
      // Expected:
      // - New cost basis: $250 (not $270!)
      // - Cost per share: $50
    });

    it('should calculate realized gain from cash in lieu', () => {
      // Test:
      // - 2 old shares @ $10 = $20 cost
      // - Cash in lieu: $20
      // Expected: realizedGain = $20 - $20 = $0
    });

    it('should handle fractional cost basis correctly', () => {
      // Test: Edge cases where cost basis doesn't divide evenly
      // Expected: Accurate to 2 decimal places
    });
  });

  describe('Dividend Tracking', () => {
    it('should accumulate dividend income', () => {
      // Test: 3 dividend payments: $24, $24, $26
      // Expected: dividendIncomeToDate = $74
    });

    it('should not affect position quantity or cost basis', () => {
      // Expected: Dividends have no impact on shares or cost
    });
  });

  describe('Position Recalculation', () => {
    it('should recalculate position after transaction edit', async () => {
      // Test: Edit buy quantity from 100 to 150
      // Expected: Position updated immediately
    });

    it('should recalculate position after transaction delete', async () => {
      // Test: Delete a buy transaction
      // Expected: Position quantity and cost basis reduced
    });

    it('should handle complex transaction history', () => {
      // Test: 20 transactions (buys, sells, dividends, splits)
      // Expected: Final position accurate, recalculation < 100ms
    });
  });
});
```

**Edge Cases**:
```typescript
describe('Position Calculation Edge Cases', () => {
  it('should handle zero quantity position', () => {
    // Test: All shares sold
    // Expected: Position quantity = 0, isClosedPosition = true
  });

  it('should handle same-day multiple transactions', () => {
    // Test: Buy and sell on same day
    // Expected: Processed chronologically
  });

  it('should handle transactions entered out of order', () => {
    // Test: Enter Jan 15 transaction before Jan 10
    // Expected: Processed in chronological order by date
  });

  it('should handle very large positions', () => {
    // Test: 1,000,000 shares
    // Expected: No overflow errors, accurate to 2 decimals
  });

  it('should handle very small unit prices', () => {
    // Test: $0.01 per share
    // Expected: Accurate calculations
  });
});
```

**Coverage Requirements**:
- ✅ 95%+ coverage (this is critical business logic)
- ✅ All edge cases tested
- ✅ Performance benchmarks included
- ✅ Accuracy to 2 decimal places verified

---

### 5. Account Management Tests

**Module**: `src/features/accounts/`

#### Test Suite: Account CRUD (FR-ACCT-001 to FR-ACCT-005)

**Unit Tests**:
```typescript
describe('Account Management', () => {
  describe('Create Account', () => {
    it('should create account with valid data', async () => {
      // Expected: Account saved to Firestore
    });

    it('should generate unique accountId', () => {
      // Test: Create 2 accounts
      // Expected: Different IDs
    });

    it('should prevent duplicate account names', () => {
      // Test: Create account with existing name
      // Expected: Validation error
    });
  });

  describe('Delete Account', () => {
    it('should prevent deletion if transactions exist', async () => {
      // Test: Account has 5 transactions
      // Expected: Error message
    });

    it('should allow cascade delete', async () => {
      // Test: Delete account and all transactions
      // Expected: Account and transactions removed
    });
  });
});
```

---

### 6. Calculators Tests

**Module**: `src/features/calculators/`

#### Test Suite: Simple Interest Calculator (FR-CALC-001)

**Unit Tests**:
```typescript
describe('Simple Interest Calculator', () => {
  it('should calculate simple interest correctly', () => {
    // Test: Principal=$1000, rate=5%, time=3 years
    // Formula: Interest = P * R * T / 100
    // Expected: Interest = $150, Total = $1150
  });

  it('should handle zero principal', () => {
    // Expected: Interest = $0
  });

  it('should handle zero rate', () => {
    // Expected: Interest = $0
  });

  it('should calculate accurately to 2 decimal places', () => {
    // Test: Various fractional values
    // Expected: Rounded to 2 decimals
  });
});
```

#### Test Suite: Compound Interest Calculator (FR-CALC-101, FR-CALC-102)

**Unit Tests**:
```typescript
describe('Compound Interest Calculator', () => {
  it('should calculate compound interest correctly', () => {
    // Test: P=$1000, r=5%, t=10 years, compounded annually
    // Formula: A = P(1 + r/n)^(nt)
    // Expected: A = $1628.89
  });

  it('should handle different compounding frequencies', () => {
    // Test: Same values, compounded monthly vs quarterly
    // Expected: Monthly yields slightly more
  });

  it('should include additional contributions', () => {
    // Test: $100/month additional contributions
    // Expected: Total includes principal + contributions + interest
  });

  it('should generate year-by-year breakdown', () => {
    // Test: 10 years
    // Expected: 10 data points with correct values
  });
});
```

---

### 7. Admin Features Tests

**Module**: `src/features/admin/`

#### Test Suite: Stock Symbol Management (FR-ADMIN-001 to FR-ADMIN-004)

**Unit Tests**:
```typescript
describe('Stock Symbol Management', () => {
  describe('Add Symbol', () => {
    it('should add stock symbol with valid data', async () => {
      // Expected: Symbol saved to Firestore
    });

    it('should prevent duplicate symbol+exchange', () => {
      // Test: Add AAPL on NASDAQ twice
      // Expected: Error on second attempt
    });

    it('should validate EODHD code format', () => {
      // Test: "AAPL.US" valid, "AAPL" invalid
      // Expected: Validation error for invalid format
    });
  });

  describe('Bulk Import', () => {
    it('should import 1000 symbols in < 30 seconds', async () => {
      // Test: Upload CSV with 1000 rows
      // Expected: All imported, time < 30s
    });

    it('should validate CSV format', () => {
      // Test: Missing required columns
      // Expected: Validation error with details
    });
  });
});
```

#### Test Suite: Manual Price Updates (FR-ADMIN-301 to FR-ADMIN-308)

**Unit Tests**:
```typescript
describe('Manual Price Updates', () => {
  describe('Authentication & Authorization', () => {
    it('should reject unauthenticated requests', async () => {
      // Test: No auth token
      // Expected: 401 Unauthorized
    });

    it('should reject non-admin users', async () => {
      // Test: Regular user token
      // Expected: 403 Forbidden
    });

    it('should allow admin users', async () => {
      // Test: Admin user token
      // Expected: 200 OK
    });
  });

  describe('CSV Parsing', () => {
    it('should parse valid CSV correctly', () => {
      // Test: CSV with 100 symbols
      // Expected: All 100 parsed correctly
    });

    it('should handle missing optional fields', () => {
      // Test: CSV with only required fields
      // Expected: Optional fields default to null
    });

    it('should validate required fields', () => {
      // Test: CSV missing "close" field
      // Expected: Error for each row
    });
  });

  describe('Price Validation', () => {
    it('should reject negative prices', () => {
      // Test: close = -10
      // Expected: Validation error
    });

    it('should reject zero prices', () => {
      // Test: close = 0
      // Expected: Validation error
    });

    it('should accept positive prices', () => {
      // Test: close = 150.75
      // Expected: Price saved
    });
  });

  describe('Batch Processing', () => {
    it('should process 1000 symbols in < 10 seconds', async () => {
      // Test: Max batch size
      // Expected: All processed quickly
    });

    it('should use Firestore batch writes', async () => {
      // Expected: Batch operations used (not individual writes)
    });

    it('should enforce max 1000 symbols per request', async () => {
      // Test: 1001 symbols
      // Expected: 400 Bad Request
    });
  });

  describe('Audit Logging', () => {
    it('should log all price updates', async () => {
      // Expected: audit_logs collection entry created
    });

    it('should include admin user info in log', async () => {
      // Expected: userId, email, timestamp recorded
    });
  });

  describe('Response Format', () => {
    it('should return summary of results', async () => {
      // Expected: totalSymbols, successful, failed, warnings
    });

    it('should return detailed errors', async () => {
      // Test: 2 invalid symbols in batch
      // Expected: errors array with symbol and error message
    });
  });
});
```

---

### 8. Integration Tests

**Module**: `tests/integration/`

**Firebase Emulator Tests**:
```typescript
describe('Firebase Integration Tests', () => {
  beforeAll(async () => {
    // Start Firebase emulators
  });

  describe('Transaction to Holdings Flow', () => {
    it('should create transaction and update holdings', async () => {
      // Test: Create BUY transaction
      // Expected: Holdings collection updated immediately
    });

    it('should recalculate holdings on transaction edit', async () => {
      // Test: Edit transaction quantity
      // Expected: Holdings recalculated
    });
  });

  describe('Firestore Security Rules', () => {
    it('should prevent users from accessing other users data', async () => {
      // Test: User A tries to read User B's transactions
      // Expected: Permission denied
    });

    it('should allow users to access their own data', async () => {
      // Expected: Read/write allowed
    });

    it('should enforce admin-only access to symbols collection', async () => {
      // Test: Regular user tries to write to symbols
      // Expected: Permission denied
    });
  });

  describe('Cloud Functions', () => {
    it('should trigger holding recalculation on transaction create', async () => {
      // Test: Cloud Function trigger
      // Expected: Holdings updated
    });
  });
});
```

---

### 9. E2E Tests (Critical User Flows Only)

**Module**: `tests/e2e/`

**Cypress/Playwright Tests**:
```typescript
describe('Critical User Flows', () => {
  describe('New User Onboarding', () => {
    it('should complete full registration and first transaction', () => {
      // 1. Sign up with email
      // 2. Verify email
      // 3. Login
      // 4. Create first account
      // 5. Add first transaction
      // 6. View dashboard with position
    });
  });

  describe('Portfolio Management', () => {
    it('should add multiple transactions and view portfolio', () => {
      // 1. Add 3 buy transactions
      // 2. Add 1 dividend
      // 3. View dashboard
      // 4. Verify calculations accurate
    });

    it('should sell position and see realized gain', () => {
      // 1. Buy 100 shares
      // 2. Sell 50 shares
      // 3. Verify realized gain displayed correctly
    });
  });
});
```

---

### 10. Performance Tests

**Module**: `tests/performance/`

```typescript
describe('Performance Benchmarks', () => {
  describe('Position Calculation Performance', () => {
    it('should calculate position with 100 transactions in < 100ms', () => {
      // Test: 100 buy/sell transactions
      // Expected: Calculation completes in < 100ms
    });

    it('should calculate position with 1000 transactions in < 500ms', () => {
      // Test: Large transaction history
      // Expected: Acceptable performance
    });
  });

  describe('Dashboard Load Performance', () => {
    it('should load dashboard with 50 positions in < 2 seconds', () => {
      // Test: 50 holdings
      // Expected: Dashboard renders quickly
    });
  });
});
```

---

### Test Data Requirements

**Mock Data Sets**:
1. **Users**: 10 test users with different profiles
2. **Accounts**: 30 accounts across test users
3. **Symbols**: 100 stock symbols (US, Canada, India)
4. **Transactions**: 500 transactions covering all types
5. **Prices**: Historical price data for 100 symbols (1 year)

**Fixtures**: `tests/fixtures/`
- `users.json` - Test user data
- `accounts.json` - Test accounts
- `symbols.json` - Stock symbols
- `transactions.json` - Sample transactions
- `prices.json` - Price data

---

### Continuous Integration

**GitHub Actions Workflow**:
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

### Coverage Reporting

**Tools**:
- **Istanbul/c8**: Code coverage reporting
- **Codecov**: Coverage visualization and tracking
- **PR Comments**: Automatic coverage reports on pull requests

**Coverage Badges**:
- Display coverage percentage in README
- Fail CI if coverage drops below 80%

---

### Test Execution Strategy

**Local Development**:
```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Run in watch mode (during development)
npm run test:watch

# Run specific test file
npm run test src/features/transactions/calculations.test.ts
```

**Pre-Commit Hook**:
- Run unit tests on changed files
- Ensure new code has tests
- Block commit if tests fail

**Pre-Push Hook**:
- Run full test suite
- Check coverage thresholds
- Block push if tests fail or coverage drops

---

### Testing Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Test names should read like documentation
3. **One Assertion Per Test**: Keep tests focused
4. **Isolated Tests**: No dependencies between tests
5. **Mock External Dependencies**: Firebase, APIs, etc.
6. **Test Edge Cases**: Zero, negative, null, undefined, very large numbers
7. **Performance Benchmarks**: Include timing assertions for critical calculations

---

## Acceptance Criteria Template

For each feature:
1. **Functionality**: Feature works as described
2. **Validation**: All inputs validated, errors handled gracefully
3. **Performance**: Meets performance requirements
4. **UI/UX**: Intuitive, responsive, accessible
5. **Testing**: Unit tests, integration tests pass
6. **Documentation**: User docs and dev docs updated

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-26 | Initial | Initial feature specifications |
