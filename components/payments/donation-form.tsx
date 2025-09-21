'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, DollarSign, Gift, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface DonationFormProps {
  campaignId: string
  campaignTitle: string
  goalAmount?: number
  currentAmount?: number
  onSuccess?: () => void
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500]

export function DonationForm({ 
  campaignId, 
  campaignTitle, 
  goalAmount = 0, 
  currentAmount = 0,
  onSuccess 
}: DonationFormProps) {
  const [amount, setAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString())
  }

  const handleCustomAmount = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    setAmount(numericValue)
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid donation amount')
      return
    }

    if (!donorName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!donorEmail.trim()) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          campaign_id: campaignId,
          donor_name: donorName.trim(),
          donor_email: donorEmail.trim(),
          success_url: `${window.location.origin}/payment/success?campaign=${campaignId}`,
          cancel_url: `${window.location.origin}/payment/cancel?campaign=${campaignId}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl

    } catch (error) {
      console.error('Donation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process donation')
    } finally {
      setIsLoading(false)
    }
  }

  const progressPercentage = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0

  return (
    <Card className="card-soft">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Heart className="h-5 w-5 text-cyan-400" />
          <CardTitle className="text-white">Support {campaignTitle}</CardTitle>
        </div>
        <CardDescription className="text-gray-300">
          Your donation makes a difference. Every contribution helps us reach our goal.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress Bar */}
        {goalAmount > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>${currentAmount.toLocaleString()} raised</span>
              <span>${goalAmount.toLocaleString()} goal</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {progressPercentage.toFixed(1)}% of goal reached
            </p>
          </div>
        )}

        <form onSubmit={handleDonate} className="space-y-6">
          {/* Amount Selection */}
          <div className="space-y-4">
            <Label className="text-white">Donation Amount</Label>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  className={`h-12 text-sm ${
                    amount === preset.toString()
                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300'
                      : 'border-gray-600 text-gray-300 hover:border-cyan-400/50'
                  }`}
                  onClick={() => handlePresetAmount(preset)}
                >
                  ${preset}
                </Button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="donorName" className="text-white">Your Name</Label>
              <Input
                id="donorName"
                type="text"
                placeholder="Enter your full name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="donorEmail" className="text-white">Email Address</Label>
              <Input
                id="donorEmail"
                type="email"
                placeholder="Enter your email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Donate Button */}
          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>Donate ${amount || '0'}</span>
                <Sparkles className="h-4 w-4" />
              </div>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Secure payment powered by Stripe. Your information is safe and encrypted.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
