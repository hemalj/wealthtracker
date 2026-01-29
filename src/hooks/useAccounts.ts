import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/services/accountService'
import type { CreateAccountInput, UpdateAccountInput } from '@/types'

// Query keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (userId: string) => [...accountKeys.lists(), userId] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (accountId: string) => [...accountKeys.details(), accountId] as const,
}

// Get all accounts
export const useAccounts = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: accountKeys.list(user?.id || ''),
    queryFn: () => getAccounts(user!.id),
    enabled: !!user?.id,
  })
}

// Get single account
export const useAccount = (accountId: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => getAccount(accountId),
    enabled: !!user?.id && !!accountId,
  })
}

// Create account mutation
export const useCreateAccount = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAccountInput) => createAccount(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}

// Update account mutation
export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      accountId,
      input,
    }: {
      accountId: string
      input: UpdateAccountInput
    }) => updateAccount(accountId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: accountKeys.detail(variables.accountId),
      })
    },
  })
}

// Delete account mutation
export const useDeleteAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => deleteAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}
