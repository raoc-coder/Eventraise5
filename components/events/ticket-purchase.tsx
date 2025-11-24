'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Ticket, Calendar, MapPin, Users } from 'lucide-react'
import { toast } from 'sonner'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { paypalClientConfig, PayPalTicketButton } from '@/lib/paypal-client'
import { useCurrency } from '@/app/providers/currency-provider'

interface Ticket {
  id: string
  name: string
  price_cents: number
  currency: string
  quantity_total: number | null
  quantity_sold: number
  sales_start_at: string | null
  sales_end_at: string | null
}

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  location: string
  organizer_id: string
}

interface TicketPurchaseProps {
  event: Event
  tickets: Ticket[]
  onSuccess?: () => void
  fetchTickets?: () => void
}

export function TicketPurchase({ event, tickets, onSuccess, fetchTickets }: TicketPurchaseProps) {
  const { formatCurrency, country, currency } = useCurrency()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingRegistrationId, setPendingRegistrationId] = useState<string | null>(null)

  const availableTickets = tickets.filter(ticket => {
    const now = new Date()
    const salesStart = ticket.sales_start_at ? new Date(ticket.sales_start_at) : null
    const salesEnd = ticket.sales_end_at ? new Date(ticket.sales_end_at) : null
    
    if (salesStart && now < salesStart) return false
    if (salesEnd && now > salesEnd) return false
    if (ticket.quantity_total && ticket.quantity_sold >= ticket.quantity_total) return false
    
    return true
  })

  const totalAmount = selectedTicket ? selectedTicket.price_cents * quantity : 0
  const maxQuantity = selectedTicket?.quantity_total 
    ? Math.min(selectedTicket.quantity_total - selectedTicket.quantity_sold, 10)
    : 10

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setQuantity(1)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handlePayPalSuccess = async (details: any, registrationId?: string) => {
    const regId = registrationId || pendingRegistrationId
    if (!selectedTicket || !regId) {
      setError('Missing registration. Please try again.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}/tickets/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: regId,
          paypal_order_id: details.id
        })
      })

      if (!response.ok) {
        throw new Error('Payment processing failed')
      }

      const result = await response.json()
      if (result.success) {
        onSuccess?.()
        // Reset form
        setSelectedTicket(null)
        setQuantity(1)
        setBuyerInfo({ name: '', email: '' })
        setPendingRegistrationId(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (availableTickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Available</h3>
          <p className="text-gray-600 mb-4">
            Tickets are not currently available for this event.
          </p>
          <div className="text-sm text-gray-500">
            <p>This could be because:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Ticket sales haven&apos;t started yet</li>
              <li>All tickets have been sold</li>
              <li>Ticket sales have ended</li>
              <li>No tickets have been created for this event</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ticket Selection */}
      <div className="mb-6">
        <p className="text-gray-700 mb-3 font-medium">Select Ticket</p>
        <div className="space-y-2">
          {availableTickets.map((ticket) => (
            <Button
              key={ticket.id}
              variant={selectedTicket?.id === ticket.id ? 'default' : 'outline'}
              onClick={() => handleTicketSelect(ticket)}
              className="w-full justify-start p-4 h-auto min-h-[60px]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{ticket.name}</span>
                    {selectedTicket?.id === ticket.id && (
                      <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                    )}
                  </div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(ticket.price_cents / 100)}
                  </div>
                  {ticket.quantity_total && (
                    <div className="text-sm opacity-75 mt-1">
                      {ticket.quantity_total - ticket.quantity_sold} of {ticket.quantity_total} remaining
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity Selection */}
      {selectedTicket && (
        <div className="mb-6">
          <p className="text-gray-700 mb-3 font-medium">Quantity</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="w-10 h-10"
            >
              -
            </Button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              min={1}
              max={maxQuantity}
              className="input w-20 text-center text-base"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="w-10 h-10"
            >
              +
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Maximum {maxQuantity} ticket{maxQuantity !== 1 ? 's' : ''} per purchase
          </p>
        </div>
      )}

      {/* Buyer Information */}
      {selectedTicket && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">Your Name (Required)</Label>
            <Input
              id="name"
              value={buyerInfo.name}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
              placeholder="Enter your full name"
              required
              className="input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Your Email (Required)</Label>
            <Input
              id="email"
              type="email"
              value={buyerInfo.email}
              onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
              placeholder="Enter your email"
              required
              className="input"
            />
          </div>
          <p className="text-xs text-gray-600">We&apos;ll send your ticket confirmation to this email address.</p>
        </div>
      )}

      {/* Payment Summary */}
      {selectedTicket && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Ticket Price</span>
            <span className="text-gray-900 font-semibold">{formatCurrency(selectedTicket.price_cents / 100)} × {quantity}</span>
          </div>
          <div className="border-t border-blue-300 mt-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-bold">You&apos;ll Be Charged</span>
              <span className="text-blue-600 font-bold text-lg">
                {formatCurrency(totalAmount / 100)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">A platform fee of 8.99% applies to ticket purchases.</p>
        </div>
      )}

      {/* Payment */}
      {selectedTicket && buyerInfo.name && buyerInfo.email && (
        <div className="space-y-4">
          <PayPalTicketButton
            amount={totalAmount / 100}
            eventId={event.id}
            ticketId={selectedTicket.id}
            quantity={quantity}
            currency={currency}
            onSuccess={(orderId) => {
              toast.success('Tickets purchased successfully!')
              fetchTickets?.()
              onSuccess?.()
            }}
            onError={(error) => {
              toast.error(error)
            }}
            disabled={!buyerInfo.name || !buyerInfo.email}
          />
          <p className="text-xs text-gray-500 text-center">Payments are processed securely by PayPal.</p>
        </div>
      )}
    </div>
  )
}
