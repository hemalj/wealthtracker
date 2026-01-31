import { Timestamp } from 'firebase/firestore'
import type { Transaction } from '@/types/transaction.types'
import type { Holding, PortfolioSummary, PriceMap } from '@/types/holding.types'

// --- Internal helpers ---

function getTransactionDate(t: Transaction): Date {
  if (t.date instanceof Date) return t.date
  return (t.date as Timestamp).toDate()
}

function sortTransactionsChronologically(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => getTransactionDate(a).getTime() - getTransactionDate(b).getTime()
  )
}

function parseSplitRatio(ratio: string): number {
  // "2:1" → 2.0 (forward), "1:5" → 0.2 (reverse)
  const parts = ratio.split(':')
  if (parts.length !== 2) return 1
  const numerator = parseFloat(parts[0])
  const denominator = parseFloat(parts[1])
  if (!numerator || !denominator) return 1
  return numerator / denominator
}

function applyInitialPositionFilter(transactions: Transaction[]): Transaction[] {
  // Find the most recent initial_position transaction
  const initialPositions = transactions
    .filter((t) => t.type === 'initial_position')
    .sort((a, b) => getTransactionDate(b).getTime() - getTransactionDate(a).getTime())

  const initialPosition = initialPositions[0]
  if (!initialPosition) return transactions

  const ipDate = getTransactionDate(initialPosition).getTime()

  // Filter out all BUY transactions on or before the initial position date
  return transactions.filter((t) => {
    if (t.type === 'buy' && getTransactionDate(t).getTime() <= ipDate) {
      return false
    }
    return true
  })
}

// --- Core calculation for a single (accountId, symbol) group ---
// Uses Average Cost Basis method (MVP).
// Tax Lot FIFO method is Post-MVP (Months 5-7, opt-in via preferences.enableTaxLotTracking).

function calculatePositionForGroup(
  transactions: Transaction[],
  accountId: string,
  symbol: string,
  currentPrice?: number
): Holding {
  // Apply initial position filter, then sort chronologically
  const filtered = applyInitialPositionFilter(transactions)
  const sorted = sortTransactionsChronologically(filtered)

  let quantity = 0
  let costBasis = 0
  let realizedGain = 0
  let dividendIncome = 0
  let currency = ''
  let firstDate: Date | null = null
  let lastDate: Date | null = null

  for (const t of sorted) {
    const txDate = getTransactionDate(t)
    if (!firstDate) firstDate = txDate
    lastDate = txDate

    if (!currency && t.currency) {
      currency = t.currency
    }

    switch (t.type) {
      case 'initial_position': {
        const qty = t.quantity || 0
        const price = t.unitPrice || 0
        quantity += qty
        costBasis += qty * price
        break
      }

      case 'buy': {
        const qty = t.quantity || 0
        const price = t.unitPrice || 0
        const fees = t.fees || 0
        quantity += qty
        costBasis += qty * price + fees
        break
      }

      case 'sell': {
        const sellQty = t.quantity || 0
        const sellPrice = t.unitPrice || 0
        const sellFees = t.fees || 0

        // Average cost method: cost of sold shares = avgCostPerShare × soldQty
        const avgCostPerShare = quantity > 0 ? costBasis / quantity : 0
        const costOfSold = avgCostPerShare * sellQty

        realizedGain += (sellPrice * sellQty) - costOfSold - sellFees
        quantity -= sellQty
        costBasis -= costOfSold
        break
      }

      case 'dividend': {
        // Use qty × unitPrice if both provided, otherwise totalAmount
        const qty = t.quantity || 0
        const price = t.unitPrice || 0
        if (qty > 0 && price > 0) {
          dividendIncome += qty * price
        } else {
          dividendIncome += t.totalAmount || 0
        }
        break
      }

      case 'split_forward': {
        const multiplier = t.splitRatio ? parseSplitRatio(t.splitRatio) : 1
        if (multiplier === 1) break

        // Quantity multiplied, cost basis unchanged
        quantity *= multiplier
        break
      }

      case 'split_reverse': {
        const multiplier = t.splitRatio ? parseSplitRatio(t.splitRatio) : 1
        if (multiplier === 1) break

        const oldQuantity = quantity
        const newQuantity = Math.floor(oldQuantity * multiplier)

        // Old shares that don't convert to whole new shares
        const oldSharesConverted = newQuantity / multiplier
        const oldSharesNotConverted = oldQuantity - oldSharesConverted

        // Remove fractional cost basis
        const fractionalCostBasis =
          oldQuantity > 0 ? (oldSharesNotConverted / oldQuantity) * costBasis : 0

        quantity = newQuantity
        costBasis -= fractionalCostBasis

        // Cash in lieu treated as realized gain on fractional shares
        if (oldSharesNotConverted > 0 && t.cashInLieu && t.cashInLieu > 0) {
          realizedGain += t.cashInLieu - fractionalCostBasis
        }
        break
      }
    }
  }

  // Guard against floating point drift
  if (Math.abs(quantity) < 1e-9) quantity = 0
  if (Math.abs(costBasis) < 1e-9) costBasis = 0

  // Compute average cost metrics
  const costPerShare = quantity > 0 ? costBasis / quantity : 0
  const marketValue = currentPrice != null ? quantity * currentPrice : 0
  const unrealizedGain = currentPrice != null ? marketValue - costBasis : 0
  const unrealizedGainPercent =
    currentPrice != null && costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0

  const totalReturn = realizedGain + unrealizedGain + dividendIncome
  const totalInvested = costBasis + Math.abs(realizedGain)
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  return {
    accountId,
    symbol,
    currency,
    quantity,
    avgCost: {
      costBasis,
      costPerShare,
      unrealizedGain,
      unrealizedGainPercent,
    },
    marketValue,
    currentPrice: currentPrice ?? null,
    realizedGain,
    dividendIncome,
    totalReturn,
    totalReturnPercent,
    firstTransactionDate: firstDate || new Date(),
    lastTransactionDate: lastDate || new Date(),
  }
}

// --- Exported functions ---

/**
 * Calculate holdings from a list of transactions using Average Cost Basis method.
 * Groups by accountId + symbol, processes each group through the position algorithm.
 * Returns only positions with quantity > 0.
 */
export function calculateHoldings(
  transactions: Transaction[],
  priceMap?: PriceMap
): Holding[] {
  // Group transactions by accountId + symbol
  const groups = new Map<string, Transaction[]>()

  for (const t of transactions) {
    const key = `${t.accountId}::${t.symbol}`
    const group = groups.get(key)
    if (group) {
      group.push(t)
    } else {
      groups.set(key, [t])
    }
  }

  const holdings: Holding[] = []

  for (const [key, groupTxns] of groups) {
    const [accountId, symbol] = key.split('::')
    const currentPrice = priceMap?.[symbol]
    const holding = calculatePositionForGroup(groupTxns, accountId, symbol, currentPrice)

    // Only include active positions
    if (holding.quantity > 0) {
      holdings.push(holding)
    }
  }

  return holdings
}

/**
 * Calculate holdings for a single account.
 */
export function calculateAccountHoldings(
  transactions: Transaction[],
  accountId: string,
  priceMap?: PriceMap
): Holding[] {
  const filtered = transactions.filter((t) => t.accountId === accountId)
  return calculateHoldings(filtered, priceMap)
}

/**
 * Aggregate holdings into a portfolio summary for dashboard display.
 */
export function calculatePortfolioSummary(holdings: Holding[]): PortfolioSummary {
  let totalMarketValue = 0
  let totalCostBasis = 0
  let totalRealizedGain = 0
  let totalDividendIncome = 0
  const accountBreakdown: Record<string, { marketValue: number; costBasis: number }> = {}

  for (const h of holdings) {
    totalMarketValue += h.marketValue
    totalCostBasis += h.avgCost.costBasis
    totalRealizedGain += h.realizedGain
    totalDividendIncome += h.dividendIncome

    if (!accountBreakdown[h.accountId]) {
      accountBreakdown[h.accountId] = { marketValue: 0, costBasis: 0 }
    }
    accountBreakdown[h.accountId].marketValue += h.marketValue
    accountBreakdown[h.accountId].costBasis += h.avgCost.costBasis
  }

  const totalUnrealizedGain = totalMarketValue - totalCostBasis
  const totalUnrealizedGainPercent =
    totalCostBasis > 0 ? (totalUnrealizedGain / totalCostBasis) * 100 : 0
  const totalReturn = totalRealizedGain + totalUnrealizedGain + totalDividendIncome
  const totalInvested = totalCostBasis + Math.abs(totalRealizedGain)
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  return {
    totalMarketValue,
    totalCostBasis,
    totalUnrealizedGain,
    totalUnrealizedGainPercent,
    totalRealizedGain,
    totalDividendIncome,
    totalReturn,
    totalReturnPercent,
    holdingsCount: holdings.length,
    accountBreakdown,
  }
}
