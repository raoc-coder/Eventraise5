'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react'

interface EventPayout {
  id: string
  event_id: string
  event_title: string
  organizer_id: string
  organizer_name: string
  organizer_email: string
  total_gross_cents: number
  total_fees_cents: number
  total_net_cents: number
  payout_status: string
  payout_method?: string
  payout_reference?: string
  payout_date?: string
  created_at: string
  donation_count: number
}

export default function EventPayoutsPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [payouts, setPayouts] = useState<EventPayout[]>([])
  const [totals, setTotals] = useState({ 
    total_gross: 0, 
    total_fees: 0, 
    total_net: 0, 
    pending_payouts: 0,
    completed_payouts: 0 
  })

  const fetchEventPayouts = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const response = await fetch('/api/admin/payouts/events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch payouts')
      
      const data = await response.json()
      setPayouts(data.payouts || [])
      setTotals(data.totals || {})
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updatePayoutStatus = async (payoutId: string, status: string, method?: string, reference?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const response = await fetch(`/api/admin/payouts/events/${payoutId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, method, reference })
      })

      if (!response.ok) throw new Error('Failed to update payout')
      
      await fetchEventPayouts() // Refresh data
    } catch (error) {
      console.error('Error updating payout:', error)
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
      fetchEventPayouts()
    })
  }, [router, fetchEventPayouts])

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return variants[status] || 'bg-gray-100 text-gray-800'
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Payouts</h1>
          <p className="text-gray-600 mt-2">Manage payouts per event and organizer</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gross</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total_gross)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Fees</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total_fees)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net to Organizers</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total_net)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{totals.pending_payouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Event Payouts</CardTitle>
            <CardDescription>Payouts organized by event and organizer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-3 pr-4">Event</th>
                    <th className="py-3 pr-4">Organizer</th>
                    <th className="py-3 pr-4">Gross</th>
                    <th className="py-3 pr-4">Fees</th>
                    <th className="py-3 pr-4">Net</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Method</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium">{payout.event_title}</p>
                          <p className="text-xs text-gray-500">{payout.donation_count} donations</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium">{payout.organizer_name}</p>
                          <p className="text-xs text-gray-500">{payout.organizer_email}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium">{formatCurrency(payout.total_gross_cents)}</td>
                      <td className="py-3 pr-4 text-red-600">{formatCurrency(payout.total_fees_cents)}</td>
                      <td className="py-3 pr-4 font-bold text-green-600">{formatCurrency(payout.total_net_cents)}</td>
                      <td className="py-3 pr-4">
                        <Badge className={getStatusBadge(payout.payout_status)}>
                          {payout.payout_status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{payout.payout_method || '—'}</td>
                      <td className="py-3 pr-4">{payout.payout_date ? formatDate(payout.payout_date) : '—'}</td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          {payout.payout_status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updatePayoutStatus(payout.id, 'processing')}
                            >
                              Process
                            </Button>
                          )}
                          {payout.payout_status === 'processing' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updatePayoutStatus(payout.id, 'completed', 'paypal', `PAY-${Date.now()}`)}
                            >
                              Complete
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr>
                      <td className="py-8 text-center text-gray-500" colSpan={9}>
                        No payouts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
