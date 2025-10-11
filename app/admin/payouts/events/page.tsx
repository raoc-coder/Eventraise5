'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase as sharedSupabase } from '@/lib/supabase'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react'
import { useCurrency } from '@/app/providers/currency-provider'

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
  const { formatCurrency } = useCurrency()
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
    const supabaseClient = sharedSupabase!
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

  const formatCurrencyLocal = (cents: number) => formatCurrency(cents / 100)
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    const base = 'inline-flex items-center px-2 py-1 rounded-full font-semibold text-xs'
    return `${base} ${variants[status] || 'bg-gray-100 text-gray-800'}`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-700" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Loading admin payouts…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Event Payouts</h1>
          <p className="text-gray-600 mt-1">Manage payouts per event and organizer</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[0,1,2,3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                {loading ? (
                  <div className="animate-pulse flex items-center">
                    <div className="h-8 w-8 rounded bg-gray-200" />
                    <div className="ml-4 w-full">
                      <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                      <div className="h-5 w-32 bg-gray-200 rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {i === 0 && <DollarSign className="h-8 w-8 text-green-600" />}
                    {i === 1 && <TrendingUp className="h-8 w-8 text-blue-600" />}
                    {i === 2 && <Users className="h-8 w-8 text-purple-600" />}
                    {i === 3 && <Calendar className="h-8 w-8 text-orange-600" />}
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{['Total Gross','Total Fees','Net to Organizers','Pending Payouts'][i]}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {i === 0 && formatCurrencyLocal(totals.total_gross)}
                        {i === 1 && formatCurrencyLocal(totals.total_fees)}
                        {i === 2 && formatCurrencyLocal(totals.total_net)}
                        {i === 3 && totals.pending_payouts}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Event Payouts</CardTitle>
            <CardDescription>Payouts organized by event and organizer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" aria-busy={loading} aria-live="polite">
                <thead>
                  <tr className="text-left text-gray-700 border-b">
                    <th className="py-3 pr-4 text-sm font-medium">Event</th>
                    <th className="py-3 pr-4 text-sm font-medium">Organizer</th>
                    <th className="py-3 pr-4 text-sm font-medium text-right">Gross</th>
                    <th className="py-3 pr-4 text-sm font-medium text-right">Fees</th>
                    <th className="py-3 pr-4 text-sm font-medium text-right">Net</th>
                    <th className="py-3 pr-4 text-sm font-medium">Status</th>
                    <th className="py-3 pr-4 text-sm font-medium">Method</th>
                    <th className="py-3 pr-4 text-sm font-medium text-right">Date</th>
                    <th className="py-3 pr-4 text-sm font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(even)]:bg-gray-50/50">
                  {loading && (
                    <tr aria-hidden="true">
                      <td colSpan={9} className="py-6">
                        <div className="animate-pulse h-4 w-40 bg-gray-200 rounded mb-2" />
                        <div className="animate-pulse h-3 w-64 bg-gray-200 rounded" />
                      </td>
                    </tr>
                  )}
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50 focus-within:bg-gray-50">
                      <td className="py-3 pr-4 align-middle">
                        <div>
                          <p className="font-medium">{payout.event_title}</p>
                          <p className="text-xs text-gray-500">{payout.donation_count} donations</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <div>
                          <p className="font-medium">{payout.organizer_name}</p>
                          <p className="text-xs text-gray-500">{payout.organizer_email}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right font-medium align-middle">{formatCurrencyLocal(payout.total_gross_cents)}</td>
                      <td className="py-3 pr-4 text-right text-red-600 align-middle">{formatCurrencyLocal(payout.total_fees_cents)}</td>
                      <td className="py-3 pr-4 text-right font-bold text-green-600 align-middle">{formatCurrencyLocal(payout.total_net_cents)}</td>
                      <td className="py-3 pr-4 align-middle">
                        <Badge className={getStatusBadge(payout.payout_status)}>
                          {payout.payout_status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 align-middle">{payout.payout_method || '—'}</td>
                      <td className="py-3 pr-4 text-right align-middle">{payout.payout_date ? formatDate(payout.payout_date) : '—'}</td>
                      <td className="py-3 pr-4 text-right align-middle">
                        <div className="flex gap-2 justify-end">
                          {payout.payout_status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updatePayoutStatus(payout.id, 'processing')}
                              aria-label={`Mark payout for ${payout.event_title} as processing`}
                            >
                              Process
                            </Button>
                          )}
                          {payout.payout_status === 'processing' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updatePayoutStatus(payout.id, 'completed', 'paypal', `PAY-${Date.now()}`)}
                              aria-label={`Mark payout for ${payout.event_title} as completed`}
                            >
                              Complete
                            </Button>
                          )}
                          <Button size="sm" variant="outline" aria-label={`View details for payout ${payout.id}`}>
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
