'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Ticket, Plus, Edit, Trash2, Calendar, DollarSign, Users, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Ticket {
  id: string
  name: string
  price_cents: number
  currency: string
  quantity_total: number | null
  quantity_sold: number
  sales_start_at: string | null
  sales_end_at: string | null
  created_at: string
}

interface Event {
  id: string
  title: string
  start_date: string
  location: string
}

export default function TicketManagement() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price_cents: '',
    currency: 'usd',
    quantity_total: '',
    sales_start_at: '',
    sales_end_at: ''
  })

  const fetchEvent = useCallback(async () => {
    if (!eventId) return
    
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
      }
    } catch (error) {
      console.error('Failed to fetch event:', error)
      toast.error('Failed to load event details')
    }
  }, [eventId])

  const fetchTickets = useCallback(async () => {
    if (!eventId) return
    
    try {
      const response = await fetch(`/api/events/${eventId}/tickets`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
    fetchTickets()
  }, [fetchEvent, fetchTickets])

  const resetForm = () => {
    setFormData({
      name: '',
      price_cents: '',
      currency: 'usd',
      quantity_total: '',
      sales_start_at: '',
      sales_end_at: ''
    })
    setEditingTicket(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return

    setSaving(true)
    try {
      const ticketData = {
        name: formData.name,
        price_cents: Math.round(parseFloat(formData.price_cents) * 100),
        currency: formData.currency,
        quantity_total: formData.quantity_total ? parseInt(formData.quantity_total) : null,
        sales_start_at: formData.sales_start_at || null,
        sales_end_at: formData.sales_end_at || null
      }

      const response = await fetch(`/api/events/${eventId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      })

      if (response.ok) {
        toast.success('Ticket created successfully!')
        setShowCreateDialog(false)
        resetForm()
        fetchTickets()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create ticket')
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
      toast.error('Failed to create ticket')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}/tickets/${ticketId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Ticket deleted successfully!')
        fetchTickets()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete ticket')
      }
    } catch (error) {
      console.error('Failed to delete ticket:', error)
      toast.error('Failed to delete ticket')
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const getAvailabilityStatus = (ticket: Ticket) => {
    const now = new Date()
    const salesStart = ticket.sales_start_at ? new Date(ticket.sales_start_at) : null
    const salesEnd = ticket.sales_end_at ? new Date(ticket.sales_end_at) : null

    if (salesStart && now < salesStart) return { status: 'upcoming', color: 'bg-yellow-100 text-yellow-800' }
    if (salesEnd && now > salesEnd) return { status: 'ended', color: 'bg-red-100 text-red-800' }
    if (ticket.quantity_total && ticket.quantity_sold >= ticket.quantity_total) return { status: 'sold-out', color: 'bg-red-100 text-red-800' }
    return { status: 'available', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
              <p className="text-gray-600 mt-2">
                Manage tickets for <span className="font-medium">{event?.title}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Back to Event
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>
                      Add a new ticket type for your event
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Ticket Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., General Admission"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price_cents ? (parseFloat(formData.price_cents) / 100).toFixed(2) : ''}
                          onChange={(e) => setFormData({ ...formData, price_cents: (parseFloat(e.target.value) * 100).toString() })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="usd">USD</option>
                          <option value="eur">EUR</option>
                          <option value="gbp">GBP</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Total Quantity (optional)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity_total}
                        onChange={(e) => setFormData({ ...formData, quantity_total: e.target.value })}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sales_start">Sales Start</Label>
                        <Input
                          id="sales_start"
                          type="datetime-local"
                          value={formData.sales_start_at}
                          onChange={(e) => setFormData({ ...formData, sales_start_at: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sales_end">Sales End</Label>
                        <Input
                          id="sales_end"
                          type="datetime-local"
                          value={formData.sales_end_at}
                          onChange={(e) => setFormData({ ...formData, sales_end_at: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Ticket'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first ticket to start selling tickets for this event.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const availability = getAvailabilityStatus(ticket)
              return (
                <Card key={ticket.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.name}</h3>
                          <Badge className={availability.color}>
                            {availability.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatPrice(ticket.price_cents)} {ticket.currency.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {ticket.quantity_total 
                                ? `${ticket.quantity_sold}/${ticket.quantity_total} sold`
                                : `${ticket.quantity_sold} sold`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Starts: {formatDate(ticket.sales_start_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Ends: {formatDate(ticket.sales_end_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTicket(ticket)
                            setFormData({
                              name: ticket.name,
                              price_cents: ticket.price_cents.toString(),
                              currency: ticket.currency,
                              quantity_total: ticket.quantity_total?.toString() || '',
                              sales_start_at: ticket.sales_start_at ? new Date(ticket.sales_start_at).toISOString().slice(0, 16) : '',
                              sales_end_at: ticket.sales_end_at ? new Date(ticket.sales_end_at).toISOString().slice(0, 16) : ''
                            })
                            setShowCreateDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ticket.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
