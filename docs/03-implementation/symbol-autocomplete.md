# Symbol Autocomplete (Static Data)

## Purpose

Temporary symbol autocomplete for the transaction form using a static JSON file of US and Canadian stock exchange symbols. This will be replaced by live EODHD API integration in Month 4.

## Exchanges Covered

| Name | EODHD Code | OperatingMIC | Country | Currency |
|------|-----------|--------------|---------|----------|
| USA Stocks | US | XNAS, XNYS, OTCM | USA | USD |
| Toronto Exchange | TO | XTSE | Canada | CAD |
| TSX Venture Exchange | V | XTSX | Canada | CAD |
| NEO Exchange | NEO | NEOE | Canada | CAD |

## Data Format

Symbol data is stored in `src/data/symbols.json` using compact keys to minimize file size:

```json
[
  { "c": "AAPL", "n": "Apple Inc", "e": "US", "t": "Common Stock", "cu": "USD" }
]
```

| Key | Description | Example |
|-----|-------------|---------|
| `c` | Ticker code | `AAPL` |
| `n` | Company/security name | `Apple Inc` |
| `e` | Exchange code | `US`, `TO`, `V`, `NEO` |
| `t` | Security type | `Common Stock`, `ETF`, `Fund`, `Preferred Stock` |
| `cu` | Trading currency | `USD`, `CAD` |

## Generating the Data

Run the fetch script with an EODHD API key:

```bash
npx tsx scripts/fetch-symbols.ts YOUR_API_KEY
```

This calls `GET /api/exchange-symbol-list/{CODE}` for all 4 exchanges, filters to keep only Common Stock, ETF, Fund, and Preferred Stock types, and writes the combined result to `src/data/symbols.json`.

### Filtering

The EODHD export includes security types like warrants, bonds, and units that are not relevant for portfolio tracking. The script filters to keep only:

- Common Stock
- ETF
- Fund (mutual funds)
- Preferred Stock

## Architecture

### Lazy Loading

The `symbols.json` file is loaded via dynamic `import()`, which Vite code-splits into a separate chunk. The data is only fetched when the transaction form dialog opens, not on initial page load.

### Module-Level Cache

Once loaded, the symbol data is cached at module scope in `useSymbolSearch.ts`. All subsequent form opens reuse the cached data without re-fetching.

### Search Algorithm

The `useSymbolSearch` hook implements tiered matching:

1. **Exact code match** - typing "AAPL" shows Apple Inc first
2. **Code prefix match** - typing "AA" shows AAPL, AAL, etc.
3. **Name substring match** - typing "Apple" finds "Apple Inc"

Results are capped at 20 items. Early exit optimization stops scanning once enough candidates are found.

### Component

`SymbolAutocomplete` uses MUI Autocomplete in `freeSolo` mode:

- Users can type any symbol, even if not in the static data
- Dropdown shows code (bold), name, and exchange in parentheses
- Selecting from dropdown fills the code value
- Custom filtering is disabled (`filterOptions={(x) => x}`) since the hook handles it

## File Structure

```
scripts/
  fetch-symbols.ts          # One-time EODHD data export script
src/
  data/
    symbols.json            # Static symbol data (generated)
  types/
    symbol.types.ts         # SymbolEntry and SymbolOption interfaces
  hooks/
    useSymbolSearch.ts       # Lazy load + search hook
  components/
    forms/
      SymbolAutocomplete.tsx # MUI Autocomplete wrapper
```

## Currency Auto-Assignment

Transaction currency is automatically determined by the selected symbol's exchange. There is no manual currency selection in the transaction form.

### Exchange-to-Currency Mapping

| Exchange | Currency |
|----------|----------|
| US | USD |
| TO | CAD |
| V | CAD |
| NEO | CAD |

### Implementation

1. `SymbolAutocomplete` passes the symbol's `currency` field (from `symbols.json`) to its `onChange` callback: `onChange(code, currency)`
2. `TransactionForm` receives the currency and calls `setValue('currency', currency)` to update the form's hidden currency field
3. If the user free-types a symbol not in the static data, no currency is passed and the form default (`USD`) is used
4. The currency is stored with the transaction and displayed in the transaction list

### Data Source

The currency value comes from the `cu` field in `symbols.json`, which is sourced from the EODHD `Currency` response field in the exchange symbol list API.

### CSV Bulk Import (Opposite Flow)

In CSV bulk import, currency works in reverse — the user provides currency in the CSV, and it drives exchange determination. This is because the same symbol can exist on multiple exchanges (e.g., SHOP trades on both US and Canadian exchanges). Currency disambiguates: `SHOP` + `CAD` = Canadian exchange, `SHOP` + `USD` = US exchange. See FR-TRANS-203 in feature specifications.

## Migration Path (Month 4)

When implementing the full EODHD integration:

1. Replace `useSymbolSearch` internals to call a Cloud Function that queries the EODHD search API (`GET /api/search/{QUERY}`)
2. The `SymbolAutocomplete` component interface stays unchanged
3. The `symbols` Firestore collection becomes the master data source
4. The static `symbols.json` file can be removed
5. Add debounced API calls with 7-day result caching per the EODHD integration spec
