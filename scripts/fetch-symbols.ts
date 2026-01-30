/**
 * Fetch stock symbols from EODHD API for US and Canadian exchanges.
 *
 * Usage: npx tsx scripts/fetch-symbols.ts YOUR_API_KEY
 *
 * Exchanges fetched:
 *   US  - USA Stocks (NYSE, NASDAQ, OTC)
 *   TO  - Toronto Exchange (TSX)
 *   V   - TSX Venture Exchange
 *   NEO - NEO Exchange
 *
 * Output: src/data/symbols.json (compact format for autocomplete)
 */

import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface EODHDSymbol {
  Code: string
  Name: string
  Country: string
  Exchange: string
  Currency: string
  Type: string
  Isin?: string
}

interface CompactSymbol {
  c: string  // code
  n: string  // name
  e: string  // exchange
  t: string  // type
  cu: string // currency
}

const EXCHANGES = ['US', 'TO', 'V', 'NEO']

const ALLOWED_TYPES = new Set([
  'Common Stock',
  'ETF',
  'Fund',
  'Preferred Stock',
])

async function fetchExchange(exchange: string, apiKey: string): Promise<EODHDSymbol[]> {
  const url = `https://eodhd.com/api/exchange-symbol-list/${exchange}?api_token=${apiKey}&fmt=json`
  console.log(`Fetching ${exchange}...`)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${exchange}: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as EODHDSymbol[]
  console.log(`  ${exchange}: ${data.length} total symbols`)
  return data
}

function transform(symbols: EODHDSymbol[], exchange: string): CompactSymbol[] {
  return symbols
    //  .filter((s) => ALLOWED_TYPES.has(s.Type))
    // .filter((s) => s.Code && s.Name)
    .map((s) => ({
      c: s.Code,
      n: s.Name,
      e: exchange,
      t: s.Type,
      cu: s.Currency,
    }))
}

async function main() {
  const apiKey = process.argv[2]
  if (!apiKey) {
    console.error('Usage: npx tsx scripts/fetch-symbols.ts YOUR_API_KEY')
    process.exit(1)
  }

  const allSymbols: CompactSymbol[] = []

  for (const exchange of EXCHANGES) {
    const raw = await fetchExchange(exchange, apiKey)
    const filtered = transform(raw, exchange)
    console.log(`  ${exchange}: ${filtered.length} after filtering (kept: Common Stock, ETF, Fund, Preferred Stock)`)
    allSymbols.push(...filtered)
  }

  // Sort by code for consistent ordering
  allSymbols.sort((a, b) => a.c.localeCompare(b.c))


  const outputPath = join(__dirname, '..', 'src', 'data', 'symbols.json')
  writeFileSync(outputPath, JSON.stringify(allSymbols))

  const fileSizeKB = (Buffer.byteLength(JSON.stringify(allSymbols)) / 1024).toFixed(0)
  console.log(`\nDone! Wrote ${allSymbols.length} symbols to src/data/symbols.json (${fileSizeKB} KB)`)

  // Summary by exchange
  for (const exchange of EXCHANGES) {
    const count = allSymbols.filter((s) => s.e === exchange).length
    console.log(`  ${exchange}: ${count} symbols`)
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
