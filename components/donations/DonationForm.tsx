'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DollarSign, 
  Gift, 
  CreditCard,
  Shield,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DonationFormProps {
  campaignId: string
  campaignTitle: string
  onSuccess?: (donation: any) => void
}

export default function DonationForm({ campaignId, campaignTitle, onSuccess }: DonationFormProps) {
  const [donationAmount, setDonationAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'amount' | 'details' | 'payment' | 'success'>('amount')

  const quickAmounts = [25, 50, 100, 250, 500]

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount')
      return
    }
    setStep('details')
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAnonymous && (!donorName || !donorEmail)) {
      toast.error('Please fill in all required fields')
      return
    }
    setStep('payment')
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Here you would integrate with Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const donation = {
        amount: parseFloat(donationAmount),
        donorName: isAnonymous ? 'Anonymous' : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        message,
        campaignId,
        campaignTitle
      }
      
      toast.success(`Thank you for your donation of $${donationAmount}!`)
      setStep('success')
      onSuccess?.(donation)
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setDonationAmount('')
    setDonorName('')
    setDonorEmail('')
    setIsAnonymous(false)
    setMessage('')
    setStep('amount')
  }

  return (
    <Card className="card-soft">
      <CardHeader>
        <CardTitle className="text-white">Make a Donation</CardTitle>
        <CardDescription className="text-gray-300">
          Support {campaignTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'amount' && (
          <form onSubmit={handleAmountSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="amount" className="text-gray-300 text-lg font-semibold">
                Donation Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="pl-10 text-lg"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDonationAmount(amount.toString())}
                    className="text-cyan-400 hover:bg-cyan-500/20"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full btn-primary">
              Continue
            </Button>
          </form>
        )}

        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                disabled={isAnonymous}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                disabled={isAnonymous}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-300">Message (Optional)</Label>
              <textarea
                id="message"
                placeholder="Leave a message of support..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
              />
              <Label htmlFor="anonymous" className="text-gray-300">Donate anonymously</Label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('amount')} className="flex-1 text-cyan-400 hover:bg-cyan-500/20">
                Back
              </Button>
              <Button type="submit" className="flex-1 btn-primary">
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === 'payment' && (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Donation Amount</span>
                <span className="text-white font-semibold">${donationAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Processing Fee (2.9%)</span>
                <span className="text-white font-semibold">${(parseFloat(donationAmount) * 0.029).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-cyan-400 font-bold text-lg">
                    ${(parseFloat(donationAmount) * 1.029).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card_number" className="text-gray-300">Card Number</Label>
                <Input
                  id="card_number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="text-center"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-gray-300">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('details')} className="flex-1 text-cyan-400 hover:bg-cyan-500/20">
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 btn-primary">
                {loading ? 'Processing...' : 'Complete Donation'}
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Donation Successful!</h3>
            <p className="text-gray-300 mb-6">
              Thank you for your generous donation of ${donationAmount} to {campaignTitle}
            </p>
            <div className="space-y-2">
              <Button onClick={resetForm} className="btn-primary">
                Make Another Donation
              </Button>
              <Button variant="outline" className="w-full text-cyan-400 hover:bg-cyan-500/20">
                Share This Campaign
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
