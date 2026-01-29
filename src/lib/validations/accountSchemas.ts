import { z } from 'zod'

// Account types per PHASE_1_DEVELOPMENT_PLAN.md - investment account types
export const accountTypes = [
  'taxable',
  'ira',
  'roth_ira',
  '401k',
  'tfsa',
  'rrsp',
  'other',
] as const

export const accountTypeLabels: Record<(typeof accountTypes)[number], string> = {
  taxable: 'Taxable',
  ira: 'IRA',
  roth_ira: 'Roth IRA',
  '401k': '401(k)',
  tfsa: 'TFSA',
  rrsp: 'RRSP',
  other: 'Other',
}

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const

export const accountSchema = z.object({
  name: z
    .string({ message: 'Account name is required' })
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters'),
  type: z.enum(accountTypes, { message: 'Please select an account type' }),
  currency: z.enum(['USD', 'CAD', 'EUR', 'GBP', 'INR'], { message: 'Please select a currency' }),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
})

export type AccountFormData = z.infer<typeof accountSchema>

// For editing, all fields are optional except id
export const updateAccountSchema = accountSchema.partial()

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>
