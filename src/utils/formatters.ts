import { format, parseISO } from 'date-fns'
import type { Currency } from '@/types'

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: Currency = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Number formatting
export const formatNumber = (value: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`
}

// Date formatting
export const formatDate = (
  date: Date | string,
  formatString: string = 'MM/dd/yyyy'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString)
}

// Relative date formatting (e.g., "2 hours ago")
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else {
    return formatDate(dateObj)
  }
}

// Compact number formatting (e.g., 1.2K, 1.5M)
export const formatCompactNumber = (value: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
