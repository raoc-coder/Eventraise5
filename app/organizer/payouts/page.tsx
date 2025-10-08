'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase as sharedSupabase } from '@/lib/supabase'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Calendar, TrendingUp, Users, ExternalLink } from 'lucide-react'

interface OrganizerPayout {
  id: string
  event_id: string
  event_title: string
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

export default function OrganizerPayoutsPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [payouts, setPayouts] = useState<OrganizerPayout[]>([])
  const [totals, setTotals] = useState({ 
    total_gross: 0, 
    total_fees: 0, 
    total_net: 0, 
    pending_payouts: 0,
    completed_payouts: 0 
  })

  const [cashoutOpen, setCashoutOpen] = useState<string | null>(null)
  const [cashoutMethod, setCashoutMethod] = useState<'paypal'|'venmo'|'ach'>('paypal')
  const [cashoutEmail, setCashoutEmail] = useState('')
  const [cashoutSubmitting, setCashoutSubmitting] = useState(false)
  const [showEligibleOnly, setShowEligibleOnly] = useState(false)

  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const response = await fetch('/api/organizer/payouts', {
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

  useEffect(() => {
    const supabaseClient = sharedSupabase!
    setSupabase(supabaseClient)

    const initializeData = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(true)
      try {
        const { data: { session } } = await supabaseClient.auth.getSession()
        if (!session) throw new Error('No active session')
        const response = await fetch('/api/organizer/payouts', {
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
    }

    initializeData()
  }, [router])

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      requested: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    const base = 'inline-flex items-center px-2 py-1 rounded-full font-semibold text-xs'
    return `${base} ${variants[status] || 'bg-gray-100 text-gray-800'}`
  }

  const submitCashout = async (payoutId: string) => {
    setCashoutSubmitting(true)
    try {
      const res = await fetch('/api/organizer/payouts/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payout_id: payoutId, method: cashoutMethod, contact_email: cashoutEmail })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Request failed')
      setCashoutOpen(null)
      setCashoutEmail('')
      fetchPayouts()
    } catch (e) {
      console.error(e)
    } finally {
      setCashoutSubmitting(false)
    }
  }

  const payoutsFiltered = showEligibleOnly
    ? payouts.filter(p => p.payout_status === 'pending' || p.payout_status === 'processing')
    : payouts

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-700" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Loading your payouts…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Payouts</h1>
            <p className="text-gray-600 mt-1">Track your event payouts and earnings</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={showEligibleOnly}
              onChange={(e)=>setShowEligibleOnly(e.target.checked)}
            />
            Show only eligible for cash out
          </label>
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
                      <p className="text-sm font-medium text-gray-600">{['Total Raised','Platform Fees','Net Earnings','Completed Payouts'][i]}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {i === 0 && `$${(totals.total_gross/100).toFixed(2)}`}
                        {i === 1 && `$${(totals.total_fees/100).toFixed(2)}`}
                        {i === 2 && `$${(totals.total_net/100).toFixed(2)}`}
                        {i === 3 && totals.completed_payouts}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payouts List */}
        <div className="space-y-6">
          {loading && (
            <Card aria-hidden="true">
              <CardHeader>
                <div className="animate-pulse h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="animate-pulse h-3 w-64 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0,1,2].map((k)=>(
                    <div key={k} className="text-center">
                      <div className="h-3 w-24 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 rounded mx-auto animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {payoutsFiltered.map((payout, idx) => (
            <Card key={payout.id} className={idx % 2 === 1 ? 'bg-gray-50/50' : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{payout.event_title}</CardTitle>
                    <CardDescription>
                      {payout.donation_count} donations • Created {formatDate(payout.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadge(payout.payout_status)}>
                    {payout.payout_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Raised</p>
                    <p className="text-2xl font-bold text-gray-900">{`$${(payout.total_gross_cents/100).toFixed(2)}`}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Platform Fees</p>
                    <p className="text-2xl font-bold text-red-600">{`$${(payout.total_fees_cents/100).toFixed(2)}`}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Your Earnings</p>
                    <p className="text-2xl font-bold text-green-600">{`$${(payout.total_net_cents/100).toFixed(2)}`}</p>
                  </div>
                </div>

                {/* Cash Out */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Prefer cash out via PayPal, Venmo, or ACH? You can request a cash out after your event is over. Manual processing applies.
                  </div>
                  <div className="flex items-center gap-2">
                    {(payout.payout_status !== 'requested' && payout.payout_status !== 'completed') && (
                      <Button variant="outline" size="sm" onClick={() => setCashoutOpen(payout.id)} aria-label={`Request cash out for ${payout.event_title}`}>
                        Request Cash Out
                      </Button>
                    )}
                    <Button variant="outline" size="sm" aria-label={`View details for ${payout.event_title}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status informational banners */}
                {payout.payout_status === 'completed' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Payout Completed</p>
                        <p className="text-sm text-green-600">
                          {payout.payout_method} • {payout.payout_reference}
                        </p>
                        <p className="text-sm text-green-600">
                          Paid on {payout.payout_date ? formatDate(payout.payout_date) : 'Unknown'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" aria-label={`View payout details for ${payout.event_title}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                )}

                {payout.payout_status === 'pending' && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your payout is being processed. You&apos;ll receive an email notification once it&apos;s completed.
                    </p>
                  </div>
                )}

                {payout.payout_status === 'requested' && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Cash Out Requested</p>
                        <p className="text-sm text-purple-700">Method: {payout.payout_method?.toUpperCase() || '—'}{payout.payout_reference ? ` • ${payout.payout_reference}` : ''}</p>
                        <p className="text-xs text-purple-700 mt-1">We&apos;ll review and process this request manually. You&apos;ll receive a confirmation once it&apos;s sent.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCashoutOpen(payout.id)} aria-label={`Update cash out request for ${payout.event_title}`}>
                        Update Request
                      </Button>
                    </div>
                  </div>
                )}

                {cashoutOpen === payout.id && (
                  <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setCashoutOpen(null)} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden" role="dialog" aria-modal="true">
                        <div className="px-5 pt-4 pb-5">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Request Cash Out</h3>
                          <p className="text-sm text-gray-600 mb-4">Cash out is not automated yet. We will process requests manually via your selected method.</p>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Method</label>
                              <select
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={cashoutMethod}
                                onChange={(e) => setCashoutMethod(e.target.value as any)}
                              >
                                <option value="paypal">PayPal</option>
                                <option value="venmo">Venmo</option>
                                <option value="ach">ACH (Bank Transfer)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Contact Email</label>
                              <input
                                type="email"
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                value={cashoutEmail}
                                onChange={(e)=>setCashoutEmail(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="mt-5 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={()=>setCashoutOpen(null)}>Cancel</Button>
                            <Button size="sm" onClick={()=>submitCashout(payout.id)} disabled={cashoutSubmitting || !cashoutEmail}>
                              {cashoutSubmitting ? 'Submitting…' : 'Submit Request'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {payoutsFiltered.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payouts Found</h3>
                <p className="text-gray-600">
                  {showEligibleOnly ? 'No payouts currently eligible for cash out.' : 'Once your events start receiving donations, your payouts will appear here.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
