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

### 3.1 Transaction CRUD

**Priority**: Must Have (MVP)

**Description**: Create, read, update, delete investment transactions.

**FR-TRANS-001**: Create Transaction
- Form fields:
  - Date (date picker, required)
  - Account (dropdown, required)
  - Symbol (autocomplete search, required)
  - Transaction Type (dropdown: Initial Position, Buy, Sell, Dividend, Split - Forward, Split - Reverse, required)
  - Quantity (number, required for Buy/Sell/Initial/Split)
  - Unit Price (number, required for Buy/Sell/Initial)
  - Total Amount (calculated or manual for Dividend, required)
  - Currency (dropdown, required)
  - Fees (number, optional, other transaction fees)
  - Commission (number, optional, trading commission in dollars)
  - MER (number, optional, Management Expense Ratio deduction in dollars, typically for mutual funds/ETFs)
  - Notes (text area, optional)
  - Split Ratio (for splits, e.g., "2:1", required for splits)

**FR-TRANS-002**: Transaction Type Logic

**Initial Position**:
- Used when starting to track existing holdings
- Requires: Symbol, Quantity, Unit Price (avg cost), Date, Account
- Creates position without affecting cash balance

**Buy Transaction**:
- Increases position quantity
- Records cost basis
- Total = Quantity × Unit Price (+ fees if added)
- Updates portfolio value

**Sell Transaction**:
- Decreases position quantity
- Calculates realized gain/loss (FIFO method)
- Total = Quantity × Unit Price (- fees if added)
- Updates portfolio value

**Dividend Transaction**:
- Records dividend income
- No quantity or unit price required
- Total Amount is the dividend received
- Links to symbol position
- Tracks dividend history

**Split Transaction - Forward**:
- Example: 2:1 split (each share becomes 2)
- Increases quantity, decreases cost basis proportionally
- Ratio format: "2:1" (new:old)
- Adjusts all historical costs

**Split Transaction - Reverse**:
- Example: 1:5 split (5 old shares become 1 new share)
- Decreases quantity, increases cost per share proportionally
- Ratio format: "1:5" (new:old)
- **Fractional Share Handling**: Only whole shares are recorded; fractional portions are paid as cash in lieu
- **Cost Basis Adjustment**: Cost basis only includes the shares that convert to whole shares
  - Example: 27 shares at $10 avg cost = $270 → becomes 5 shares at $50 avg cost = $250
  - The 2 old shares ($20 cost basis) that don't convert to whole shares are treated as a disposal
- **Cash in Lieu Calculation**: Fractional new shares × market price at split date
- Cash in lieu is treated as a sale of the fractional portion
- Realized gain/loss = cash received - cost basis of fractional portion

**FR-TRANS-003**: Symbol Autocomplete
- Search symbols as user types (min 1 char)
- Query EODHD API or local symbol database
- Display: Symbol, Name, Exchange, Currency
- Disambiguate duplicate symbols by exchange (e.g., SHOP.US vs SHOP.TO)
- Allow manual symbol entry if not found

**FR-TRANS-004**: Update Transaction
- User can edit any transaction
- System recalculates affected positions and gains
- Audit trail of changes (who, what, when)
- Confirmation dialog before saving

**FR-TRANS-005**: Delete Transaction
- User can delete any transaction
- Confirmation dialog with impact warning
- System recalculates affected positions
- Soft delete (mark as deleted, don't remove)
- Admin can restore deleted transactions

**FR-TRANS-006**: Transaction Validation
- Date cannot be in future
- Quantity > 0 for Buy/Sell/Initial
- Unit Price > 0 for Buy/Sell/Initial
- Total Amount > 0 for Dividend
- Sell quantity cannot exceed position quantity (after FIFO)
- Required fields must be filled

**Acceptance Criteria**:
- Transaction saved in < 1 second
- Portfolio updated immediately
- Error messages clear and actionable
- Form validates on submit and shows field-level errors
- User can save and add another transaction

---

### 3.2 Transaction List & Search

**Priority**: Must Have (MVP)

**FR-TRANS-101**: Transaction Table
- Columns: Date, Account, Symbol, Type, Quantity, Unit Price, Total, Currency, Actions
- Default sort: Date descending (most recent first)
- Color coding by transaction type
- Action buttons: Edit, Delete, Duplicate

**FR-TRANS-102**: Search & Filters
- Search by symbol (partial match)
- Filter by account (multi-select dropdown)
- Filter by transaction type (multi-select)
- Filter by date range (from/to date pickers)
- Filter by currency
- "Clear all filters" button

**FR-TRANS-103**: Sorting
- Sort by any column
- Multi-column sort (hold Shift)
- Visual indicator of active sort
- Persist sort preferences

**FR-TRANS-104**: Pagination
- 50 transactions per page (default)
- Options: 25, 50, 100, 500, All
- Virtual scrolling for "All" option
- Page navigation controls

**FR-TRANS-105**: Bulk Actions
- Select multiple transactions (checkboxes)
- Bulk delete with confirmation
- Bulk export to CSV
- Select all on page / Select all matching filter

---

### 3.3 Bulk Transaction Operations

**Priority**: Should Have (Post-MVP)

**FR-TRANS-201**: Bulk Upload (CSV Import)
- User uploads CSV file (max 10MB, 10,000 rows)
- System validates format and data
- Preview screen shows parsed transactions
- User maps CSV columns to system fields
- System detects symbols and prompts for disambiguation
- User reviews and confirms import
- System processes in background for large files
- Email notification on completion
- Error report for failed rows

**FR-TRANS-202**: CSV Import Template
- Download template button
- Pre-defined columns with examples
- Support for standard broker formats (Fidelity, Schwab, etc.)
- Instructions and field descriptions

**FR-TRANS-203**: Symbol Disambiguation in Bulk
- System detects duplicate symbols (e.g., SHOP in US/CA)
- User provides mapping: Symbol + Currency → Exchange
- System saves mapping for future imports
- Apply mapping to all matching rows

**FR-TRANS-204**: Bulk Edit
- Select multiple transactions
- Edit common fields (account, date, notes)
- Preview changes before applying
- Confirmation dialog
- Undo option for 5 minutes after

**FR-TRANS-205**: Bulk Export
- Export filtered transactions to CSV
- Include all fields
- Option to include calculated fields (gain/loss, cost basis)
- Format compatible with re-import

**Acceptance Criteria**:
- Import 1,000 transactions in < 30 seconds
- Clear error messages for invalid data
- No data loss during import
- User can cancel import in progress
- Rollback option if issues discovered

---

### 3.4 Position Calculation Logic

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

**Step 2: Initialize Position**
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

**Step 3: Process Each Transaction Chronologically**

**Initial Position Transaction**:
```typescript
// Creates opening position
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
