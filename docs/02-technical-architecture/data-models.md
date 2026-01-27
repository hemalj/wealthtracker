# Data Models & Schema

## Overview

This document defines the Firestore database schema, including collections, document structures, indexes, and relationships.

## Firestore Design Principles

1. **Denormalization**: Duplicate data to optimize read performance
2. **Flat Structure**: Avoid deep nesting (use root collections)
3. **Composite Indexes**: Create indexes for common query patterns
4. **Scalability**: Design for millions of documents
5. **Security**: Structure data to enable simple security rules

---

## Collections Overview

```
firestore
├── users
│   └── {userId}
├── accounts
│   └── {accountId}
├── transactions
│   └── {transactionId}
├── holdings
│   └── {holdingId}
├── symbols
│   └── {symbolId}
├── prices
│   └── {priceId}
├── portfolioSnapshots
│   └── {snapshotId}
└── admin
    ├── customerSymbols
    │   └── {customerSymbolId}
    └── systemConfig
        └── {configId}
```

---

## 1. Users Collection

**Collection Path**: `/users/{userId}`

**Purpose**: Store user profile and preferences

### Document Structure

```typescript
interface User {
  // Identity
  userId: string;                    // Firebase Auth UID
  email: string;
  displayName: string | null;
  photoURL: string | null;

  // Authentication
  authProvider: 'email' | 'google';
  emailVerified: boolean;

  // Subscription
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStartDate: Timestamp | null;
  subscriptionEndDate: Timestamp | null;

  // Preferences
  preferences: {
    baseCurrency: string;            // Default: 'USD'
    dateFormat: string;              // 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
    numberFormat: string;            // '1,234.56' | '1.234,56'
    timezone: string;                // 'America/New_York'
    defaultAccountId: string | null;
    costBasisMethod: 'FIFO' | 'LIFO' | 'AvgCost';
    enableEmailNotifications: boolean;
    enablePriceAlerts: boolean;
  };

  // Usage tracking
  usage: {
    accountCount: number;
    transactionCount: number;
    apiCallsThisMonth: number;
    storageUsedMB: number;
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;

  // Admin
  role: 'user' | 'admin';
  isActive: boolean;
}
```

### Example Document

```json
{
  "userId": "abc123xyz",
  "email": "sarah@example.com",
  "displayName": "Sarah Chen",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "authProvider": "google",
  "emailVerified": true,
  "subscriptionTier": "free",
  "subscriptionStatus": "active",
  "stripeCustomerId": null,
  "stripeSubscriptionId": null,
  "subscriptionStartDate": null,
  "subscriptionEndDate": null,
  "preferences": {
    "baseCurrency": "USD",
    "dateFormat": "MM/DD/YYYY",
    "numberFormat": "1,234.56",
    "timezone": "America/New_York",
    "defaultAccountId": null,
    "costBasisMethod": "FIFO",
    "enableEmailNotifications": true,
    "enablePriceAlerts": false
  },
  "usage": {
    "accountCount": 2,
    "transactionCount": 145,
    "apiCallsThisMonth": 23,
    "storageUsedMB": 0.5
  },
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-26T14:20:00Z",
  "lastLoginAt": "2026-01-26T14:20:00Z",
  "role": "user",
  "isActive": true
}
```

### Indexes

```javascript
// Composite index for admin user search
users: [userId ASC, email ASC]
users: [subscriptionTier ASC, createdAt DESC]
users: [isActive ASC, lastLoginAt DESC]
```

---

## 2. Accounts Collection

**Collection Path**: `/accounts/{accountId}`

**Purpose**: Store investment account information

### Document Structure

```typescript
interface Account {
  // Identity
  accountId: string;                 // Auto-generated
  userId: string;                    // Owner reference

  // Account details
  accountName: string;               // "Fidelity Taxable"
  accountNumber: string | null;      // "X1234-5678" (optional, masked)
  accountType: 'taxable' | 'traditional_ira' | 'roth_ira' | '401k' | '403b' | 'sep_ira' | 'simple_ira' | 'other';
  broker: string | null;             // "Fidelity Investments"

  // Settings
  baseCurrency: string;              // "USD"

  // Calculated fields (updated by Cloud Functions)
  summary: {
    positionCount: number;           // Number of holdings
    totalValue: number;              // Current market value
    totalCostBasis: number;          // Total cost basis
    unrealizedGain: number;          // totalValue - totalCostBasis
    unrealizedGainPercent: number;   // (unrealizedGain / totalCostBasis) * 100
    cashBalance: number;             // Cash on hand (future feature)
  };

  // Metadata
  notes: string | null;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Example Document

```json
{
  "accountId": "acc_001",
  "userId": "abc123xyz",
  "accountName": "Fidelity Taxable Brokerage",
  "accountNumber": "X1234-5678",
  "accountType": "taxable",
  "broker": "Fidelity Investments",
  "baseCurrency": "USD",
  "summary": {
    "positionCount": 12,
    "totalValue": 125340.50,
    "totalCostBasis": 98500.00,
    "unrealizedGain": 26840.50,
    "unrealizedGainPercent": 27.25,
    "cashBalance": 1500.00
  },
  "notes": "Primary brokerage account",
  "isActive": true,
  "createdAt": "2026-01-15T10:35:00Z",
  "updatedAt": "2026-01-26T14:30:00Z"
}
```

### Indexes

```javascript
// Query user's accounts
accounts: [userId ASC, accountName ASC]
accounts: [userId ASC, createdAt DESC]
accounts: [userId ASC, accountType ASC]
```

---

## 3. Transactions Collection

**Collection Path**: `/transactions/{transactionId}`

**Purpose**: Store all investment transactions

### Document Structure

```typescript
interface Transaction {
  // Identity
  transactionId: string;             // Auto-generated
  userId: string;
  accountId: string;

  // Transaction details
  transactionType: 'initial_position' | 'buy' | 'sell' | 'dividend' | 'split_forward' | 'split_reverse';
  date: Timestamp;                   // Transaction date

  // Security details
  symbol: string;                    // "AAPL"
  symbolId: string | null;           // Reference to symbols collection
  symbolName: string;                // "Apple Inc."
  exchange: string;                  // "NASDAQ"
  currency: string;                  // "USD"

  // Transaction amounts
  quantity: number | null;           // 100 (null for dividends)
  unitPrice: number | null;          // 150.50 (null for dividends)
  totalAmount: number;               // 15050.00 (quantity * unitPrice, or dividend amount)
  fees: number;                      // 0.00 (commissions, optional)

  // Split details (only for split transactions)
  splitRatio: string | null;         // "2:1" (new:old) for forward, "1:5" for reverse
  splitRatioMultiplier: number | null; // 2.0 for 2:1, 0.2 for 1:5
  cashInLieu: number | null;         // Cash paid for fractional shares (reverse splits only)

  // Calculated fields (for sells)
  costBasis: number | null;          // Original cost of sold shares (FIFO)
  realizedGain: number | null;       // totalAmount - costBasis
  realizedGainPercent: number | null;

  // Tax lots (for sells, references which buy transactions were closed)
  taxLots: Array<{
    buyTransactionId: string;
    quantity: number;
    costBasis: number;
    gain: number;
    holdingPeriod: 'short' | 'long';  // < 1 year or >= 1 year
  }> | null;

  // Metadata
  notes: string | null;
  isDeleted: boolean;
  deletedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;                 // userId (for admin edits)
}
```

### Example Documents

**Buy Transaction**:
```json
{
  "transactionId": "txn_001",
  "userId": "abc123xyz",
  "accountId": "acc_001",
  "transactionType": "buy",
  "date": "2025-10-15T09:30:00Z",
  "symbol": "AAPL",
  "symbolId": "sym_aapl_nasdaq",
  "symbolName": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "quantity": 100,
  "unitPrice": 150.50,
  "totalAmount": 15050.00,
  "fees": 0.00,
  "splitRatio": null,
  "splitRatioMultiplier": null,
  "costBasis": null,
  "realizedGain": null,
  "realizedGainPercent": null,
  "taxLots": null,
  "notes": "Bought during dip",
  "isDeleted": false,
  "deletedAt": null,
  "createdAt": "2025-10-15T10:00:00Z",
  "updatedAt": "2025-10-15T10:00:00Z",
  "createdBy": "abc123xyz"
}
```

**Sell Transaction** (with tax lots):
```json
{
  "transactionId": "txn_050",
  "userId": "abc123xyz",
  "accountId": "acc_001",
  "transactionType": "sell",
  "date": "2026-01-20T14:00:00Z",
  "symbol": "AAPL",
  "symbolId": "sym_aapl_nasdaq",
  "symbolName": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "quantity": 50,
  "unitPrice": 175.25,
  "totalAmount": 8762.50,
  "fees": 0.00,
  "splitRatio": null,
  "splitRatioMultiplier": null,
  "costBasis": 7525.00,
  "realizedGain": 1237.50,
  "realizedGainPercent": 16.44,
  "taxLots": [
    {
      "buyTransactionId": "txn_001",
      "quantity": 50,
      "costBasis": 7525.00,
      "gain": 1237.50,
      "holdingPeriod": "short"
    }
  ],
  "notes": "Sold half position for rebalancing",
  "isDeleted": false,
  "deletedAt": null,
  "createdAt": "2026-01-20T14:30:00Z",
  "updatedAt": "2026-01-20T14:30:00Z",
  "createdBy": "abc123xyz"
}
```

**Dividend Transaction**:
```json
{
  "transactionId": "txn_025",
  "userId": "abc123xyz",
  "accountId": "acc_001",
  "transactionType": "dividend",
  "date": "2025-11-15T00:00:00Z",
  "symbol": "AAPL",
  "symbolId": "sym_aapl_nasdaq",
  "symbolName": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "quantity": null,
  "unitPrice": null,
  "totalAmount": 24.00,
  "fees": 0.00,
  "splitRatio": null,
  "splitRatioMultiplier": null,
  "costBasis": null,
  "realizedGain": null,
  "realizedGainPercent": null,
  "taxLots": null,
  "notes": "Quarterly dividend",
  "isDeleted": false,
  "deletedAt": null,
  "createdAt": "2025-11-15T08:00:00Z",
  "updatedAt": "2025-11-15T08:00:00Z",
  "createdBy": "abc123xyz"
}
```

**Split Transaction**:
```json
{
  "transactionId": "txn_030",
  "userId": "abc123xyz",
  "accountId": "acc_001",
  "transactionType": "split_forward",
  "date": "2025-08-01T00:00:00Z",
  "symbol": "AAPL",
  "symbolId": "sym_aapl_nasdaq",
  "symbolName": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "quantity": null,
  "unitPrice": null,
  "totalAmount": 0.00,
  "fees": 0.00,
  "splitRatio": "4:1",
  "splitRatioMultiplier": 4.0,
  "cashInLieu": null,
  "costBasis": null,
  "realizedGain": null,
  "realizedGainPercent": null,
  "taxLots": null,
  "notes": "4-for-1 stock split",
  "isDeleted": false,
  "deletedAt": null,
  "createdAt": "2025-08-01T09:00:00Z",
  "updatedAt": "2025-08-01T09:00:00Z",
  "createdBy": "abc123xyz"
}
```

**Reverse Split Transaction**:
```json
{
  "transactionId": "txn_031",
  "userId": "abc123xyz",
  "accountId": "acc_001",
  "transactionType": "split_reverse",
  "date": "2026-02-15T00:00:00Z",
  "symbol": "TSLA",
  "symbolId": "sym_tsla_nasdaq",
  "symbolName": "Tesla Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "quantity": null,
  "unitPrice": null,
  "totalAmount": 0.00,
  "fees": 0.00,
  "splitRatio": "1:5",
  "splitRatioMultiplier": 0.2,
  "cashInLieu": 84.50,
  "costBasis": null,
  "realizedGain": null,
  "realizedGainPercent": null,
  "taxLots": null,
  "notes": "1-for-5 reverse split. Had 127 shares, received 25 whole shares. 2 fractional shares paid as cash in lieu at $42.25/share = $84.50",
  "isDeleted": false,
  "deletedAt": null,
  "createdAt": "2026-02-15T09:00:00Z",
  "updatedAt": "2026-02-15T09:00:00Z",
  "createdBy": "abc123xyz"
}
```

### Indexes

```javascript
// Query user's transactions
transactions: [userId ASC, date DESC]
transactions: [userId ASC, accountId ASC, date DESC]
transactions: [userId ASC, symbol ASC, date DESC]
transactions: [userId ASC, transactionType ASC, date DESC]

// Query by symbol for portfolio calculation
transactions: [userId ASC, accountId ASC, symbol ASC, date ASC]

// Admin queries
transactions: [symbolId ASC, date DESC]
transactions: [createdBy ASC, createdAt DESC]
```

---

## 4. Holdings Collection

**Collection Path**: `/holdings/{holdingId}`

**Purpose**: Current portfolio positions (calculated from transactions)

**Calculation Method**: Holdings are computed in real-time from transaction history using FIFO (First-In-First-Out) cost basis accounting. This collection serves as a **denormalized cache** for performance. Recalculation is triggered by transaction changes, price updates, or scheduled reconciliation jobs.

**Detailed Calculation Logic**: See [Feature Specifications - Section 3.4: Position Calculation Logic](../01-business-requirements/feature-specifications.md#34-position-calculation-logic) for the complete algorithm including:
- FIFO tax lot tracking
- Stock split adjustments (forward/reverse with cash in lieu)
- Realized vs unrealized gain calculations
- Dividend income tracking

### Document Structure

```typescript
interface Holding {
  // Identity
  holdingId: string;                 // Composite: userId_accountId_symbolId
  userId: string;
  accountId: string;

  // Security
  symbol: string;
  symbolId: string;
  symbolName: string;
  exchange: string;
  currency: string;

  // Position
  quantity: number;                  // Current shares owned
  costBasis: number;                 // Total cost basis (adjusted for splits)
  avgCostPerShare: number;           // costBasis / quantity

  // Current value
  currentPrice: number;              // Latest price from EODHD
  priceAsOf: Timestamp;              // When price was last updated
  marketValue: number;               // quantity * currentPrice

  // Gains
  unrealizedGain: number;            // marketValue - costBasis
  unrealizedGainPercent: number;     // (unrealizedGain / costBasis) * 100

  // Performance
  totalReturn: number;               // Including realized + unrealized + dividends
  totalReturnPercent: number;
  realizedGainToDate: number;        // Sum of realized gains from past sells
  dividendIncomeToDate: number;      // Sum of dividends received

  // Metadata
  firstPurchaseDate: Timestamp;      // Date of first buy
  lastTransactionDate: Timestamp;    // Date of most recent transaction
  updatedAt: Timestamp;              // Last recalculation
}
```

### Example Document

```json
{
  "holdingId": "abc123xyz_acc_001_sym_aapl_nasdaq",
  "userId": "abc123xyz",
  "accountId": "acc_001",
  "symbol": "AAPL",
  "symbolId": "sym_aapl_nasdaq",
  "symbolName": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "quantity": 50,
  "costBasis": 7525.00,
  "avgCostPerShare": 150.50,
  "currentPrice": 185.75,
  "priceAsOf": "2026-01-26T16:00:00Z",
  "marketValue": 9287.50,
  "unrealizedGain": 1762.50,
  "unrealizedGainPercent": 23.42,
  "totalReturn": 2999.50,
  "totalReturnPercent": 39.87,
  "realizedGainToDate": 1237.50,
  "dividendIncomeToDate": 48.00,
  "firstPurchaseDate": "2025-10-15T09:30:00Z",
  "lastTransactionDate": "2026-01-20T14:00:00Z",
  "updatedAt": "2026-01-26T16:05:00Z"
}
```

### Indexes

```javascript
holdings: [userId ASC, accountId ASC]
holdings: [userId ASC, marketValue DESC]
holdings: [userId ASC, unrealizedGainPercent DESC]
holdings: [userId ASC, symbol ASC]
```

---

## 5. Symbols Collection (Master Database)

**Collection Path**: `/symbols/{symbolId}`

**Purpose**: Master stock ticker database

### Document Structure

```typescript
interface Symbol {
  // Identity
  symbolId: string;                  // Composite: symbol_exchange (e.g., "aapl_nasdaq")
  symbol: string;                    // "AAPL"
  name: string;                      // "Apple Inc."

  // Exchange
  exchange: string;                  // "NASDAQ"
  exchangeShortName: string;         // "NASDAQ"
  country: string;                   // "US"
  currency: string;                  // "USD"

  // EODHD integration
  eodhd: {
    code: string;                    // "AAPL.US"
    type: string;                    // "Common Stock"
    isin: string | null;             // "US0378331005"
  };

  // Classification (for portfolio analytics and filtering)
  assetType: 'common_stock' | 'preferred_stock' | 'etf' | 'mutual_fund' | 'index' | 'bond' | 'reit' | 'adr' | 'other';
  sector: string | null;             // "Technology", "Healthcare", "Financial Services", etc.
  industry: string | null;           // "Consumer Electronics", "Biotechnology", "Regional Banks", etc.
  industryGroup: string | null;      // "Technology Hardware", "Pharmaceuticals", etc.

  // Market characteristics
  marketCap: {
    category: 'mega_cap' | 'large_cap' | 'mid_cap' | 'small_cap' | 'micro_cap' | 'nano_cap' | null;
    value: number | null;            // Market cap in USD (updated from EODHD)
    asOf: Timestamp | null;          // When market cap was last updated
  };

  // Dividend information
  dividend: {
    isDividendPaying: boolean;
    frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'irregular' | null;
    yield: number | null;            // Current dividend yield (%)
    lastDividendDate: Timestamp | null;
    lastDividendAmount: number | null;
  };

  // Index memberships (for benchmarking and filtering)
  indexMemberships: string[];        // ["SP500", "DOW30", "NASDAQ100", "RUSSELL2000", etc.]

  // Additional metadata (from EODHD or manual entry)
  description: string | null;        // Company description
  website: string | null;            // Company website
  ceo: string | null;                // CEO name
  employees: number | null;          // Number of employees
  founded: number | null;            // Year founded
  headquarters: string | null;       // "Cupertino, CA, USA"

  // Status
  isActive: boolean;
  isDelisted: boolean;
  delistDate: Timestamp | null;
  delistReason: string | null;

  // Usage stats
  usageCount: number;                // How many users have this symbol

  // Data management
  manualOverride: boolean;           // If true, don't auto-update from EODHD
  dataSource: 'eodhd' | 'manual' | 'hybrid';
  dataQuality: 'complete' | 'partial' | 'minimal';  // Data completeness indicator

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSyncedAt: Timestamp | null;    // Last sync from EODHD
  lastSyncedBy: string | null;       // 'system' or userId if manual
}
```

### Example Document

```json
{
  "symbolId": "aapl_nasdaq",
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ",
  "exchangeShortName": "NASDAQ",
  "country": "US",
  "currency": "USD",
  "eodhd": {
    "code": "AAPL.US",
    "type": "Common Stock",
    "isin": "US0378331005"
  },
  "assetType": "common_stock",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "industryGroup": "Technology Hardware",
  "marketCap": {
    "category": "mega_cap",
    "value": 2800000000000,
    "asOf": "2026-01-26T16:00:00Z"
  },
  "dividend": {
    "isDividendPaying": true,
    "frequency": "quarterly",
    "yield": 0.52,
    "lastDividendDate": "2026-01-15T00:00:00Z",
    "lastDividendAmount": 0.24
  },
  "indexMemberships": ["SP500", "DOW30", "NASDAQ100"],
  "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
  "website": "https://www.apple.com",
  "ceo": "Tim Cook",
  "employees": 164000,
  "founded": 1976,
  "headquarters": "Cupertino, CA, USA",
  "isActive": true,
  "isDelisted": false,
  "delistDate": null,
  "delistReason": null,
  "usageCount": 523,
  "manualOverride": false,
  "dataSource": "eodhd",
  "dataQuality": "complete",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-26T00:00:00Z",
  "lastSyncedAt": "2026-01-26T00:00:00Z",
  "lastSyncedBy": "system"
}
```

### Indexes

```javascript
// Basic lookups
symbols: [symbol ASC, exchange ASC]
symbols: [exchange ASC, isActive ASC]
symbols: [country ASC, isActive ASC]
symbols: [usageCount DESC]

// Analytics and filtering
symbols: [sector ASC, industry ASC]
symbols: [sector ASC, isActive ASC]
symbols: [assetType ASC, sector ASC]
symbols: [marketCap.category ASC]
symbols: [dividend.isDividendPaying ASC, dividend.yield DESC]

// Full-text search (requires Algolia or Elasticsearch extension)
symbols: [name ASC]
```

---

## 6. Prices Collection (Price Cache)

**Collection Path**: `/prices/{priceId}`

**Purpose**: Cache stock prices to reduce EODHD API calls

### Document Structure

```typescript
interface Price {
  // Identity
  priceId: string;                   // Composite: symbolId_date (e.g., "aapl_nasdaq_2026-01-26")
  symbolId: string;
  symbol: string;
  exchange: string;

  // Price data
  date: Timestamp;                   // Date of price (for EOD) or timestamp (for real-time)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;             // Adjusted for splits/dividends

  // Metadata
  priceType: 'real_time' | 'end_of_day';
  source: 'eodhd' | 'manual';
  createdAt: Timestamp;
  ttl: Timestamp;                    // Time-to-live (for cache expiration)
}
```

### Example Document

```json
{
  "priceId": "aapl_nasdaq_2026-01-26",
  "symbolId": "aapl_nasdaq",
  "symbol": "AAPL",
  "exchange": "NASDAQ",
  "date": "2026-01-26T16:00:00Z",
  "open": 183.50,
  "high": 186.20,
  "low": 182.90,
  "close": 185.75,
  "volume": 52341200,
  "adjustedClose": 185.75,
  "priceType": "end_of_day",
  "source": "eodhd",
  "createdAt": "2026-01-26T20:05:00Z",
  "ttl": "2026-01-27T20:05:00Z"
}
```

### Indexes

```javascript
prices: [symbolId ASC, date DESC]
prices: [ttl ASC] // For automatic expiration
```

---

## 7. Portfolio Snapshots Collection

**Collection Path**: `/portfolioSnapshots/{snapshotId}`

**Purpose**: Historical portfolio snapshots for performance tracking

### Document Structure

```typescript
interface PortfolioSnapshot {
  // Identity
  snapshotId: string;                // Composite: userId_date
  userId: string;

  // Snapshot date
  date: Timestamp;

  // Portfolio totals
  totalValue: number;
  totalCostBasis: number;
  totalUnrealizedGain: number;
  totalUnrealizedGainPercent: number;
  totalRealizedGain: number;
  totalDividendIncome: number;
  cashBalance: number;

  // Performance
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;

  // Allocation (top-level summary)
  allocationByAssetType: Record<string, number>;
  allocationBySector: Record<string, number>;
  allocationByCurrency: Record<string, number>;
  allocationByAccount: Record<string, { accountId: string; accountName: string; value: number }>;

  // Holdings snapshot
  holdings: Array<{
    symbol: string;
    symbolName: string;
    quantity: number;
    costBasis: number;
    marketValue: number;
    unrealizedGain: number;
    weight: number;          // % of portfolio
  }>;

  // Metadata
  createdAt: Timestamp;
}
```

### Example Document

```json
{
  "snapshotId": "abc123xyz_2026-01-26",
  "userId": "abc123xyz",
  "date": "2026-01-26T00:00:00Z",
  "totalValue": 125340.50,
  "totalCostBasis": 98500.00,
  "totalUnrealizedGain": 26840.50,
  "totalUnrealizedGainPercent": 27.25,
  "totalRealizedGain": 3200.00,
  "totalDividendIncome": 1450.00,
  "cashBalance": 1500.00,
  "dayChange": 1250.00,
  "dayChangePercent": 1.01,
  "totalReturn": 31490.50,
  "totalReturnPercent": 31.97,
  "allocationByAssetType": {
    "stock": 95340.50,
    "etf": 28500.00,
    "cash": 1500.00
  },
  "allocationBySector": {
    "Technology": 45200.00,
    "Healthcare": 25300.00,
    "Finance": 18000.00,
    "Consumer": 35340.50
  },
  "allocationByCurrency": {
    "USD": 120340.50,
    "CAD": 5000.00
  },
  "allocationByAccount": {
    "acc_001": {
      "accountId": "acc_001",
      "accountName": "Fidelity Taxable",
      "value": 85340.50
    },
    "acc_002": {
      "accountId": "acc_002",
      "accountName": "Vanguard IRA",
      "value": 40000.00
    }
  },
  "holdings": [
    {
      "symbol": "AAPL",
      "symbolName": "Apple Inc.",
      "quantity": 50,
      "costBasis": 7525.00,
      "marketValue": 9287.50,
      "unrealizedGain": 1762.50,
      "weight": 7.41
    }
  ],
  "createdAt": "2026-01-26T20:00:00Z"
}
```

### Indexes

```javascript
portfolioSnapshots: [userId ASC, date DESC]
```

---

## 8. Admin Collections

### 8.1 Customer Symbols Collection

**Collection Path**: `/admin/customerSymbols/{customerSymbolId}`

**Purpose**: Track all unique symbols used by customers (for admin analysis)

```typescript
interface CustomerSymbol {
  customerSymbolId: string;          // Auto-generated
  symbol: string;
  exchange: string | null;           // May be unknown
  currency: string | null;

  // Usage
  userCount: number;                 // How many users have this symbol
  transactionCount: number;          // Total transactions across all users
  firstUsedAt: Timestamp;
  lastUsedAt: Timestamp;

  // Status
  isMapped: boolean;                 // Mapped to symbols collection?
  symbolId: string | null;           // Reference to symbols collection
  needsReview: boolean;              // Flagged for admin review

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 8.2 System Config Collection

**Collection Path**: `/admin/systemConfig/{configId}`

**Purpose**: System-wide configuration and feature flags

```typescript
interface SystemConfig {
  configId: string;                  // e.g., "feature_flags", "api_keys"

  // Feature flags
  features?: {
    bulkImportEnabled: boolean;
    performanceReportsEnabled: boolean;
    subscriptionsEnabled: boolean;
  };

  // API limits
  limits?: {
    freeAccountMaxTransactions: number;
    proAccountMaxTransactions: number;
    maxUploadSizeMB: number;
  };

  // Maintenance
  maintenanceMode?: boolean;
  maintenanceMessage?: string;

  // Metadata
  updatedAt: Timestamp;
  updatedBy: string;
}
```

---

## Data Relationships

### User → Accounts → Transactions → Holdings

```
User (abc123xyz)
  ├── Account 1 (Fidelity)
  │     ├── Transaction 1 (Buy AAPL)
  │     ├── Transaction 2 (Dividend AAPL)
  │     └── Transaction 3 (Sell AAPL)
  │           └── Holding 1 (AAPL) ← Calculated from transactions
  │
  └── Account 2 (Vanguard IRA)
        ├── Transaction 4 (Buy VTI)
        └── Transaction 5 (Dividend VTI)
              └── Holding 2 (VTI)
```

### Symbol → Transactions

```
Symbol (AAPL)
  ├── Used by User 1 (Transaction 1, 2, 3)
  ├── Used by User 2 (Transaction 10, 11)
  └── Used by User 3 (Transaction 25)
```

---

## Data Denormalization Strategy

### Why Denormalize?

Firestore charges per document read. Denormalization reduces reads by duplicating data.

### What to Denormalize

**Include in Transactions**:
- Symbol name (avoid reading symbols collection)
- Account name (optional, for display)
- User email (for admin view)

**Include in Holdings**:
- Current price (avoid reading prices collection every time)
- Symbol name and exchange

**Include in Accounts**:
- Summary stats (positionCount, totalValue) to avoid querying holdings

### What NOT to Denormalize

- User preferences (changes infrequently, ok to read separately)
- Large arrays (keep holdings array in holdings collection, not in account document)

---

## Calculated Fields Strategy

### Holdings Calculation

**Triggered by**: onTransactionCreate, onTransactionUpdate, onTransactionDelete

**Process**:
1. Query all transactions for (userId, accountId, symbol)
2. Process chronologically:
   - Initial Position: Set quantity and cost basis
   - Buy: Add quantity, increase cost basis
   - Sell: Remove quantity (FIFO), calculate realized gain
   - Dividend: Add to dividendIncomeToDate
   - Split: Adjust quantity and cost basis
3. Fetch current price from prices collection or EODHD
4. Calculate market value, unrealized gain, etc.
5. Upsert holding document

**Performance**: O(T log T) where T = transaction count for symbol
- Cache results to avoid recalculation
- Only recalculate affected symbols

---

## Data Consistency

### Atomic Operations

Use Firestore transactions for operations that must be atomic:

**Example: Delete Account**
```typescript
await db.runTransaction(async (transaction) => {
  // 1. Read account
  const account = await transaction.get(accountRef);

  // 2. Check if transactions exist
  const txCount = account.data().transactionCount;
  if (txCount > 0) {
    throw new Error('Cannot delete account with transactions');
  }

  // 3. Delete account
  transaction.delete(accountRef);

  // 4. Update user.usage.accountCount
  transaction.update(userRef, {
    'usage.accountCount': FieldValue.increment(-1)
  });
});
```

---

## Data Migration Strategy

### Schema Changes

Since Firestore is schemaless, most changes are non-breaking:

**Adding a field**: New field is optional, old docs don't have it
- Handle gracefully in code: `const value = doc.data().newField ?? defaultValue;`

**Renaming a field**: Write a migration Cloud Function
```typescript
const users = await db.collection('users').get();
const batch = db.batch();

users.forEach(doc => {
  batch.update(doc.ref, {
    newFieldName: doc.data().oldFieldName,
    oldFieldName: FieldValue.delete()
  });
});

await batch.commit();
```

**Changing data type**: Write transformation function, run in batches

---

## Firestore Security Rules

See [security-architecture.md](../05-security-deployment/security-architecture.md) for detailed security rules.

**Key Principles**:
- Users can only read/write their own data (`request.auth.uid == resource.data.userId`)
- Admin role required for symbols, admin collections
- Validate data schema on write
- Prevent unauthorized deletes

---

## Indexing Strategy

### Automatic Indexes

Firestore automatically indexes:
- Each field individually
- Combinations of a single field with document name

### Composite Indexes (Manual)

Create composite indexes for:
- Multi-field queries (e.g., userId + symbol + date)
- Range queries + sort (e.g., userId + date > X ORDER BY date)
- Array-contains queries

**Create via Firebase Console or firestore.indexes.json**:
```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "accountId", "order": "ASCENDING" },
        { "fieldPath": "symbol", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Data Retention & Archival

### Active Data

- Keep all data in Firestore while user is active
- No automatic deletion

### Deleted Users

- Grace period: 30 days after account deletion request
- Soft delete: Mark `isDeleted: true`, `deletedAt: Timestamp`
- Hard delete: Cloud Function runs daily to permanently delete after 30 days

### Archival (Future)

- Export old data (> 5 years) to BigQuery for analytics
- Keep in Firestore with `isArchived: true` flag
- Exclude archived data from default queries

---

## Testing Data Models

### Unit Tests

Test data transformations and calculations:

```typescript
describe('calculateHolding', () => {
  it('should calculate holding correctly with buy and sell transactions', () => {
    const transactions = [
      { type: 'buy', quantity: 100, unitPrice: 10, date: '2025-01-01' },
      { type: 'sell', quantity: 50, unitPrice: 15, date: '2025-02-01' },
    ];

    const holding = calculateHolding(transactions, currentPrice: 20);

    expect(holding.quantity).toBe(50);
    expect(holding.costBasis).toBe(500);
    expect(holding.marketValue).toBe(1000);
    expect(holding.unrealizedGain).toBe(500);
  });
});
```

### Integration Tests (Firestore Emulator)

Test Firestore operations:

```typescript
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Data Operations', () => {
  it('should create transaction and update holding', async () => {
    const testEnv = await initializeTestEnvironment({...});
    const db = testEnv.authenticatedContext('userId').firestore();

    // Create transaction
    await db.collection('transactions').add({...});

    // Verify holding created
    const holding = await db.collection('holdings').doc('holdingId').get();
    expect(holding.exists).toBe(true);
  });
});
```

---

## Summary

This data model provides:
- **Scalability**: Flat structure, indexed queries
- **Performance**: Denormalized data, calculated fields cached
- **Consistency**: Transactions for atomic operations
- **Flexibility**: Schemaless, easy to evolve
- **Security**: Role-based access control via Security Rules

**Next**: See [Firebase Integration](firebase-integration.md) for implementation details.
