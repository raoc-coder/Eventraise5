'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gavel, Plus, ExternalLink, BarChart3, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Auction = {
  id: string
  title: string
  slug: string
  status: string
  mode: string
  anti_snipe_enabled: boolean
  created_at: string
}

type Lot = {
  id: string
  title: string
  description: string | null
  starting_bid_cents: number
  min_increment_cents: number
  current_high_bid_cents: number
  closes_at: string
  status: string
}

type EventInfo = {
  id: string
  title: string
}

function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function defaultClosesAtLocal() {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AuctionManagePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id as string

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateAuction, setShowCreateAuction] = useState(false)
  const [showCreateLot, setShowCreateLot] = useState(false)

  const [auctionForm, setAuctionForm] = useState({
    title: '',
    slug: '',
    mode: 'silent' as 'silent' | 'live',
    antiSnipeEnabled: true,
    publishNow: true,
  })

  const [lotForm, setLotForm] = useState({
    title: '',
    description: '',
    startingBid: '25',
    minIncrement: '5',
    closesAt: defaultClosesAtLocal(),
    status: 'open' as 'open' | 'draft',
  })

  const fetchEvent = useCallback(async () => {
    if (!eventId) return
    try {
      const res = await fetch(`/api/events/${eventId}`)
      if (res.ok) {
        const data = await res.json()
        setEvent(data.event)
      }
    } catch {
      toast.error('Failed to load event')
    }
  }, [eventId])

  const fetchAuctions = useCallback(async () => {
    if (!eventId) return
    try {
      const res = await fetch(`/api/events/${eventId}/auctions`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load auctions')
      setAuctions(data.auctions || [])
      setSelectedId((prev) => prev ?? data.auctions?.[0]?.id ?? null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load auctions'
      if (msg === 'unauthorized' || msg === 'forbidden') {
        toast.error('Sign in as the event organizer to manage auctions')
        router.push('/auth/login')
        return
      }
      toast.error(msg)
    }
  }, [eventId, router])

  const fetchLots = useCallback(async () => {
    if (!eventId || !selectedId) {
      setLots([])
      return
    }
    try {
      const res = await fetch(`/api/events/${eventId}/auctions/${selectedId}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load lots')
      setLots(data.lots || [])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load lots')
      setLots([])
    }
  }, [eventId, selectedId])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    Promise.all([fetchEvent(), fetchAuctions()]).finally(() => setLoading(false))
  }, [eventId, fetchEvent, fetchAuctions])

  useEffect(() => {
    fetchLots()
  }, [fetchLots])

  const createAuction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${eventId}/auctions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: auctionForm.title.trim(),
          slug: auctionForm.slug.trim() || undefined,
          mode: auctionForm.mode,
          antiSnipeEnabled: auctionForm.antiSnipeEnabled,
          status: auctionForm.publishNow ? 'published' : 'draft',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const hint =
          data.error === 'slug_taken'
            ? 'That URL slug is already used on this event. Try a different slug.'
            : data.message || data.error || 'Failed to create auction'
        throw new Error(hint)
      }
      toast.success('Auction created')
      setShowCreateAuction(false)
      setAuctionForm({
        title: '',
        slug: '',
        mode: 'silent',
        antiSnipeEnabled: true,
        publishNow: true,
      })
      await fetchAuctions()
      if (data.auction?.id) setSelectedId(data.auction.id)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create auction')
    } finally {
      setSaving(false)
    }
  }

  const toggleAuctionPublish = async (auction: Auction) => {
    if (!eventId) return
    const next = auction.status === 'published' ? 'draft' : 'published'
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${eventId}/auctions/${auction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      toast.success(next === 'published' ? 'Auction published' : 'Auction unpublished')
      await fetchAuctions()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const createLot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    const starting = parseFloat(lotForm.startingBid)
    const increment = parseFloat(lotForm.minIncrement)
    if (!Number.isFinite(starting) || starting < 0) {
      toast.error('Enter a valid starting bid')
      return
    }
    if (!Number.isFinite(increment) || increment <= 0) {
      toast.error('Enter a valid bid increment')
      return
    }
    if (!lotForm.closesAt) {
      toast.error('Set a close date and time')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/auctions/${selectedId}/lots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: lotForm.title.trim(),
          description: lotForm.description.trim() || null,
          startingBidCents: Math.round(starting * 100),
          minIncrementCents: Math.round(increment * 100),
          closesAt: new Date(lotForm.closesAt).toISOString(),
          status: lotForm.status,
          displayOrder: lots.length,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to create lot')
      toast.success('Lot added')
      setShowCreateLot(false)
      setLotForm({
        title: '',
        description: '',
        startingBid: '25',
        minIncrement: '5',
        closesAt: defaultClosesAtLocal(),
        status: 'open',
      })
      await fetchLots()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create lot')
    } finally {
      setSaving(false)
    }
  }

  const selectedAuction = auctions.find((a) => a.id === selectedId) ?? null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Gavel className="h-8 w-8 text-trust-700" />
              Auction Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage mobile auctions for{' '}
              <span className="font-medium">{event?.title ?? 'your event'}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>
              Back to Event
            </Button>
            <Dialog open={showCreateAuction} onOpenChange={setShowCreateAuction}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Auction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create auction</DialogTitle>
                  <DialogDescription>
                    Bidders will register and vault PayPal at /auctions/[id]/register
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createAuction} className="space-y-4">
                  <div>
                    <Label htmlFor="auction-title">Title</Label>
                    <Input
                      id="auction-title"
                      value={auctionForm.title}
                      onChange={(e) => setAuctionForm({ ...auctionForm, title: e.target.value })}
                      placeholder="Silent Auction 2026"
                      required
                      minLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="auction-slug">URL slug (optional)</Label>
                    <Input
                      id="auction-slug"
                      value={auctionForm.slug}
                      onChange={(e) => setAuctionForm({ ...auctionForm, slug: e.target.value })}
                      placeholder="silent-auction-2026"
                    />
                  </div>
                  <div>
                    <Label htmlFor="auction-mode">Mode</Label>
                    <select
                      id="auction-mode"
                      value={auctionForm.mode}
                      onChange={(e) =>
                        setAuctionForm({
                          ...auctionForm,
                          mode: e.target.value as 'silent' | 'live',
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="silent">Silent</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={auctionForm.antiSnipeEnabled}
                      onChange={(e) =>
                        setAuctionForm({ ...auctionForm, antiSnipeEnabled: e.target.checked })
                      }
                    />
                    Anti-snipe (extend lots in final minute)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={auctionForm.publishNow}
                      onChange={(e) =>
                        setAuctionForm({ ...auctionForm, publishNow: e.target.checked })
                      }
                    />
                    Publish immediately (requires parent event to be published too)
                  </label>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Creating…' : 'Create auction'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {auctions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No auctions yet</CardTitle>
              <CardDescription>
                Create an auction to add lots and share bidding links with your guests.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your auctions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auctions.map((auction) => (
                  <div
                    key={auction.id}
                    className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
                      selectedId === auction.id ? 'border-trust-500 bg-trust-50' : 'border-gray-200'
                    }`}
                  >
                    <button
                      type="button"
                      className="text-left flex-1"
                      onClick={() => setSelectedId(auction.id)}
                    >
                      <p className="font-semibold text-gray-900">{auction.title}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">{auction.mode}</Badge>
                        <Badge
                          className={
                            auction.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {auction.status}
                        </Badge>
                      </div>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={saving}
                        onClick={() => toggleAuctionPublish(auction)}
                      >
                        {auction.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      {auction.status === 'published' && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/auctions/${auction.id}`} target="_blank">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Catalog
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedAuction && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Lots — {selectedAuction.title}</CardTitle>
                      <CardDescription>
                        Lots must be <strong>open</strong> with a future close time for bidding.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/auctions/${selectedAuction.id}/register`} target="_blank">
                          <Users className="h-3 w-3 mr-1" />
                          Register
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/auctions/${selectedAuction.id}/organizer`} target="_blank">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Stats
                        </Link>
                      </Button>
                      <Dialog open={showCreateLot} onOpenChange={setShowCreateLot}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Add lot
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add auction lot</DialogTitle>
                            <DialogDescription>
                              Set starting bid, increment, and when the lot closes.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={createLot} className="space-y-4">
                            <div>
                              <Label htmlFor="lot-title">Lot title</Label>
                              <Input
                                id="lot-title"
                                value={lotForm.title}
                                onChange={(e) => setLotForm({ ...lotForm, title: e.target.value })}
                                placeholder="Wine basket"
                                required
                                minLength={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lot-desc">Description (optional)</Label>
                              <Input
                                id="lot-desc"
                                value={lotForm.description}
                                onChange={(e) =>
                                  setLotForm({ ...lotForm, description: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="lot-start">Starting bid ($)</Label>
                                <Input
                                  id="lot-start"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={lotForm.startingBid}
                                  onChange={(e) =>
                                    setLotForm({ ...lotForm, startingBid: e.target.value })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="lot-inc">Min increment ($)</Label>
                                <Input
                                  id="lot-inc"
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={lotForm.minIncrement}
                                  onChange={(e) =>
                                    setLotForm({ ...lotForm, minIncrement: e.target.value })
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="lot-closes">Closes at</Label>
                              <Input
                                id="lot-closes"
                                type="datetime-local"
                                value={lotForm.closesAt}
                                onChange={(e) =>
                                  setLotForm({ ...lotForm, closesAt: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="lot-status">Status</Label>
                              <select
                                id="lot-status"
                                value={lotForm.status}
                                onChange={(e) =>
                                  setLotForm({
                                    ...lotForm,
                                    status: e.target.value as 'open' | 'draft',
                                  })
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                              >
                                <option value="open">Open (accept bids)</option>
                                <option value="draft">Draft (hidden from bidding)</option>
                              </select>
                            </div>
                            <Button type="submit" className="w-full" disabled={saving}>
                              {saving ? 'Saving…' : 'Add lot'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lots.length === 0 ? (
                    <p className="text-gray-600 text-sm">No lots yet. Add your first item above.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {lots.map((lot) => (
                        <li key={lot.id} className="py-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{lot.title}</p>
                            <p className="text-sm text-gray-600">
                              Start {usd(lot.starting_bid_cents)} · High{' '}
                              {usd(lot.current_high_bid_cents || lot.starting_bid_cents)} · Closes{' '}
                              {new Date(lot.closes_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                lot.status === 'open'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {lot.status}
                            </Badge>
                            {selectedAuction.status === 'published' && lot.status === 'open' && (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/auctions/${selectedAuction.id}/lots/${lot.id}`} target="_blank">
                                  Bid page
                                </Link>
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className="mt-6 border-trust-200 bg-trust-50">
          <CardHeader>
            <CardTitle className="text-base">Before going live</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-trust-900 space-y-2">
            <p>1. Publish your parent event on the event page.</p>
            <p>2. Publish the auction here (status: published).</p>
            <p>3. Add lots with status <strong>open</strong> and a future close time.</p>
            <p>4. Share /auctions/[id] with bidders — they must register and vault PayPal once.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
