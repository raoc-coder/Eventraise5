'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Ticket, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Shield, 
  CheckCircle,
  Sparkles,
  Gift,
  Heart,
  Star,
  Zap,
  Award,
  Bell,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import { trackEventRegistration } from '@/lib/analytics'
import { MonitoringService } from '@/lib/monitoring'

interface EventRegistrationProps {
  event: {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    location: string
    max_participants: number
    current_participants: number
    ticket_price: number
    goal_amount?: number
    current_amount?: number
    organization_name: string
    image_url?: string
  }
  onSuccess?: () => void
}

export function EventRegistration({ event, onSuccess }: EventRegistrationProps) {
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [participantPhone, setParticipantPhone] = useState('')
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  const totalAmount = event.ticket_price * ticketQuantity
  const spotsRemaining = event.max_participants - event.current_participants
  const isSoldOut = spotsRemaining <= 0
  const isRegistrationOpen = new Date() < new Date(event.start_date)

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!participantName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!participantEmail.trim()) {
      toast.error('Please enter your email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(participantEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    if (ticketQuantity > spotsRemaining) {
      toast.error(`Only ${spotsRemaining} spots remaining`)
      return
    }

    setIsLoading(true)

    try {
      // Track registration attempt
      trackEventRegistration(event.id, event.title, totalAmount, participantEmail)

      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          participant_name: participantName.trim(),
          participant_email: participantEmail.trim(),
          participant_phone: participantPhone.trim(),
          ticket_quantity: ticketQuantity,
          total_amount: totalAmount,
          special_requests: specialRequests.trim(),
          dietary_restrictions: dietaryRestrictions.trim(),
          emergency_contact_name: emergencyContactName.trim(),
          emergency_contact_phone: emergencyContactPhone.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register for event')
      }

      if (event.ticket_price > 0) {
        // Redirect to payment if ticket has a price
        const paymentResponse = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: totalAmount,
            campaign_id: event.id,
            donor_name: participantName.trim(),
            donor_email: participantEmail.trim(),
            success_url: `${window.location.origin}/events/${event.id}/success?registration_id=${data.registration_id}`,
            cancel_url: `${window.location.origin}/events/${event.id}`,
          }),
        })

        const paymentData = await paymentResponse.json()

        if (!paymentResponse.ok) {
          throw new Error(paymentData.error || 'Failed to create payment session')
        }

        // Redirect to Stripe Checkout
        toast.loading('Redirecting to secure payment...', { duration: 2000 })
        window.location.href = paymentData.sessionUrl
      } else {
        // Free event - confirm registration
        setRegistrationId(data.registration_id)
        setRegistrationComplete(true)
        toast.success('Registration confirmed! Check your email for details.')
        onSuccess?.()
      }

    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to register for event')
      
      // Track registration failure
      MonitoringService.trackCriticalError(
        error instanceof Error ? error : new Error('Unknown registration error'),
        {
          event_id: event.id,
          amount: totalAmount,
          participant_email: participantEmail,
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="space-y-6">
        <DonationConfirmation
          campaignId={event.id}
          amount={totalAmount}
          donorName={participantName}
          transactionId={registrationId || undefined}
          showShareOptions={true}
          showNextSteps={true}
        />
      </div>
    )
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Ticket className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-gray-900">Register for Event</CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          Secure your spot at this amazing event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Summary */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Registration Summary</h3>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Featured Event</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Tickets:</span>
              <span className="font-medium">{ticketQuantity}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold text-blue-600">
                ${(event.ticket_price * ticketQuantity).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(event.start_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Location:</span>
              <span className="font-medium truncate">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegistration} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="participantName" className="text-gray-700">
                Full Name *
              </Label>
              <Input
                id="participantName"
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="participantEmail" className="text-gray-700">
                Email Address *
              </Label>
              <Input
                id="participantEmail"
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="participantPhone" className="text-gray-700">
                Phone Number
              </Label>
              <Input
                id="participantPhone"
                type="tel"
                value={participantPhone}
                onChange={(e) => setParticipantPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="ticketQuantity" className="text-gray-700">
                Number of Tickets
              </Label>
              <Input
                id="ticketQuantity"
                type="number"
                min="1"
                max={spotsRemaining}
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {spotsRemaining} spots remaining
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequests" className="text-gray-700">
              Special Requests or Accommodations
            </Label>
            <Input
              id="specialRequests"
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or accommodations needed"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dietaryRestrictions" className="text-gray-700">
              Dietary Restrictions
            </Label>
            <Input
              id="dietaryRestrictions"
              type="text"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="Any dietary restrictions or allergies"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName" className="text-gray-700">
                Emergency Contact Name
              </Label>
              <Input
                id="emergencyContactName"
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Emergency contact name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyContactPhone" className="text-gray-700">
                Emergency Contact Phone
              </Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="Emergency contact phone"
                className="mt-1"
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">Terms and Conditions</p>
                <ul className="space-y-1 text-xs">
                  <li>• Registration is non-refundable unless event is cancelled</li>
                  <li>• Participants must arrive on time for the event</li>
                  <li>• Photography may be taken during the event</li>
                  <li>• Contact information will be used for event updates only</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isLoading || isSoldOut || !isRegistrationOpen}
              className="btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : isSoldOut ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sold Out
                </>
              ) : !isRegistrationOpen ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Registration Closed
                </>
              ) : event.ticket_price > 0 ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue to Payment
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Register for Free
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
