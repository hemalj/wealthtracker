import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormHelperText,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import type { CreateTransactionInput } from '@/types/transaction.types'
import type { Account } from '@/types/account.types'
import { SymbolAutocomplete } from './SymbolAutocomplete'

const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  type: z.enum(['buy', 'sell', 'dividend']),
  date: z.date(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().min(3).max(3),
  commission: z.number().min(0).optional(),
  mer: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  accounts: Account[]
  initialValues?: TransactionFormData
  onSubmit: (data: CreateTransactionInput) => void
  onCancel: () => void
  loading?: boolean
}

export function TransactionForm({
  accounts,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialValues || {
      accountId: '',
      symbol: '',
      type: 'buy',
      date: new Date(),
      currency: 'USD',
    },
  })

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data as CreateTransactionInput)
  }

  const transactionType = watch('type')

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <Controller
          name="accountId"
          control={control}
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
              {errors.accountId && <FormHelperText>{errors.accountId.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Controller
          name="symbol"
          control={control}
          render={({ field }) => (
            <SymbolAutocomplete
              value={field.value}
              onChange={(val, currency) => {
                field.onChange(val)
                if (currency) setValue('currency', currency)
              }}
              error={!!errors.symbol}
              helperText={errors.symbol?.message}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Transaction Type</InputLabel>
              <Select {...field} label="Transaction Type">
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
                <MenuItem value="dividend">Dividend</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="date"
          control={control}
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

        {transactionType !== 'dividend' && (
          <>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Quantity"
                  type="number"
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  margin="normal"
                  required
                  slotProps={{ htmlInput: { step: 'any' } }}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />

            <Controller
              name="unitPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Unit Price"
                  type="number"
                  error={!!errors.unitPrice}
                  helperText={errors.unitPrice?.message}
                  margin="normal"
                  required
                  slotProps={{ htmlInput: { step: 'any' } }}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />
          </>
        )}

        {transactionType === 'dividend' && (
          <Controller
            name="totalAmount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Total Amount"
                type="number"
                error={!!errors.totalAmount}
                helperText={errors.totalAmount?.message}
                margin="normal"
                required
                slotProps={{ htmlInput: { step: 'any' } }}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />
        )}

        <Controller
          name="commission"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Commission (Optional)"
              type="number"
              margin="normal"
              slotProps={{ htmlInput: { step: 'any' } }}
              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          )}
        />

        <Controller
          name="mer"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="MER (Optional)"
              type="number"
              margin="normal"
              slotProps={{ htmlInput: { step: 'any' } }}
              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={2}
              margin="normal"
            />
          )}
        />

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" type="submit" disabled={loading}>
            {initialValues ? 'Update Transaction' : 'Create Transaction'}
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
