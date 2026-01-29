import { Timestamp } from 'firebase/firestore'

// Account types per PHASE_1_DEVELOPMENT_PLAN.md - investment account types
export type AccountType = 'taxable' | 'ira' | 'roth_ira' | '401k' | 'tfsa' | 'rrsp' | 'other'

export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'INR'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  currency: Currency
  description?: string
  isActive: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface CreateAccountInput {
  name: string
  type: AccountType
  currency: Currency
  description?: string
}

export interface UpdateAccountInput {
  name?: string
  type?: AccountType
  currency?: Currency
  description?: string
  isActive?: boolean
}

export interface AccountSummary {
  totalValue: number
  accountsByType: Record<AccountType, number>
  accountsByCurrency: Record<Currency, number>
}
