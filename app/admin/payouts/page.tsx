'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Donation {
  id: string
  amount_cents: number
  fee_cents: number | null
  net_cents: number | null
  status: string
  settlement_status: string | null
  donor_name: string | null
  donor_email: string | null
  created_at: string
  event_id?: string | null
  campaign_id?: string | null
  braintree_transaction_id?: string | null
}

export default function AdminPayoutsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [eventId, setEventId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [settlement, setSettlement] = useState<'all'|'pending'|'settled'|'failed'>('all')
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [donations, setDonations] = useState<Donation[]>([])
  const [totals, setTotals] = useState({ gross_cents: 0, fee_cents: 0, net_cents: 0, settled_net_cents: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (eventId) params.set('eventId', eventId)
      if (campaignId) params.set('campaignId', campaignId)
      if (settlement !== 'all') params.set('settlement', settlement)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const [donRes, sumRes] = await Promise.all([
        fetch(`/api/payouts/donations?${params.toString()}`),
        fetch(`/api/payouts/summary?${params.toString()}`)
      ])
      const donJson = await donRes.json()
      const sumJson = await sumRes.json()
      if (!donRes.ok) throw new Error(donJson.error || 'Failed to load donations')
      if (!sumRes.ok) throw new Error(sumJson.error || 'Failed to load totals')
      setDonations(donJson.donations || [])
      setTotals(sumJson.totals || { gross_cents: 0, fee_cents: 0, net_cents: 0, settled_net_cents: 0 })
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Starting admin payouts page auth check...')
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 User from auth:', user)
      
      if (!user) {
        console.log('❌ No user found, redirecting to login')
        // Store the intended destination for after login
        localStorage.setItem('redirectAfterLogin', '/admin/payouts')
        router.push('/auth/login')
        return
      }
      
      console.log('✅ User found:', user.email)
      console.log('📊 User metadata:', user.user_metadata)
      console.log('📊 App metadata:', user.app_metadata)
      
      // TEMPORARY: Skip admin check for testing
      console.log('🚧 TEMPORARY: Skipping admin check for testing')
      
      setUser(user)
      fetchData()
    }
    
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toUSD = (cents?: number | null) => `$${(((cents || 0) / 100).toFixed(2))}`

  const exportCSV = () => {
    const headers = ['Date','Donor','Email','Gross','Fee','Net','Status','Settlement','TxnId','EventId','CampaignId']
    const rows = donations.map(d => [
      new Date(d.created_at).toISOString(),
      d.donor_name || '',
      d.donor_email || '',
      (d.amount_cents/100).toFixed(2),
      ((d.fee_cents||0)/100).toFixed(2),
      ((d.net_cents||0)/100).toFixed(2),
      d.status,
      d.settlement_status || '',
      d.braintree_transaction_id || '',
      d.event_id || '',
      d.campaign_id || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'payouts.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-600">View donation totals and export payouts for manual settlement</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter by event or campaign, and settlement status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
                <Input value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="event uuid" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign ID</label>
                <Input value={campaignId} onChange={(e) => setCampaignId(e.target.value)} placeholder="campaign uuid" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Settlement</label>
                <select value={settlement} onChange={(e) => setSettlement(e.target.value as any)} className="input">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="settled">Settled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} disabled={loading}>{loading ? 'Loading...' : 'Apply Filters'}</Button>
              <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
              <Button variant="ghost" onClick={() => {
                const txt = `Gross: ${toUSD(totals.gross_cents)}\nFees: ${toUSD(totals.fee_cents)}\nNet: ${toUSD(totals.net_cents)}\nSettled: ${toUSD(totals.settled_net_cents)}`
                navigator.clipboard.writeText(txt)
              }}>Copy Totals</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Gross</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toUSD(totals.gross_cents)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fees (8.99%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toUSD(totals.fee_cents)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Net</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toUSD(totals.net_cents)}</div>
              <div className="text-sm text-gray-600">Settled: {toUSD(totals.settled_net_cents)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Donor</th>
                    <th className="py-2 pr-4">Gross</th>
                    <th className="py-2 pr-4">Fee</th>
                    <th className="py-2 pr-4">Net</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Settlement</th>
                    <th className="py-2 pr-4">Txn</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="py-2 pr-4">{new Date(d.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{d.donor_name || ''}</td>
                      <td className="py-2 pr-4">{toUSD(d.amount_cents)}</td>
                      <td className="py-2 pr-4">{toUSD(d.fee_cents)}</td>
                      <td className="py-2 pr-4">{toUSD(d.net_cents)}</td>
                      <td className="py-2 pr-4">{d.status}</td>
                      <td className="py-2 pr-4">{d.settlement_status || ''}</td>
                      <td className="py-2 pr-4 truncate max-w-[160px]">{d.braintree_transaction_id || ''}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr>
                      <td className="py-6 text-gray-500" colSpan={8}>No donations found for current filters.</td>
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


