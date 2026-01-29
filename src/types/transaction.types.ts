import { Timestamp } from 'firebase/firestore'

// Transaction types per PHASE_1_DEVELOPMENT_PLAN.md - investment portfolio tracking
export type TransactionType =
  | 'initial_position'
  | 'buy'
  | 'sell'
  | 'dividend'
  | 'split_forward'
  | 'split_reverse'

export interface Transaction {
  id: string
  userId: string
  accountId: string
  symbol: string
  type: TransactionType
  date: Timestamp | Date
  quantity?: number
  unitPrice?: number
  totalAmount?: number
  currency: string
  fees?: number
  commission?: number
  mer?: number // Management Expense Ratio
  notes?: string
  splitRatio?: string // e.g., "2:1" for 2-for-1 split
  cashInLieu?: number // Cash received instead of fractional shares
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface CreateTransactionInput {
  accountId: string
  symbol: string
  type: TransactionType
  date: Date
  quantity?: number
  unitPrice?: number
  totalAmount?: number
  currency: string
  fees?: number
  commission?: number
  mer?: number
  notes?: string
  splitRatio?: string
  cashInLieu?: number
}

export interface UpdateTransactionInput {
  accountId?: string
  symbol?: string
  type?: TransactionType
  date?: Date
  quantity?: number
  unitPrice?: number
  totalAmount?: number
  currency?: string
  fees?: number
  commission?: number
  mer?: number
  notes?: string
  splitRatio?: string
  cashInLieu?: number
}

export interface TransactionFilters {
  accountIds?: string[]
  symbols?: string[]
  types?: TransactionType[]
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

export interface TransactionSummary {
  totalBuys: number
  totalSells: number
  totalDividends: number
  transactionCount: number
  bySymbol: Record<string, number>
  byType: Record<TransactionType, number>
}

// CSV Import types for bulk transaction import
export interface BulkTransactionImport {
  file: File
  accountId: string
  mapping: CSVColumnMapping
  skipFirstRow: boolean
}

export interface CSVColumnMapping {
  date: number
  symbol: number
  type: number
  quantity?: number
  unitPrice?: number
  totalAmount?: number
  currency: number
  fees?: number
  commission?: number
  notes?: number
}

// Transaction type labels for UI
export const transactionTypeLabels: Record<TransactionType, string> = {
  initial_position: 'Initial Position',
  buy: 'Buy',
  sell: 'Sell',
  dividend: 'Dividend',
  split_forward: 'Stock Split (Forward)',
  split_reverse: 'Stock Split (Reverse)',
}

// Transaction type descriptions
export const transactionTypeDescriptions: Record<TransactionType, string> = {
  initial_position: 'Starting position when importing existing holdings',
  buy: 'Purchase of securities',
  sell: 'Sale of securities',
  dividend: 'Cash dividend received',
  split_forward: 'Forward stock split (e.g., 2:1 doubles shares)',
  split_reverse: 'Reverse stock split (e.g., 1:2 halves shares)',
}
