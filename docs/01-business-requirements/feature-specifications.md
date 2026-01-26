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
- Example: 1:5 split (5 shares become 1)
- Decreases quantity, increases cost basis proportionally
- Ratio format: "1:5" (new:old)
- Adjusts all historical costs

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

**FR-SETTINGS-002**: Preferences
- Default view settings (dashboard layout)
- Email notifications (on/off for various events)
- Default account for new transactions
- Portfolio calculation method (FIFO, LIFO, Avg Cost)

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
- Columns: Symbol, Name, Exchange, Currency, Country, Active Status, Last Updated
- Search by symbol or name
- Filter by exchange, currency, active status
- Pagination (100 per page)

**FR-ADMIN-002**: Add/Edit Stock Symbol
- Form fields:
  - Symbol (text, required)
  - Name (text, required)
  - Exchange (dropdown: NYSE, NASDAQ, TSX, NSE, etc., required)
  - Currency (dropdown, required)
  - Country (dropdown, required)
  - ISIN (text, optional)
  - Active (boolean, default: true)
  - EODHDCode (text, required, e.g., "AAPL.US")
- Validate uniqueness: Symbol + Exchange
- Save triggers API test to EODHD

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

### 9.3 Mobile Responsive (Recommended)

**Priority**: Must Have (MVP)

**FR-MOBILE-001**: Responsive Design
- Optimized layouts for mobile (320px+), tablet (768px+), desktop (1024px+)
- Touch-friendly controls
- Bottom navigation for mobile
- Simplified mobile views (progressive disclosure)

**FR-MOBILE-002**: Progressive Web App (PWA)
- Installable on mobile devices
- Offline viewing of cached data
- Push notifications (price alerts, dividend payments)
- Background sync

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
