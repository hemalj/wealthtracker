import { useMemo } from 'react'
import { useTransactions, useAccountTransactions } from './useTransactions'
import {
  calculateHoldings,
  calculatePortfolioSummary,
} from '@/services/holdingsCalculator'
import type { PriceMap } from '@/types'

// All holdings across all accounts
export const useHoldings = (priceMap?: PriceMap) => {
  const { data: transactions, isLoading, error } = useTransactions(10000)

  const holdings = useMemo(
    () => (transactions ? calculateHoldings(transactions, priceMap) : []),
    [transactions, priceMap]
  )

  return { data: holdings, isLoading, error }
}

// Holdings for a specific account
export const useAccountHoldings = (accountId: string, priceMap?: PriceMap) => {
  const { data: transactions, isLoading, error } = useAccountTransactions(accountId)

  const holdings = useMemo(
    () => (transactions ? calculateHoldings(transactions, priceMap) : []),
    [transactions, priceMap]
  )

  return { data: holdings, isLoading, error }
}

// Portfolio summary for dashboard
export const usePortfolioSummary = (priceMap?: PriceMap) => {
  const { data: holdings, isLoading, error } = useHoldings(priceMap)

  const summary = useMemo(
    () => (holdings.length > 0 ? calculatePortfolioSummary(holdings) : null),
    [holdings]
  )

  return { data: summary, isLoading, error }
}
