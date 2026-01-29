import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  FormHelperText,
} from '@mui/material'
import {
  accountTypes,
  accountTypeLabels,
  currencies,
} from '@/lib/validations/accountSchemas'
import { useCreateAccount, useUpdateAccount } from '@/hooks/useAccounts'
import type { Account, AccountType, Currency } from '@/types'

interface AccountFormValues {
  name: string
  type: AccountType
  currency: Currency
  description: string
}

interface AccountDialogProps {
  open: boolean
  onClose: () => void
  account?: Account | null
}

const AccountDialog = ({ open, onClose, account }: AccountDialogProps) => {
  const isEditing = !!account
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    defaultValues: {
      name: '',
      type: 'taxable',
      currency: 'USD',
      description: '',
    },
  })

  // Reset form when dialog opens or account changes
  useEffect(() => {
    if (open) {
      if (account) {
        reset({
          name: account.name,
          type: account.type,
          currency: account.currency,
          description: account.description || '',
        })
      } else {
        reset({
          name: '',
          type: 'taxable',
          currency: 'USD',
          description: '',
        })
      }
    }
  }, [open, account, reset])

  const onSubmit = async (data: AccountFormValues) => {
    try {
      const accountData = {
        name: data.name,
        type: data.type,
        currency: data.currency,
        description: data.description || undefined,
      }

      if (isEditing && account) {
        await updateMutation.mutateAsync({
          accountId: account.id,
          input: accountData,
        })
      } else {
        await createMutation.mutateAsync(accountData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving account:', error)
    }
  }

  const error = createMutation.error || updateMutation.error

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>{isEditing ? 'Edit Account' : 'Add New Account'}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error instanceof Error ? error.message : 'An error occurred'}
            </Alert>
          )}

          <TextField
            {...register('name', { required: 'Account name is required' })}
            label="Account Name"
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name?.message}
            placeholder="e.g., Main Brokerage"
            sx={{ mb: 2 }}
          />

          <Controller
            name="type"
            control={control}
            rules={{ required: 'Account type is required' }}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.type} sx={{ mb: 2 }}>
                <InputLabel>Account Type</InputLabel>
                <Select {...field} label="Account Type">
                  {accountTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {accountTypeLabels[type]}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <Controller
            name="currency"
            control={control}
            rules={{ required: 'Currency is required' }}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.currency} sx={{ mb: 2 }}>
                <InputLabel>Currency</InputLabel>
                <Select {...field} label="Currency">
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.currency && <FormHelperText>{errors.currency.message}</FormHelperText>}
              </FormControl>
            )}
          />

          <TextField
            {...register('description')}
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            placeholder="Optional description for this account"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isEditing ? 'Save Changes' : 'Add Account'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AccountDialog
