'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Ticket, Plus, Edit, Trash2, Users, DollarSign, Calendar } from 'lucide-react'

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
  organizer_id: string
}

export default function EventTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    price_cents: 0,
    currency: 'usd',
    quantity_total: '',
    sales_start_at: '',
    sales_end_at: ''
  })

  const fetchData = async (eventId: string) => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) throw new Error('Failed to fetch event')
      const eventData = await eventResponse.json()
      setEvent(eventData.event)

      // Check if user is organizer
      if (eventData.event.organizer_id !== session.user.id) {
        throw new Error('Access denied')
      }

      // Fetch tickets
      const ticketsResponse = await fetch(`/api/events/${eventId}/tickets`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json()
        setTickets(ticketsData.tickets || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const { id: createEventId } = await params
      const response = await fetch(`/api/events/${createEventId}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          price_cents: formData.price_cents * 100,
          currency: formData.currency,
          quantity_total: formData.quantity_total ? parseInt(formData.quantity_total) : null,
          sales_start_at: formData.sales_start_at || null,
          sales_end_at: formData.sales_end_at || null
        })
      })

      if (!response.ok) throw new Error('Failed to create ticket')

      const { id: refreshEventId } = await params
      await fetchData(refreshEventId)
      setShowCreateForm(false)
      setFormData({
        name: '',
        price_cents: 0,
        currency: 'usd',
        quantity_total: '',
        sales_start_at: '',
        sales_end_at: ''
      })
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const { id: deleteEventId } = await params
      const response = await fetch(`/api/events/${deleteEventId}/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to delete ticket')

      const { id: refreshEventId2 } = await params
      await fetchData(refreshEventId2)
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  useEffect(() => {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    setSupabase(supabaseClient)

    const initializeData = async () => {
      const resolvedParams = await params
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchData(resolvedParams.id)
    }

    initializeData()
  }, [params, router])

  if (!user || !event) return <div>Loading...</div>

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Tickets</h1>
          <p className="text-gray-600 mt-2">Create and manage tickets for {event.title}</p>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Ticket</CardTitle>
              <CardDescription>Add a new ticket type for your event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price_cents / 100}
                      onChange={(e) => setFormData({ ...formData, price_cents: parseFloat(e.target.value) * 100 })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Total Quantity (Optional)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity_total}
                      onChange={(e) => setFormData({ ...formData, quantity_total: e.target.value })}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_start">Sales Start Date</Label>
                    <Input
                      id="sales_start"
                      type="datetime-local"
                      value={formData.sales_start_at}
                      onChange={(e) => setFormData({ ...formData, sales_start_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales_end">Sales End Date</Label>
                    <Input
                      id="sales_end"
                      type="datetime-local"
                      value={formData.sales_end_at}
                      onChange={(e) => setFormData({ ...formData, sales_end_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Ticket'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Event Tickets</h2>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket
            </Button>
          </div>

          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create tickets for your event to start selling them.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{ticket.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingTicket(ticket)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTicket(ticket.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {formatCurrency(ticket.price_cents)} {ticket.currency.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sold</span>
                        <span className="font-medium">{ticket.quantity_sold}</span>
                      </div>
                      
                      {ticket.quantity_total && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Available</span>
                          <span className="font-medium">{ticket.quantity_total - ticket.quantity_sold}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Revenue</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(ticket.price_cents * ticket.quantity_sold)}
                        </span>
                      </div>

                      {ticket.sales_start_at && (
                        <div className="text-xs text-gray-500">
                          Sales start: {formatDate(ticket.sales_start_at)}
                        </div>
                      )}
                      
                      {ticket.sales_end_at && (
                        <div className="text-xs text-gray-500">
                          Sales end: {formatDate(ticket.sales_end_at)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
