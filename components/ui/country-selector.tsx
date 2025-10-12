'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Globe, MapPin } from 'lucide-react'
import { Country, COUNTRY_CONFIG } from '@/lib/currency'
import { useCurrency } from '@/app/providers/currency-provider'
import { createPortal } from 'react-dom'

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
  const { country: selectedCountry, setCountry } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleCountrySelect = (country: Country) => {
    console.log('Country selected:', country)
    setCountry(country)
    setIsOpen(false)
    onCountryChange?.(country)
  }

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      window.addEventListener('scroll', updateDropdownPosition)
      window.addEventListener('resize', updateDropdownPosition)
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition)
        window.removeEventListener('resize', updateDropdownPosition)
      }
    }
  }, [isOpen])

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
        ref={buttonRef}
        onClick={() => {
          console.log('Country selector clicked, isOpen:', isOpen)
          console.log('Current country:', selectedCountry)
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 h-10 px-3 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <MapPin className="h-4 w-4" />
        <span>
          {selectedCountry === 'US' ? '🇺🇸 US' : '🇮🇳 India'}
        </span>
        <span className="text-xs text-gray-500">
          {currentConfig.currency}
        </span>
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-[9999]" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed w-64 bg-white border-2 border-blue-200 rounded-lg shadow-2xl z-[10000]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
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
        </>,
        document.body
      )}
    </div>
  )
}

export default CountrySelector
