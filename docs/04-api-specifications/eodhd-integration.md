# EODHD API Integration

## Overview

EODHD (End of Day Historical Data) is our primary stock market data provider. This document covers integration details, caching strategies, error handling, and cost optimization.

**Website**: https://eodhd.com/
**Documentation**: https://eodhd.com/financial-apis/

---

## API Plans & Pricing

### Startup Plan ($20/month) - **Recommended for MVP**
- 100,000 API calls per month
- Real-time data (15-min delay for free exchanges)
- Historical EOD data (20+ years)
- 20 requests per second
- US exchanges: NYSE, NASDAQ, AMEX
- International: Major exchanges worldwide
- Corporate actions (splits, dividends)

### All World Plan ($80/month) - **For Growth**
- 1,000,000 API calls per month
- All Startup features
- More exchanges
- Faster rate limits

### API Limits
- Rate limit: 20 requests/second (Startup)
- Monthly limit: 100K requests (Startup)
- Over-limit: Charges apply or API blocked

---

## Key Endpoints

### 1. Real-Time Data

**Endpoint**: `GET /api/real-time/{SYMBOL}.{EXCHANGE}`

**Purpose**: Get current/latest price for a symbol

**Example**:
```
GET https://eodhd.com/api/real-time/AAPL.US?api_token=YOUR_API_KEY&fmt=json
```

**Response**:
```json
{
  "code": "AAPL.US",
  "timestamp": 1706299200,
  "gmtoffset": 0,
  "open": 183.50,
  "high": 186.20,
  "low": 182.90,
  "close": 185.75,
  "volume": 52341200,
  "previousClose": 184.25,
  "change": 1.50,
  "change_p": 0.81
}
```

**Rate Limit**: 20/second
**Cache Strategy**: 15 minutes during market hours, 24 hours off-hours
**Cost**: 1 API call per request

---

### 2. End of Day (Historical) Data

**Endpoint**: `GET /api/eod/{SYMBOL}.{EXCHANGE}`

**Purpose**: Get historical daily prices

**Parameters**:
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)
- `period`: d (daily), w (weekly), m (monthly)
- `fmt`: json

**Example**:
```
GET https://eodhd.com/api/eod/AAPL.US?from=2025-01-01&to=2026-01-26&api_token=YOUR_API_KEY&fmt=json
```

**Response**:
```json
[
  {
    "date": "2025-01-01",
    "open": 180.50,
    "high": 182.30,
    "low": 179.80,
    "close": 181.25,
    "adjusted_close": 181.25,
    "volume": 45231000
  },
  {
    "date": "2025-01-02",
    "open": 181.50,
    "high": 183.20,
    "low": 180.90,
    "close": 182.75,
    "adjusted_close": 182.75,
    "volume": 48321000
  }
]
```

**Use Cases**:
- Populate historical holdings value
- Performance charts
- Backtesting

**Cache Strategy**: Cache daily data permanently (EOD data doesn't change)
**Cost**: 1 API call for entire date range

---

### 3. Search Symbols

**Endpoint**: `GET /api/search/{QUERY}`

**Purpose**: Search for stock symbols by name or ticker

**Example**:
```
GET https://eodhd.com/api/search/apple?api_token=YOUR_API_KEY
```

**Response**:
```json
[
  {
    "Code": "AAPL",
    "Exchange": "US",
    "Name": "Apple Inc",
    "Type": "Common Stock",
    "Country": "USA",
    "Currency": "USD",
    "ISIN": "US0378331005"
  },
  {
    "Code": "AAPL",
    "Exchange": "XETRA",
    "Name": "Apple Inc",
    "Type": "Common Stock",
    "Country": "Germany",
    "Currency": "EUR",
    "ISIN": "US0378331005"
  }
]
```

**Use Cases**:
- Symbol autocomplete in transaction form
- Symbol validation

**Cache Strategy**: Cache search results for 7 days
**Cost**: 1 API call per search query

---

### 4. Exchange Symbol List

**Endpoint**: `GET /api/exchange-symbol-list/{EXCHANGE}`

**Purpose**: Get all symbols for a specific exchange

**Example**:
```
GET https://eodhd.com/api/exchange-symbol-list/US?api_token=YOUR_API_KEY&fmt=json
```

**Response**:
```json
[
  {
    "Code": "AAPL",
    "Name": "Apple Inc",
    "Country": "USA",
    "Exchange": "US",
    "Currency": "USD",
    "Type": "Common Stock",
    "Isin": "US0378331005"
  },
  ...
]
```

**Use Cases**:
- Build master symbol database
- Weekly sync to update symbol list

**Currency Mapping**: The `Currency` field from the EODHD response is used as the transaction currency when a user selects a symbol. This establishes the exchange-to-currency mapping: US exchange symbols trade in USD, Canadian exchange symbols (TO, V, NEO) trade in CAD.

**Cache Strategy**: Refresh weekly
**Cost**: 1 API call per exchange

---

### 5. Dividends

**Endpoint**: `GET /api/div/{SYMBOL}.{EXCHANGE}`

**Purpose**: Get historical dividend payments

**Example**:
```
GET https://eodhd.com/api/div/AAPL.US?from=2025-01-01&api_token=YOUR_API_KEY&fmt=json
```

**Response**:
```json
[
  {
    "date": "2025-02-15",
    "declarationDate": "2025-01-30",
    "recordDate": "2025-02-10",
    "paymentDate": "2025-02-15",
    "period": "Q1",
    "value": 0.24,
    "unadjustedValue": 0.24,
    "currency": "USD"
  }
]
```

**Use Cases**:
- Validate dividend transactions
- Upcoming dividend calendar (future feature)

**Cache Strategy**: Refresh daily
**Cost**: 1 API call per symbol

---

### 6. Stock Splits

**Endpoint**: `GET /api/splits/{SYMBOL}.{EXCHANGE}`

**Purpose**: Get historical stock split events

**Example**:
```
GET https://eodhd.com/api/splits/AAPL.US?from=2020-01-01&api_token=YOUR_API_KEY&fmt=json
```

**Response**:
```json
[
  {
    "date": "2020-08-31",
    "split": "4/1"
  }
]
```

**Use Cases**:
- Validate split transactions
- Auto-suggest split transactions when detected

**Cache Strategy**: Refresh weekly
**Cost**: 1 API call per symbol

---

## Integration Architecture

### Cloud Function: Stock Data Proxy

**Purpose**: Centralize EODHD API calls, implement caching, rate limiting

**Function**: `getStockData(action, params)`

**Actions**:
- `realtime`: Get current price
- `eod`: Get historical prices
- `search`: Search symbols
- `exchange`: Get exchange symbol list
- `dividends`: Get dividend history
- `splits`: Get split history

**Example Function** (TypeScript):
```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import axios from 'axios';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const EODHD_API_KEY = process.env.EODHD_API_KEY;
const EODHD_BASE_URL = 'https://eodhd.com/api';

export const getStockData = onCall(async (request) => {
  const { action, symbol, exchange, params } = request.data;

  // Authentication check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Rate limiting check (user-level)
  const userId = request.auth.uid;
  const rateLimitExceeded = await checkRateLimit(userId);
  if (rateLimitExceeded) {
    throw new HttpsError('resource-exhausted', 'API rate limit exceeded');
  }

  try {
    let data;

    switch (action) {
      case 'realtime':
        data = await getRealtime(symbol, exchange);
        break;
      case 'search':
        data = await searchSymbols(params.query);
        break;
      case 'eod':
        data = await getEOD(symbol, exchange, params.from, params.to);
        break;
      default:
        throw new HttpsError('invalid-argument', 'Invalid action');
    }

    // Track API usage
    await trackUsage(userId);

    return { success: true, data };
  } catch (error) {
    console.error('EODHD API Error:', error);
    throw new HttpsError('internal', 'Failed to fetch stock data');
  }
});

async function getRealtime(symbol: string, exchange: string) {
  const db = getFirestore();
  const cacheKey = `${symbol}_${exchange}_${getTodayDate()}`;
  const cacheRef = db.collection('prices').doc(cacheKey);

  // Check cache
  const cached = await cacheRef.get();
  if (cached.exists && !isCacheExpired(cached.data()!.cachedAt, 15)) {
    console.log('Cache hit for', cacheKey);
    return cached.data();
  }

  // Fetch from EODHD
  const url = `${EODHD_BASE_URL}/real-time/${symbol}.${exchange}`;
  const response = await axios.get(url, {
    params: { api_token: EODHD_API_KEY, fmt: 'json' },
  });

  const data = response.data;

  // Cache result
  await cacheRef.set({
    ...data,
    cachedAt: FieldValue.serverTimestamp(),
    ttl: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return data;
}

async function searchSymbols(query: string) {
  // Check cache
  const db = getFirestore();
  const cacheKey = `search_${query.toLowerCase()}`;
  const cacheRef = db.collection('symbolSearchCache').doc(cacheKey);

  const cached = await cacheRef.get();
  if (cached.exists) {
    return cached.data()!.results;
  }

  // Fetch from EODHD
  const url = `${EODHD_BASE_URL}/search/${query}`;
  const response = await axios.get(url, {
    params: { api_token: EODHD_API_KEY },
  });

  const results = response.data;

  // Cache for 7 days
  await cacheRef.set({
    results,
    cachedAt: FieldValue.serverTimestamp(),
    ttl: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  return results;
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);
  const user = await userRef.get();

  const apiCallsThisMonth = user.data()?.usage?.apiCallsThisMonth || 0;
  const tier = user.data()?.subscriptionTier || 'free';

  const limits = {
    free: 1000,    // 1K/month for free users
    pro: 10000,    // 10K/month for pro users
    premium: 50000 // 50K/month for premium users
  };

  return apiCallsThisMonth >= limits[tier];
}

async function trackUsage(userId: string) {
  const db = getFirestore();
  const userRef = db.collection('users').doc(userId);

  await userRef.update({
    'usage.apiCallsThisMonth': FieldValue.increment(1),
  });
}

function isCacheExpired(cachedAt: any, minutesTTL: number): boolean {
  const now = Date.now();
  const cacheTime = cachedAt.toMillis();
  const ttl = minutesTTL * 60 * 1000;
  return now - cacheTime > ttl;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
```

---

## Caching Strategy

### Real-Time Prices

**Cache Duration**:
- Market hours (9:30 AM - 4:00 PM ET): 15 minutes
- After hours / weekends: 24 hours

**Cache Key**: `{symbol}_{exchange}_{date}`

**Firestore Collection**: `prices`

**Benefits**:
- Reduce API calls by 80%+
- Faster response times
- Lower costs

---

### Symbol Search

**Cache Duration**: 7 days

**Cache Key**: `search_{query}`

**Firestore Collection**: `symbolSearchCache`

**Benefits**:
- Instant autocomplete
- Minimal API usage

---

### Historical Data (EOD)

**Cache Duration**: Permanent (historical data doesn't change)

**Cache Key**: `{symbol}_{exchange}_{date}`

**Firestore Collection**: `prices`

**Benefits**:
- No repeated API calls for same date
- Fast chart rendering

---

### Exchange Symbol Lists

**Cache Duration**: 7 days

**Firestore Collection**: `symbols`

**Sync Schedule**: Weekly (Cloud Scheduler)

**Benefits**:
- Up-to-date symbol database
- Minimal API usage (1 call per exchange per week)

---

## Rate Limiting

### EODHD Rate Limits
- 20 requests/second
- 100K requests/month (Startup plan)

### Application Rate Limits

**Per-User Limits** (enforced in Cloud Function):
- Free tier: 1,000 API calls/month
- Pro tier: 10,000 API calls/month
- Premium tier: 50,000 API calls/month

**Implementation**:
- Track `usage.apiCallsThisMonth` in user document
- Reset monthly via Cloud Scheduler
- Return 429 error when limit exceeded

**User-Facing**:
- Display API usage in Settings page
- Show warning at 80% usage
- Upgrade prompt at 100%

---

## Error Handling

### EODHD API Errors

**401 Unauthorized**: Invalid API key
- Log error
- Alert admin
- Return generic error to user

**404 Not Found**: Symbol not found
- Cache result (don't retry)
- Suggest alternatives to user
- Allow manual entry

**429 Rate Limit**: Too many requests
- Exponential backoff
- Queue request for retry
- Notify user of delay

**500 Server Error**: EODHD downtime
- Retry 3 times with backoff
- Fallback to cached data
- Alert admin if persistent

**Timeout**: Request timeout (10 seconds)
- Retry once
- Return cached data if available
- Show "Data may be stale" warning

---

### Client-Side Error Handling

```typescript
import { httpsCallable } from 'firebase/functions';

async function fetchStockPrice(symbol: string, exchange: string) {
  try {
    const getStockData = httpsCallable(functions, 'getStockData');
    const result = await getStockData({
      action: 'realtime',
      symbol,
      exchange,
    });

    return result.data;
  } catch (error: any) {
    if (error.code === 'unauthenticated') {
      // Redirect to login
      throw new Error('Please log in to view stock data');
    } else if (error.code === 'resource-exhausted') {
      // Show upgrade prompt
      throw new Error('API limit reached. Please upgrade to continue.');
    } else if (error.code === 'not-found') {
      // Symbol not found
      throw new Error(`Symbol ${symbol} not found on ${exchange}`);
    } else {
      // Generic error
      throw new Error('Failed to fetch stock data. Please try again.');
    }
  }
}
```

---

## Cost Optimization

### Strategies

**1. Aggressive Caching**
- Cache real-time prices for 15 minutes
- Cache historical data permanently
- Cache search results for 7 days
- **Savings**: 80-90% reduction in API calls

**2. Batch Requests**
- Update all portfolio holdings in single scheduled job
- Avoid per-user real-time updates during market hours
- **Savings**: From 10K users × 10 holdings × 26 updates/day = 2.6M calls/month down to 1K symbols × 26 updates/day = 26K calls/month

**3. On-Demand vs Scheduled Updates**
- Scheduled: Update prices for all active symbols every 15 minutes (Cloud Scheduler)
- On-Demand: Only fetch price when user views dashboard
- **Recommendation**: Scheduled for active users, on-demand for occasional users

**4. Tier-Based Limits**
- Free users: Manual refresh only (no background updates)
- Pro users: 15-minute auto-refresh
- Premium users: Real-time updates
- **Savings**: Reduce API calls for free users

**5. Symbol Deduplication**
- Track unique symbols across all users (`usageCount` in symbols collection)
- Only update prices for symbols in active portfolios
- **Savings**: Don't update prices for delisted or unused symbols

---

### Projected API Usage

**MVP (100 users, 10 holdings each)**:
- Unique symbols: ~500
- Price updates: 500 × 26/day × 30 days = 390K calls/month
- Search queries: 100 users × 10 searches = 1K calls/month
- **Total**: ~391K calls/month → Need All World Plan ($80/mo)

**Optimized (with caching)**:
- Price updates: 500 symbols × 1/day (EOD only) = 15K calls/month
- Scheduled refresh: 500 × 4/day (market hours) = 60K calls/month
- Search queries: Cached, ~200 calls/month
- **Total**: ~75K calls/month → Startup Plan ($20/mo) ✅

---

## Scheduled Jobs (Cloud Scheduler)

### Daily Price Update

**Schedule**: Every day at 5:00 PM ET (after market close)

**Function**: `updateDailyPrices`

**Process**:
1. Query all unique symbols from `holdings` collection
2. For each symbol, fetch EOD data from EODHD
3. Store in `prices` collection
4. Trigger portfolio recalculation for affected users

**Estimated Calls**: ~1K symbols = 1K API calls/day = 30K/month

---

### Weekly Symbol Sync

**Schedule**: Every Sunday at 2:00 AM ET

**Function**: `syncSymbols`

**Process**:
1. For each supported exchange (US, TSX, NSE, etc.)
2. Fetch complete symbol list from EODHD
3. Compare with local `symbols` collection
4. Add new symbols, mark delisted symbols
5. Update symbol metadata

**Estimated Calls**: ~10 exchanges = 10 API calls/week = 40/month

---

### Monthly Usage Reset

**Schedule**: 1st of every month at 12:00 AM ET

**Function**: `resetMonthlyUsage`

**Process**:
1. Query all users
2. Reset `usage.apiCallsThisMonth` to 0
3. Send usage summary email to users (optional)

**Estimated Calls**: 0 (no EODHD calls)

---

## Fallback Strategies

### If EODHD is Down

**Option 1**: Fallback to Alpha Vantage
- Free tier: 25 API calls/day (not viable)
- Paid tier: $50/month for 1,200 calls/day

**Option 2**: Fallback to IEX Cloud
- Free tier: 50K credits/month (~5K quotes)
- Paid tier: $9/month for 500K messages

**Option 3**: Manual Price Entry
- Allow users to manually enter latest price
- Show "Manual Price" indicator
- Revert to API when available

**Option 4**: Freeze Prices
- Use last known price (with stale data warning)
- Display "Last updated: X hours ago"
- Retry API every hour

**Recommendation**: Implement Option 3 (manual entry) for MVP, add Option 2 (IEX fallback) post-MVP

---

## Testing EODHD Integration

### Unit Tests

```typescript
import { getRealtime, searchSymbols } from './eodhd';

describe('EODHD Integration', () => {
  it('should fetch real-time price', async () => {
    const data = await getRealtime('AAPL', 'US');

    expect(data).toHaveProperty('close');
    expect(data.code).toBe('AAPL.US');
  });

  it('should search symbols', async () => {
    const results = await searchSymbols('Apple');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('Code');
    expect(results[0]).toHaveProperty('Name');
  });

  it('should handle symbol not found', async () => {
    await expect(getRealtime('INVALID', 'US')).rejects.toThrow('Symbol not found');
  });
});
```

---

### Integration Tests (Firebase Emulator)

```typescript
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { getFunctions, httpsCallable } from 'firebase/functions';

describe('getStockData Cloud Function', () => {
  it('should fetch real-time data', async () => {
    const testEnv = await initializeTestEnvironment({...});
    const functions = getFunctions(testEnv.getApp());
    const getStockData = httpsCallable(functions, 'getStockData');

    const result = await getStockData({
      action: 'realtime',
      symbol: 'AAPL',
      exchange: 'US',
    });

    expect(result.data.success).toBe(true);
    expect(result.data.data).toHaveProperty('close');
  });
});
```

---

## Security Considerations

**1. API Key Protection**
- Store EODHD API key in Cloud Functions environment variables
- Never expose key to client-side code
- Rotate key quarterly

**2. Rate Limiting**
- Implement user-level rate limits
- Prevent abuse by single user

**3. Input Validation**
- Validate symbol format (alphanumeric, max 10 chars)
- Sanitize search queries (prevent injection)

**4. Access Control**
- Only authenticated users can call stock data functions
- Admin-only functions for symbol sync

---

## Monitoring & Alerts

### Metrics to Track

**API Usage**:
- Total EODHD API calls per day/month
- Calls by endpoint (realtime, search, etc.)
- Cache hit rate
- API errors and failures

**Performance**:
- Response time (p50, p95, p99)
- Cache lookup time
- Cloud Function execution time

**Costs**:
- EODHD monthly bill
- Firebase Functions costs
- Firestore read/write costs

### Alerts

**API Limit Warning**: 80% of monthly limit reached
**API Limit Exceeded**: 100% of monthly limit reached
**High Error Rate**: >5% of API calls failing
**EODHD Downtime**: Multiple consecutive failures

**Alert Channels**: Email, Slack, PagerDuty

---

## Summary

EODHD integration is critical for WealthTracker. Key takeaways:

1. **Use Startup Plan ($20/mo)** for MVP, upgrade to All World if needed
2. **Implement aggressive caching** to reduce API calls by 80%+
3. **Proxy all API calls through Cloud Functions** for security and rate limiting
4. **Schedule daily price updates** instead of real-time for cost efficiency
5. **Monitor API usage closely** to avoid unexpected costs
6. **Implement fallback strategies** for API downtime

**Next**: See [internal-api-design.md](internal-api-design.md) for other Cloud Functions
