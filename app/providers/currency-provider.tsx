'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { formatCurrency, getSuggestedAmounts, formatDate } from '@/lib/currency'

interface CurrencyContextType {
  formatCurrency: (amount: number) => string
  getSuggestedAmounts: () => number[]
  formatDate: (date: Date | string) => string
  currency: string
  symbol: string
  paymentMethods: readonly string[]
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const value: CurrencyContextType = {
    formatCurrency,
    getSuggestedAmounts,
    formatDate,
    currency: 'USD',
    symbol: '$',
    paymentMethods: ['paypal'] as const,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
