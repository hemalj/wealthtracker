# Updated Transaction Management Section

## This file contains the restructured Transaction Management section for feature-specifications.md
## Copy and paste to replace lines 186-386 in feature-specifications.md

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
| Currency | String | All | ISO 4217 currency code (USD, CAD, EUR, GBP, INR) |
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

(Continue with section 3.4 Position Calculation Logic as currently defined in the file...)
