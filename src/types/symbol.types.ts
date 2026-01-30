/**
 * Static symbol data types for autocomplete.
 *
 * Compact format used in src/data/symbols.json to minimize file size.
 * Will be replaced by live EODHD API integration in Month 4.
 */

/** Raw entry from the static symbols.json file (compact keys for file size) */
export interface SymbolEntry {
  /** Ticker code, e.g. "AAPL" */
  c: string
  /** Company/security name, e.g. "Apple Inc" */
  n: string
  /** Exchange code: "US" | "TO" | "V" | "NEO" */
  e: string
  /** Security type, e.g. "Common Stock", "ETF", "Fund" */
  t: string
  /** Trading currency, e.g. "USD", "CAD" */
  cu: string
}

/** Display-friendly symbol used in the Autocomplete UI */
export interface SymbolOption {
  code: string
  name: string
  exchange: string
  type: string
  currency: string
  /** Display label, e.g. "AAPL - Apple Inc (US)" */
  label: string
}
