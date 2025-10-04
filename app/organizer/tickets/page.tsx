'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ticket, Users, DollarSign, Calendar, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'

interface EventWithTickets {
  id: string
  title: string
  start_date: string
  location: string
  organizer_id: string
  tickets: Array<{
    id: string
    name: string
    price_cents: number
    currency: string
    quantity_total: number | null
    quantity_sold: number
    sales_start_at: string | null
    sales_end_at: string | null
    created_at: string
  }>
}

export default function OrganizerTicketsPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<EventWithTickets[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEventsWithTickets = useCallback(async () => {
    if (!supabase || !user) return
    
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      // Fetch user's events
      const eventsResponse = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!eventsResponse.ok) throw new Error('Failed to fetch events')
      const eventsData = await eventsResponse.json()
      const userEvents = eventsData.events.filter((event: any) => 
        event.organizer_id === user.id || event.created_by === user.id
      )

      // Fetch tickets for each event
      const eventsWithTickets = await Promise.all(
        userEvents.map(async (event: any) => {
          try {
            const ticketsResponse = await fetch(`/api/events/${event.id}/tickets`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            })
            
            const ticketsData = ticketsResponse.ok ? await ticketsResponse.json() : { tickets: [] }
            return {
              ...event,
              tickets: ticketsData.tickets || []
            }
          } catch (error) {
            console.error(`Error fetching tickets for event ${event.id}:`, error)
            return {
              ...event,
              tickets: []
            }
          }
        })
      )

      setEvents(eventsWithTickets)
    } catch (error) {
      console.error('Error fetching events with tickets:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    setSupabase(supabaseClient)

    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
    })
  }, [router])

  useEffect(() => {
    if (supabase && user) {
      fetchEventsWithTickets()
    }
  }, [supabase, user, fetchEventsWithTickets])

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  const getStatusBadge = (ticket: any) => {
    const now = new Date()
    const salesStart = ticket.sales_start_at ? new Date(ticket.sales_start_at) : null
    const salesEnd = ticket.sales_end_at ? new Date(ticket.sales_end_at) : null
    
    if (salesStart && now < salesStart) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Not Started</Badge>
    }
    if (salesEnd && now > salesEnd) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700">Ended</Badge>
    }
    if (ticket.quantity_total && ticket.quantity_sold >= ticket.quantity_total) {
      return <Badge variant="outline" className="bg-red-50 text-red-700">Sold Out</Badge>
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
  }

  const totalTickets = events.reduce((sum, event) => sum + event.tickets.length, 0)
  const totalRevenue = events.reduce((sum, event) => 
    sum + event.tickets.reduce((ticketSum, ticket) => 
      ticketSum + (ticket.quantity_sold * ticket.price_cents), 0
    ), 0
  )

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
          <p className="text-gray-600 mt-2">Manage tickets across all your events</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Ticket className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Events with Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900">{events.filter(e => e.tickets.length > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events with Tickets */}
        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading events...</p>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-4">You haven&apos;t created any events yet.</p>
                <Link href="/events/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.start_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.tickets.length} ticket type{event.tickets.length !== 1 ? 's' : ''}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}/tickets`}>
                        <Button variant="outline" size="sm">
                          <Ticket className="h-4 w-4 mr-2" />
                          Manage Tickets
                        </Button>
                      </Link>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Event
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {event.tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <Ticket className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No tickets created for this event</p>
                      <Link href={`/events/${event.id}/tickets`}>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Tickets
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {event.tickets.map((ticket) => (
                        <div key={ticket.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                            {getStatusBadge(ticket)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="font-medium">{formatCurrency(ticket.price_cents)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sold:</span>
                              <span className="font-medium">
                                {ticket.quantity_sold}
                                {ticket.quantity_total && ` / ${ticket.quantity_total}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(ticket.quantity_sold * ticket.price_cents)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
