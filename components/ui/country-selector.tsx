'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Globe, MapPin } from 'lucide-react'
import { Country, getStoredCountry, storeCountry, COUNTRY_CONFIG } from '@/lib/currency'

interface CountrySelectorProps {
  onCountryChange?: (country: Country) => void
  className?: string
  variant?: 'dropdown' | 'cards'
}

export function CountrySelector({ 
  onCountryChange, 
  className = '',
  variant = 'dropdown'
}: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>('US')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setSelectedCountry(getStoredCountry())
  }, [])

  const handleCountrySelect = (country: Country) => {
    console.log('Country selected:', country)
    setSelectedCountry(country)
    storeCountry(country)
    setIsOpen(false)
    onCountryChange?.(country)
  }

  const currentConfig = COUNTRY_CONFIG[selectedCountry]

  if (variant === 'cards') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Globe className="h-4 w-4" />
          Select your region
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(COUNTRY_CONFIG).map(([countryCode, config]) => (
            <Card 
              key={countryCode}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCountry === countryCode 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleCountrySelect(countryCode as Country)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {countryCode === 'US' ? (
                        <span className="text-xs font-bold">🇺🇸</span>
                      ) : (
                        <span className="text-xs font-bold">🇮🇳</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {countryCode === 'US' ? 'United States' : 'India'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {config.currency} • {config.paymentMethods.join(', ')}
                      </div>
                    </div>
                  </div>
                  {selectedCountry === countryCode && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => {
          console.log('Country selector clicked, isOpen:', isOpen)
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 h-10 px-3 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
      >
        <MapPin className="h-4 w-4" />
        <span>
          {selectedCountry === 'US' ? '🇺🇸 US' : '🇮🇳 India'}
        </span>
        <span className="text-xs text-gray-500">
          {currentConfig.currency}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {Object.entries(COUNTRY_CONFIG).map(([countryCode, config]) => (
                <button
                  key={countryCode}
                  onClick={() => handleCountrySelect(countryCode as Country)}
                  className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${
                    selectedCountry === countryCode
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    {countryCode === 'US' ? (
                      <span className="text-xs">🇺🇸</span>
                    ) : (
                      <span className="text-xs">🇮🇳</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {countryCode === 'US' ? 'United States' : 'India'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {config.currency} • {config.paymentMethods.join(', ')}
                    </div>
                  </div>
                  {selectedCountry === countryCode && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CountrySelector
