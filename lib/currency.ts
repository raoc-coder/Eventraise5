/**
 * Currency utilities for multi-country support
 * Handles formatting, conversion, and country-specific currency logic
 */

export type Country = 'US' | 'IN'
export type Currency = 'USD' | 'INR'

export const COUNTRY_CONFIG = {
  US: {
    currency: 'USD' as Currency,
    symbol: '$',
    locale: 'en-US',
    paymentMethods: ['paypal'] as const,
    defaultAmount: 50, // Default donation amount in USD
  },
  IN: {
    currency: 'INR' as Currency,
    symbol: '₹',
    locale: 'en-IN',
    paymentMethods: ['paypal'] as const,
    defaultAmount: 2000, // Default donation amount in INR (~$25)
  },
} as const

/**
 * Format amount based on country/currency
 */
export function formatCurrency(amount: number, country: Country = 'US'): string {
  const config = COUNTRY_CONFIG[country]
  const locale = config.locale
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Convert USD to INR using approximate exchange rate
 * In production, you'd want to use a real-time exchange rate API
 */
export function convertUSDToINR(usdAmount: number): number {
  const EXCHANGE_RATE = 83.5 // Approximate USD to INR rate
  return Math.round(usdAmount * EXCHANGE_RATE)
}

/**
 * Convert INR to USD using approximate exchange rate
 */
export function convertINRToUSD(inrAmount: number): number {
  const EXCHANGE_RATE = 83.5
  return Math.round((inrAmount / EXCHANGE_RATE) * 100) / 100
}

/**
 * Get suggested donation amounts for a country
 */
export function getSuggestedAmounts(country: Country = 'US'): number[] {
  if (country === 'IN') {
    return [500, 1000, 2000, 5000, 10000] // INR amounts
  }
  return [10, 20, 50, 100, 200] // USD amounts in $10 increments
}

/**
 * Get platform fee percentage (same for all countries currently)
 */
export function getPlatformFeePercentage(): number {
  return 8.99 // 8.99% platform fee
}

/**
 * Calculate platform fee in cents/paise
 */
export function calculatePlatformFee(amountCents: number): number {
  return Math.floor(amountCents * (getPlatformFeePercentage() / 100))
}

/**
 * Get payment methods available for a country
 */
export function getPaymentMethods(country: Country): readonly string[] {
  return COUNTRY_CONFIG[country].paymentMethods
}

/**
 * Check if a country supports a specific payment method
 */
export function supportsPaymentMethod(country: Country, method: string): boolean {
  return getPaymentMethods(country).includes(method)
}

/**
 * Get country from localStorage or default to US
 */
export function getStoredCountry(): Country {
  if (typeof window === 'undefined') return 'US'
  
  try {
    const stored = localStorage.getItem('eventraisehub_country')
    return (stored === 'IN' || stored === 'US') ? stored : 'US'
  } catch {
    return 'US'
  }
}

/**
 * Store country preference in localStorage
 */
export function storeCountry(country: Country): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('eventraisehub_country', country)
  } catch (error) {
    console.warn('Failed to store country preference:', error)
  }
}

/**
 * Format date based on country preference
 */
export function formatDate(date: Date | string, country: Country = 'US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (country === 'IN') {
    // India format: DD/MM/YYYY
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // US format: MM/DD/YYYY
  return dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}
