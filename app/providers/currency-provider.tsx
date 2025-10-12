'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Country, getStoredCountry, storeCountry, formatCurrency, getSuggestedAmounts, formatDate, COUNTRY_CONFIG } from '@/lib/currency'

interface CurrencyContextType {
  country: Country
  setCountry: (country: Country) => void
  formatCurrency: (amount: number) => string
  getSuggestedAmounts: (country: Country) => number[]
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
  const [country, setCountryState] = useState<Country>('US')

  useEffect(() => {
    setCountryState(getStoredCountry())
  }, [])

  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry)
    storeCountry(newCountry)
  }

  const config = COUNTRY_CONFIG[country]

  const value: CurrencyContextType = {
    country,
    setCountry,
    formatCurrency: (amount: number) => formatCurrency(amount, country),
    getSuggestedAmounts,
    formatDate: (date: Date | string) => formatDate(date, country),
    currency: config.currency,
    symbol: config.symbol,
    paymentMethods: config.paymentMethods,
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
