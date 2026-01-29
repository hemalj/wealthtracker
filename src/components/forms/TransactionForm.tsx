import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormHelperText,
  InputAdornment,
  Alert,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import type {
  CreateTransactionInput,
  TransactionType,
  Account,
} from '@/types'
import { transactionTypeLabels } from '@/types'

const transactionTypes: TransactionType[] = [
  'buy',
  'sell',
  'dividend',
  'initial_position',
  'split_forward',
  'split_reverse',
]

const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'INR']

interface TransactionFormProps {
  accounts: Account[]
  initialValues?: Partial<CreateTransactionInput>
  onSubmit: (data: CreateTransactionInput) => void
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

export function TransactionForm({
  accounts,
  initialValues,
  onSubmit,
  onCancel,
  loading,
  error,
}: TransactionFormProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    defaultValues: {
      accountId: initialValues?.accountId || '',
      symbol: initialValues?.symbol || '',
      type: initialValues?.type || 'buy',
      date: initialValues?.date || new Date(),
      quantity: initialValues?.quantity,
      unitPrice: initialValues?.unitPrice,
      totalAmount: initialValues?.totalAmount,
      currency: initialValues?.currency || 'USD',
      fees: initialValues?.fees || 0,
      commission: initialValues?.commission || 0,
      notes: initialValues?.notes || '',
      splitRatio: initialValues?.splitRatio || '',
    },
  })

  const transactionType = watch('type')
  const selectedAccountId = watch('accountId')
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)

  // Update currency when account changes
  useEffect(() => {
    if (selectedAccount) {
      reset((prev) => ({ ...prev, currency: selectedAccount.currency }))
    }
  }, [selectedAccount, reset])

  // Determine which fields to show based on transaction type
  const showQuantityPrice = ['buy', 'sell', 'initial_position'].includes(transactionType)
  const showTotalAmount = transactionType === 'dividend'
  const showSplitRatio = ['split_forward', 'split_reverse'].includes(transactionType)
  const showFees = ['buy', 'sell'].includes(transactionType)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Controller
          name="accountId"
          control={control}
          rules={{ required: 'Account is required' }}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" required error={!!errors.accountId}>
              <InputLabel>Account</InputLabel>
              <Select {...field} label="Account">
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </MenuItem>
                ))}
              </Select>
              {errors.accountId && (
                <FormHelperText>{errors.accountId.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <TextField
          {...register('symbol', { required: 'Symbol is required' })}
          fullWidth
          label="Symbol"
          placeholder="e.g., AAPL, MSFT, VOO"
          error={!!errors.symbol}
          helperText={errors.symbol?.message}
          margin="normal"
          required
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />

        <Controller
          name="type"
          control={control}
          rules={{ required: 'Transaction type is required' }}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Transaction Type</InputLabel>
              <Select {...field} label="Transaction Type">
                {transactionTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {transactionTypeLabels[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="date"
          control={control}
          rules={{ required: 'Date is required' }}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Date"
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  required: true,
                  error: !!errors.date,
                  helperText: errors.date?.message,
                },
              }}
            />
          )}
        />

        {showQuantityPrice && (
          <>
            <Controller
              name="quantity"
              control={control}
              rules={{ required: 'Quantity is required', min: { value: 0.0001, message: 'Must be positive' } }}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    onChange(isNaN(val) ? undefined : val)
                  }}
                  fullWidth
                  label="Quantity"
                  type="number"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  margin="normal"
                  required
                  inputProps={{ step: '0.0001', min: '0' }}
                />
              )}
            />

            <Controller
              name="unitPrice"
              control={control}
              rules={{ required: 'Unit price is required', min: { value: 0.01, message: 'Must be positive' } }}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    onChange(isNaN(val) ? undefined : val)
                  }}
                  fullWidth
                  label="Unit Price"
                  type="number"
                  error={!!errors.unitPrice}
                  helperText={errors.unitPrice?.message}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              )}
            />
          </>
        )}

        {showTotalAmount && (
          <Controller
            name="totalAmount"
            control={control}
            rules={{ required: 'Total amount is required', min: { value: 0.01, message: 'Must be positive' } }}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value ?? ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  onChange(isNaN(val) ? undefined : val)
                }}
                fullWidth
                label="Total Amount"
                type="number"
                error={!!errors.totalAmount}
                helperText={errors.totalAmount?.message || 'Total dividend amount received'}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0' }}
              />
            )}
          />
        )}

        {showSplitRatio && (
          <TextField
            {...register('splitRatio', { required: 'Split ratio is required' })}
            fullWidth
            label="Split Ratio"
            placeholder="e.g., 2:1 for 2-for-1 split"
            error={!!errors.splitRatio}
            helperText={errors.splitRatio?.message || 'Format: new:old (e.g., 2:1 doubles shares)'}
            margin="normal"
            required
          />
        )}

        {showFees && (
          <>
            <Controller
              name="fees"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    onChange(isNaN(val) ? 0 : val)
                  }}
                  fullWidth
                  label="Fees (Optional)"
                  type="number"
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              )}
            />

            <Controller
              name="commission"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    onChange(isNaN(val) ? 0 : val)
                  }}
                  fullWidth
                  label="Commission (Optional)"
                  type="number"
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              )}
            />
          </>
        )}

        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <InputLabel>Currency</InputLabel>
              <Select {...field} label="Currency">
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <TextField
          {...register('notes')}
          fullWidth
          label="Notes (Optional)"
          multiline
          rows={2}
          margin="normal"
          placeholder="Optional notes about this transaction"
        />

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" type="submit" disabled={loading}>
            {initialValues ? 'Update Transaction' : 'Add Transaction'}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}

export default TransactionForm
