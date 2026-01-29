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
import type { CreateAccountInput } from '@/types'

// Validation schema per Day 12 plan
const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['taxable', 'ira', 'roth_ira', '401k', 'tfsa', 'rrsp', 'other'] as const),
  currency: z.enum(['USD', 'CAD', 'EUR', 'GBP', 'INR'] as const),
  description: z.string().max(500).optional(),
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountFormProps {
  initialValues?: CreateAccountInput
  onSubmit: (data: CreateAccountInput) => void
  onCancel: () => void
  loading?: boolean
}

export function AccountForm({ initialValues, onSubmit, onCancel, loading }: AccountFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: initialValues || {
      name: '',
      type: 'taxable',
      currency: 'USD',
      description: '',
    },
  })

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Account Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            margin="normal"
            required
          />
        )}
      />

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" required error={!!errors.type}>
            <InputLabel>Account Type</InputLabel>
            <Select {...field} label="Account Type">
              <MenuItem value="taxable">Taxable</MenuItem>
              <MenuItem value="ira">IRA</MenuItem>
              <MenuItem value="roth_ira">Roth IRA</MenuItem>
              <MenuItem value="401k">401(k)</MenuItem>
              <MenuItem value="tfsa">TFSA</MenuItem>
              <MenuItem value="rrsp">RRSP</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth margin="normal" required error={!!errors.currency}>
            <InputLabel>Currency</InputLabel>
            <Select {...field} label="Currency">
              <MenuItem value="USD">USD - US Dollar</MenuItem>
              <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
              <MenuItem value="EUR">EUR - Euro</MenuItem>
              <MenuItem value="GBP">GBP - British Pound</MenuItem>
              <MenuItem value="INR">INR - Indian Rupee</MenuItem>
            </Select>
            {errors.currency && <FormHelperText>{errors.currency.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Description (Optional)"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            margin="normal"
          />
        )}
      />

      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" type="submit" disabled={loading}>
          {initialValues ? 'Update Account' : 'Create Account'}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}

export default AccountForm
