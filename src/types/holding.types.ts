// Internal FIFO lot used during calculation (not exposed in MVP UI)
export interface TaxLot {
  transactionId: string
  date: Date
  quantity: number
  costBasis: number
  costPerShare: number
}

// Average cost metrics (MVP display)
export interface AverageCostMetrics {
  costBasis: number // Total cost of all purchases
  costPerShare: number // costBasis / quantity
  unrealizedGain: number // marketValue - costBasis (0 if no price)
  unrealizedGainPercent: number // percentage (0 if no price)
}

// Single holding for one symbol in one account
export interface Holding {
  accountId: string
  symbol: string
  currency: string
  quantity: number // Current shares owned
  avgCost: AverageCostMetrics
  marketValue: number // quantity * currentPrice (0 if no price)
  currentPrice: number | null // null until EODHD integration
  realizedGain: number // Cumulative realized gain from sells
  dividendIncome: number // Cumulative dividends received
  totalReturn: number // realized + unrealized + dividends
  totalReturnPercent: number
  firstTransactionDate: Date
  lastTransactionDate: Date
}

// Portfolio-level summary across all holdings
export interface PortfolioSummary {
  totalMarketValue: number
  totalCostBasis: number
  totalUnrealizedGain: number
  totalUnrealizedGainPercent: number
  totalRealizedGain: number
  totalDividendIncome: number
  totalReturn: number
  totalReturnPercent: number
  holdingsCount: number
  accountBreakdown: Record<string, { marketValue: number; costBasis: number }>
}

// Optional price map for future EODHD integration
export type PriceMap = Record<string, number> // symbol -> current price
