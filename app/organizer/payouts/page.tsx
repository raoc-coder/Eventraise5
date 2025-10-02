'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
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
      fetchPayouts()
    })
  }, [router, fetchPayouts])

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
          <h1 className="text-3xl font-bold text-gray-900">My Payouts</h1>
          <p className="text-gray-600 mt-2">Track your event payouts and earnings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Raised</p>
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
                  <p className="text-sm font-medium text-gray-600">Platform Fees</p>
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
                  <p className="text-sm font-medium text-gray-600">Net Earnings</p>
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
                  <p className="text-sm font-medium text-gray-600">Completed Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{totals.completed_payouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts List */}
        <div className="space-y-6">
          {payouts.map((payout) => (
            <Card key={payout.id}>
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
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(payout.total_gross_cents)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Platform Fees</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(payout.total_fees_cents)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Your Earnings</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(payout.total_net_cents)}</p>
                  </div>
                </div>
                
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
                      <Button variant="outline" size="sm">
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
              </CardContent>
            </Card>
          ))}

          {payouts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payouts Yet</h3>
                <p className="text-gray-600">
                  Once your events start receiving donations, your payouts will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
