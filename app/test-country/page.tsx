'use client'

import { Navigation } from '@/components/layout/navigation'
import { CountrySelector } from '@/components/ui/country-selector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Country, getStoredCountry, formatCurrency, getSuggestedAmounts } from '@/lib/currency'
import { useState, useEffect } from 'react'

export default function TestCountryPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>('US')

  useEffect(() => {
    setSelectedCountry(getStoredCountry())
  }, [])

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country)
  }

  const suggestedAmounts = getSuggestedAmounts(selectedCountry)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Country Selector Test
          </h1>
          <p className="text-gray-600">
            Test the country selector functionality and see how it affects currency formatting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Country Selector Test */}
          <Card>
            <CardHeader>
              <CardTitle>Country Selector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Dropdown Variant</h3>
                <CountrySelector 
                  variant="dropdown" 
                  onCountryChange={handleCountryChange}
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Cards Variant</h3>
                <CountrySelector 
                  variant="cards" 
                  onCountryChange={handleCountryChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Currency Formatting Test */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Formatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current Selection</h3>
                <p className="text-lg">
                  Country: <span className="font-bold">{selectedCountry}</span>
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Sample Amounts</h3>
                <div className="space-y-2">
                  {suggestedAmounts.slice(0, 3).map((amount) => (
                    <div key={amount} className="flex justify-between">
                      <span>{formatCurrency(amount, selectedCountry)}</span>
                      <span className="text-gray-500">
                        {selectedCountry === 'US' ? `$${amount}` : `₹${amount}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Test Conversion</h3>
                <p>USD $25 = {formatCurrency(25, 'IN')}</p>
                <p>INR ₹2000 = {formatCurrency(2000, 'US')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
              <div>Selected Country: {selectedCountry}</div>
              <div>Stored Country: {getStoredCountry()}</div>
              <div>Currency: {selectedCountry === 'US' ? 'USD' : 'INR'}</div>
              <div>Payment Methods: {selectedCountry === 'US' ? 'paypal' : 'razorpay, paypal'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
