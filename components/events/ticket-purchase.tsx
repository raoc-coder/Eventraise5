'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Ticket, Calendar, MapPin, Users } from 'lucide-react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

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

  const handlePayPalSuccess = async (details: any) => {
    if (!selectedTicket) return

    setLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}/tickets/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          quantity,
          name: buyerInfo.name,
          email: buyerInfo.email,
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
          <p className="text-gray-600">
            Tickets are not currently available for this event.
          </p>
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
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTicketSelect(ticket)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{ticket.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${(ticket.price_cents / 100).toFixed(2)} {ticket.currency.toUpperCase()}
                    </p>
                    {ticket.quantity_total && (
                      <p className="text-xs text-gray-500">
                        {ticket.quantity_total - ticket.quantity_sold} remaining
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {ticket.sales_start_at && (
                      <Badge variant="outline" className="text-xs">
                        Sales start: {new Date(ticket.sales_start_at).toLocaleDateString()}
                      </Badge>
                    )}
                    {ticket.sales_end_at && (
                      <Badge variant="outline" className="text-xs">
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
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
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
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="total">Total Amount</Label>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    ${(totalAmount / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={buyerInfo.name}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={buyerInfo.email}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PayPal Payment */}
          {buyerInfo.name && buyerInfo.email && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Complete Purchase
                </CardTitle>
                <CardDescription>
                  Secure payment via PayPal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                
                <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                    currency: selectedTicket.currency.toUpperCase(),
                    intent: 'capture'
                  }}
                >
                  <PayPalButtons
                    createOrder={async () => {
                      const response = await fetch(`/api/events/${event.id}/tickets/checkout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ticket_id: selectedTicket.id,
                          quantity,
                          name: buyerInfo.name,
                          email: buyerInfo.email
                        })
                      })
                      
                      const data = await response.json()
                      if (!data.success) {
                        throw new Error(data.error || 'Failed to create order')
                      }
                      
                      return data.orderId
                    }}
                    onApprove={handlePayPalSuccess}
                    onError={(err) => {
                      setError('Payment failed. Please try again.')
                      console.error('PayPal error:', err)
                    }}
                    style={{
                      layout: 'vertical',
                      color: 'blue',
                      shape: 'rect',
                      label: 'paypal'
                    }}
                  />
                </PayPalScriptProvider>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
