import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  getUserTransactions,
  getAccountTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkCreateTransactions,
} from '@/services/transactionService'
import type { CreateTransactionInput, UpdateTransactionInput } from '@/types'

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (userId: string) => [...transactionKeys.lists(), userId] as const,
  account: (userId: string, accountId: string) =>
    [...transactionKeys.lists(), userId, 'account', accountId] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (transactionId: string) => [...transactionKeys.details(), transactionId] as const,
}

// Get all transactions for current user
export const useTransactions = (limitCount = 100) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: transactionKeys.list(user?.id || ''),
    queryFn: () => getUserTransactions(user!.id, limitCount),
    enabled: !!user?.id,
  })
}

// Get transactions for a specific account
export const useAccountTransactions = (accountId: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: transactionKeys.account(user?.id || '', accountId),
    queryFn: () => getAccountTransactions(user!.id, accountId),
    enabled: !!user?.id && !!accountId,
  })
}

// Get single transaction
export const useTransaction = (transactionId: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: () => getTransaction(transactionId),
    enabled: !!user?.id && !!transactionId,
  })
}

// Create transaction mutation
export const useCreateTransaction = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransaction(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

// Update transaction mutation
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      transactionId,
      input,
    }: {
      transactionId: string
      input: UpdateTransactionInput
    }) => updateTransaction(transactionId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.transactionId),
      })
    },
  })
}

// Delete transaction mutation
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}

// Bulk create transactions mutation (for CSV import)
export const useBulkCreateTransactions = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactions: CreateTransactionInput[]) =>
      bulkCreateTransactions(user!.id, transactions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
  })
}
