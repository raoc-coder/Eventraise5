'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Ticket, Calendar, MapPin, Users } from 'lucide-react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { paypalClientConfig } from '@/lib/paypal-client'

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
}

export function TicketPurchase({ event, tickets, onSuccess }: TicketPurchaseProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingRegistrationId, setPendingRegistrationId] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

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
    <div className="space-y-6">
      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event.title}
          </CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{new Date(event.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{event.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Tickets</CardTitle>
          <CardDescription>Choose your ticket type and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedTicket?.id === ticket.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
                onClick={() => handleTicketSelect(ticket)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                      {selectedTicket?.id === ticket.id && (
                        <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      ${(ticket.price_cents / 100).toFixed(2)} {ticket.currency.toUpperCase()}
                    </p>
                    {ticket.quantity_total && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Availability</span>
                          <span>{ticket.quantity_total - ticket.quantity_sold} of {ticket.quantity_total} remaining</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.max(0, Math.min(100, ((ticket.quantity_total - ticket.quantity_sold) / ticket.quantity_total) * 100))}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    {ticket.sales_start_at && (
                      <Badge variant="outline" className="text-xs block">
                        Sales start: {new Date(ticket.sales_start_at).toLocaleDateString()}
                      </Badge>
                    )}
                    {ticket.sales_end_at && (
                      <Badge variant="outline" className="text-xs block">
                        Sales end: {new Date(ticket.sales_end_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quantity and Buyer Info */}
      {selectedTicket && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Details
              </CardTitle>
              <CardDescription>
                Complete your ticket purchase for {selectedTicket.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Ticket Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedTicket.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${(selectedTicket.price_cents / 100).toFixed(2)} {selectedTicket.currency.toUpperCase()} each
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${(totalAmount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {quantity} ticket{quantity !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quantity" className="text-base font-medium">Quantity</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10"
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min={1}
                      max={maxQuantity}
                      className="w-20 text-center text-lg font-medium"
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
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum {maxQuantity} ticket{maxQuantity !== 1 ? 's' : ''} per purchase
                  </p>
                </div>

                <div>
                  <Label className="text-base font-medium">Total Amount</Label>
                  <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-700">
                      ${(totalAmount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      {quantity} × ${(selectedTicket.price_cents / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Your Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={buyerInfo.name}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={buyerInfo.email}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  We&apos;ll send your ticket confirmation to this email address.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modal trigger for checkout */}
          {buyerInfo.name && buyerInfo.email && (
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCheckout(true)}>
                Continue to Payment
              </Button>
            </div>
          )}
        </>
      )}
      {/* Modal Checkout */}
      {showCheckout && selectedTicket && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => !loading && setShowCheckout(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="font-semibold text-gray-900">Complete Purchase</div>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => !loading && setShowCheckout(false)} aria-label="Close">×</button>
              </div>
              <div className="px-5 pt-4 pb-5">
                {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>)}
                {loading && (<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">Processing your payment...</div>)}
                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{selectedTicket.name} × {quantity}</span>
                    <span className="font-semibold">${(totalAmount / 100).toFixed(2)}</span>
                  </div>
                </div>
                <PayPalScriptProvider options={{ ...paypalClientConfig, currency: selectedTicket.currency.toUpperCase() }}>
                  <PayPalButtons
                    createOrder={async () => {
                      const response = await fetch(`/api/events/${event.id}/tickets/checkout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ticket_id: selectedTicket.id, quantity, name: buyerInfo.name, email: buyerInfo.email })
                      })
                      const data = await response.json()
                      if (!data.success) throw new Error(data.error || 'Failed to create order')
                      setPendingRegistrationId(data.registration_id)
                      return data.orderId
                    }}
                    onApprove={(data) => {
                      const orderDetails = { id: (data as any)?.orderID }
                      return handlePayPalSuccess(orderDetails).then(() => setShowCheckout(false))
                    }}
                    onError={(err) => { setError('Payment failed. Please try again.'); console.error('PayPal error:', err) }}
                    style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal', height: 45 }}
                  />
                </PayPalScriptProvider>
                <p className="mt-4 text-center text-[11px] text-gray-500">By completing this purchase, you agree to our terms. Payments are processed securely by PayPal.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
