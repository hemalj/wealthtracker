import { parse, isValid, isFuture } from 'date-fns'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

const VALID_TYPES = ['buy', 'sell', 'dividend', 'initial_position']
const VALID_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP', 'INR']

// Strip currency formatting ($, commas) and parse as number
export function parseCurrencyNumber(value: string): number {
  const cleaned = value.replace(/[$,]/g, '').trim()
  return parseFloat(cleaned)
}

export function validateTransactionRow(
  row: Record<string, string>,
  mapping: Record<string, string>
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Date validation
  const dateStr = row[mapping.date]
  if (!dateStr) {
    errors.push('Date is required')
  } else {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date())
    if (!isValid(date)) {
      // Try alternate formats
      const altDate = new Date(dateStr)
      if (isNaN(altDate.getTime())) {
        errors.push('Invalid date format (expected YYYY-MM-DD)')
      } else if (isFuture(altDate)) {
        errors.push('Date cannot be in the future')
      }
    } else if (isFuture(date)) {
      errors.push('Date cannot be in the future')
    }
  }

  // Symbol validation
  const symbol = row[mapping.symbol]
  if (!symbol) {
    errors.push('Symbol is required')
  } else if (symbol.length > 20) {
    errors.push('Symbol too long (max 20 characters)')
  }

  // Type validation
  const type = row[mapping.type]?.toLowerCase()
  if (!type) {
    errors.push('Type is required')
  } else if (!VALID_TYPES.includes(type)) {
    errors.push(`Invalid type: ${type}. Must be: ${VALID_TYPES.join(', ')}`)
  }

  // Currency validation (required — drives exchange determination)
  const currency = row[mapping.currency]
  if (!currency) {
    errors.push('Currency is required')
  } else if (!VALID_CURRENCIES.includes(currency.toUpperCase())) {
    warnings.push(`Currency "${currency}" not in standard list (${VALID_CURRENCIES.join(', ')})`)
  }

  // Quantity validation
  // Required for buy/sell/initial_position; optional for dividend (used with unitPrice as alternative to totalAmount)
  // Sell CSVs may export negative quantities — use absolute value since type field determines direction
  const quantityStr = mapping.quantity ? row[mapping.quantity]?.trim() : undefined
  const hasQuantity = quantityStr && !isNaN(parseCurrencyNumber(quantityStr)) && Math.abs(parseCurrencyNumber(quantityStr)) > 0

  if (['buy', 'sell', 'initial_position'].includes(type)) {
    if (!quantityStr) {
      errors.push('Quantity is required for buy/sell/initial_position')
    } else {
      const quantity = parseCurrencyNumber(quantityStr)
      if (isNaN(quantity) || Math.abs(quantity) <= 0) {
        errors.push('Quantity must be a non-zero number')
      }
    }
  }

  // Unit price validation
  // Required for buy/sell/initial_position; optional for dividend (used with quantity as alternative to totalAmount)
  const unitPriceStr = mapping.unitPrice ? row[mapping.unitPrice]?.trim() : undefined
  const hasUnitPrice = unitPriceStr && !isNaN(parseCurrencyNumber(unitPriceStr)) && Math.abs(parseCurrencyNumber(unitPriceStr)) > 0

  if (['buy', 'sell', 'initial_position'].includes(type)) {
    if (!unitPriceStr) {
      errors.push('Unit price is required for buy/sell/initial_position')
    } else {
      const unitPrice = parseCurrencyNumber(unitPriceStr)
      if (isNaN(unitPrice) || Math.abs(unitPrice) <= 0) {
        errors.push('Unit price must be a non-zero number')
      }
    }
  }

  // Total amount validation (for dividend only)
  // Dividend needs either (quantity + unitPrice) OR totalAmount
  if (type === 'dividend') {
    if (hasQuantity && hasUnitPrice) {
      // qty × unitPrice will be used; totalAmount ignored
    } else {
      const totalAmountStr = mapping.totalAmount ? row[mapping.totalAmount]?.trim() : undefined
      if (!totalAmountStr) {
        errors.push('Dividend requires either (Quantity + Unit Price) or Total Amount')
      } else {
        const totalAmount = parseCurrencyNumber(totalAmountStr)
        if (isNaN(totalAmount) || Math.abs(totalAmount) <= 0) {
          errors.push('Total amount must be a non-zero number')
        }
      }
    }
  }

  // Fees validation (optional, defaults to 0 if empty)
  if (mapping.fees && row[mapping.fees]?.trim()) {
    const fees = parseCurrencyNumber(row[mapping.fees])
    if (isNaN(fees)) {
      errors.push('Fees must be a valid number')
    } else if (fees < 0) {
      errors.push('Fees must be a non-negative number')
    }
  }

  // Commission validation (optional, defaults to 0 if empty)
  if (mapping.commission && row[mapping.commission]?.trim()) {
    const commission = parseCurrencyNumber(row[mapping.commission])
    if (isNaN(commission)) {
      errors.push('Commission must be a valid number')
    } else if (commission < 0) {
      errors.push('Commission must be a non-negative number')
    }
  }

  // MER validation (optional, >= 0)
  if (mapping.mer && row[mapping.mer]?.trim()) {
    const mer = parseCurrencyNumber(row[mapping.mer])
    if (isNaN(mer)) {
      errors.push('MER must be a valid number')
    } else if (mer < 0) {
      errors.push('MER must be a non-negative number')
    }
  }

  // Notes validation (optional, max 500)
  if (mapping.notes && row[mapping.notes]) {
    if (row[mapping.notes].length > 500) {
      warnings.push('Notes truncated to 500 characters')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
