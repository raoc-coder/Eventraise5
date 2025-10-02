'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface EventSummary {
  id: string
  title: string
  event_type: string
  start_date: string
  total_raised: number
  donation_count: number
  is_published: boolean
}

interface PayoutSummary {
  total_gross: number
  total_fees: number
  total_net: number
  pending_payouts: number
  completed_payouts: number
}

export default function OrganizerDashboard() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<EventSummary[]>([])
  const [payouts, setPayouts] = useState<PayoutSummary>({
    total_gross: 0,
    total_fees: 0,
    total_net: 0,
    pending_payouts: 0,
    completed_payouts: 0
  })

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      // Fetch events
      const eventsResponse = await fetch('/api/events/mine', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events || [])
      }

      // Fetch payout summary
      const payoutsResponse = await fetch('/api/organizer/payouts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (payoutsResponse.ok) {
        const payoutsData = await payoutsResponse.json()
        setPayouts(payoutsData.totals || {})
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    setSupabase(supabaseClient)

    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchDashboardData()
    })
  }, [router, fetchDashboardData])

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your events and track your earnings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(payouts.total_gross)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(payouts.total_net)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{payouts.completed_payouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your events and payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/events/create">
                <Button className="w-full">
                  Create New Event
                </Button>
              </Link>
              <Link href="/events/mine">
                <Button variant="outline" className="w-full">
                  View All Events
                </Button>
              </Link>
              <Link href="/organizer/payouts">
                <Button variant="outline" className="w-full">
                  View Payouts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Your latest events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.start_date)} • {event.donation_count} donations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(event.total_raised)}</p>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No events yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payout Status */}
        {payouts.pending_payouts > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Pending Payouts</h3>
                  <p className="text-sm text-gray-600">
                    You have {payouts.pending_payouts} payout{payouts.pending_payouts > 1 ? 's' : ''} being processed
                  </p>
                </div>
                <Link href="/organizer/payouts">
                  <Button>View Payouts</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
