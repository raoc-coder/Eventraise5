/**
 * Currency utilities for USD support
 */

export type Currency = 'USD'

/**
 * Format amount in USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get suggested donation amounts in USD
 */
export function getSuggestedAmounts(): number[] {
  return [10, 20, 50, 100, 200] // USD amounts
}

/**
 * Get platform fee percentage
 */
export function getPlatformFeePercentage(): number {
  return 8.99 // 8.99% platform fee
}

/**
 * Calculate platform fee in cents
 */
export function calculatePlatformFee(amountCents: number): number {
  return Math.floor(amountCents * (getPlatformFeePercentage() / 100))
}

/**
 * Format date in US format (MM/DD/YYYY)
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}
