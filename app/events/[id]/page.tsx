'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/layout/navigation'
import { 
  Heart, 
  Share2, 
  Calendar, 
  MapPin,
  Users,
  Clock,
  Ticket,
  Star,
  CheckCircle,
  Sparkles,
  Gift,
  Award,
  Shield,
  Zap,
  Target,
  Bell,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/app/providers'
import { DonationConfirmation } from '@/components/payments/donation-confirmation'
import { EventRegistration } from '@/components/events/event-registration'
import { VolunteerShifts } from '@/components/events/volunteer-shifts'

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  location: string
  goal_amount?: number
  is_public?: boolean
  image_url?: string
  organizer_id?: string
  created_by?: string
}

export default function EventDetailPage() {
  const params = useParams() as { id?: string } | null
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [showCreatedBanner, setShowCreatedBanner] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({ title: '', description: '', location: '', start_date: '', end_date: '' })
  const [shareOpen, setShareOpen] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const [shareSending, setShareSending] = useState(false)
  const [donationAmount, setDonationAmount] = useState<number>(25)
  const [publishing, setPublishing] = useState(false)
  const [registrations, setRegistrations] = useState<any[] | null>(null)
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const id = typeof params?.id === 'string' ? params.id : ''
        if (!id) return
        const response = await fetch(`/api/events/${id}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data.event)
          setDraft({
            title: data.event?.title || '',
            description: data.event?.description || '',
            location: data.event?.location || '',
            start_date: data.event?.start_date ? new Date(data.event.start_date).toISOString().slice(0,10) : '',
            end_date: data.event?.end_date ? new Date(data.event.end_date).toISOString().slice(0,10) : '',
          })
          if (searchParams?.get('created') === '1') {
            setShowCreatedBanner(true)
            toast.success('Your event is live! Share it with your community.')
          }
        } else {
          console.error('Failed to fetch event:', response.statusText)
          setEvent(null)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        setEvent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params, searchParams])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRaisedAmount = (ev: any): number => {
    if (!ev) return 0
    const val = ev.total_raised ?? ev.amount_raised ?? ev.raised ?? 0
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Join ${event?.title} on EventraiseHub`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const updateEvent = async () => {
    if (!event) return
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          location: draft.location,
          start_date: draft.start_date || undefined,
          end_date: draft.end_date || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update')
      setEvent(json.data?.event || json.event)
      toast.success('Event updated')
      setEditMode(false)
    } catch (e: any) {
      toast.error(e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (next: boolean) => {
    if (!event) return
    setPublishing(true)
    try {
      const res = await fetch(`/api/events/${event.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: next }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update publish status')
      setEvent(json.event)
      toast.success(next ? 'Published' : 'Unpublished')
    } catch (e: any) {
      toast.error(e.message || 'Publish toggle failed')
    } finally {
      setPublishing(false)
    }
  }

  const fetchRegistrations = async () => {
    if (!event) return
    setRegLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}/registrations`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load registrations')
      setRegistrations(json.registrations || [])
    } catch (e:any) {
      setRegistrations([])
    } finally {
      setRegLoading(false)
    }
  }

  const deleteEvent = async () => {
    if (!event) return
    if (!confirm('Delete this event? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete')
      toast.success('Event deleted')
      window.location.href = '/events'
    } catch (e: any) {
      toast.error(e.message || 'Delete failed')
    }
  }

  const sendDonationInvite = async () => {
    if (!params?.id) return
    if (!shareEmail) {
      toast.error('Recipient email required')
      return
    }
    setShareSending(true)
    try {
      const res = await fetch('/api/donations/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: shareEmail, eventId: (params as any)?.id, message: shareMsg }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send')
      toast.success('Donation link sent')
      setShareOpen(false)
      setShareEmail('')
      setShareMsg('')
    } catch (e: any) {
      toast.error(e.message || 'Failed to send donation link')
    } finally {
      setShareSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreatedBanner && (
          <div className="mb-6 p-4 rounded-lg border-2 border-green-200 bg-green-50 flex items-start justify-between">
            <div>
              <p className="text-green-800 font-semibold">Your campaign is live!</p>
              <p className="text-green-700 text-sm">Share the link below to start accepting donations.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShare} variant="outline" className="border-2">Share</Button>
              <Button onClick={()=> setShowCreatedBanner(false)} variant="ghost">Dismiss</Button>
            </div>
          </div>
        )}
        {showCreatedBanner && (
          <div className="mb-6 alert-success flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Your campaign is live!</p>
              <p className="text-green-700 text-sm">Share it now or manage it from My Campaigns.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare} className="border-green-600 text-green-700 hover:bg-green-50">Share</Button>
              <Link href="/events/mine">
                <Button>My Campaigns</Button>
              </Link>
              <Button variant="outline" onClick={()=>setShowCreatedBanner(false)} className="border-green-600 text-green-700 hover:bg-green-50">Dismiss</Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="event-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editMode ? (
                      <div className="space-y-4">
                        <input 
                          value={draft.title} 
                          onChange={(e)=>setDraft({...draft,title:e.target.value})} 
                          className="input text-lg font-semibold"
                          placeholder="Campaign title"
                        />
                        <textarea 
                          value={draft.description} 
                          onChange={(e)=>setDraft({...draft,description:e.target.value})} 
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Campaign description"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <input type="date" value={draft.start_date} onChange={(e)=>setDraft({...draft,start_date:e.target.value})} className="input min-h-[44px]" />
                          <input type="date" value={draft.end_date} onChange={(e)=>setDraft({...draft,end_date:e.target.value})} className="input min-h-[44px]" />
                          <input value={draft.location} onChange={(e)=>setDraft({...draft,location:e.target.value})} placeholder="Location" className="input min-h-[44px]" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={updateEvent} disabled={saving}>{saving?'Saving…':'Save'}</Button>
                          <Button variant="outline" onClick={()=>setEditMode(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{event.title}</CardTitle>
                          {('is_published' in (event as any)) && (
                            (event as any).is_published ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Published</span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">Draft</span>
                            )
                          )}
                        </div>
                        <div className="h-2 mb-2" />
                      </>
                    )}
                    {event.goal_amount && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center mb-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full mr-3">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-blue-700 font-medium text-sm uppercase tracking-wide">Fundraising Goal</p>
                            <p className="text-2xl font-bold text-blue-900">${event.goal_amount.toLocaleString()}</p>
                          </div>
                        </div>
                        {/* Thermometer */}
                        <div className="w-full bg-white border border-blue-200 rounded-full h-3 overflow-hidden">
                          {(() => {
                            const raised = getRaisedAmount(event)
                            const goal = Number(event.goal_amount) || 0
                            const pct = goal > 0 ? Math.min(100, Math.max(0, Math.round((raised / goal) * 100))) : 0
                            return (
                              <div className="h-full bg-blue-500 transition-all" style={{ width: pct + '%' }} />
                            )
                          })()}
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-blue-800">
                          <span>Raised ${getRaisedAmount(event).toLocaleString()}</span>
                          <span>{(() => {
                            const goal = Number(event.goal_amount) || 0
                            const pct = goal > 0 ? Math.min(100, Math.max(0, Math.round((getRaisedAmount(event) / goal) * 100))) : 0
                            return pct
                          })()}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button onClick={handleShare} variant="outline" className="hover:bg-blue-50 transition-colors">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {editMode ? null : (
                      <>
                        {user && event && (user.id === (event.organizer_id || event.created_by)) && (
                          <div className="flex gap-2 ml-auto">
                            <Button variant="outline" onClick={()=>setEditMode(true)} className="hover:bg-gray-50 transition-colors">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" onClick={deleteEvent} className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 transition-colors">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button variant="outline" onClick={()=>togglePublish(!(event as any).is_published)} disabled={publishing} className="hover:bg-gray-50 transition-colors">
                              {(event as any).is_published ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button variant="outline" onClick={fetchRegistrations} className="hover:bg-gray-50 transition-colors">
                              View Registrations
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Description</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{event.description}</p>
                </div>
                
                {/* Campaign Details */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Campaign Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mr-4">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Campaign Period</p>
                      <p className="text-blue-900 font-bold text-lg">{formatDate(event.start_date)} - {formatDate(event.end_date)}</p>
                    </div>
                  </div>
                  {event.goal_amount && (
                    <div className="flex items-center p-5 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 shadow-sm">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mr-4">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Fundraising Goal</p>
                        <p className="text-green-900 font-bold text-lg">${event.goal_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center p-5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 shadow-sm">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mr-4">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Campaign Type</p>
                      <p className="text-purple-900 font-bold text-lg">
                        {(() => {
                          const map: Record<string, string> = {
                            walkathon: 'Walk-a-thon',
                            auction: 'Auction',
                            product_sale: 'Product Sale',
                            direct_donation: 'Direct Donation',
                            raffle: 'Raffle',
                          }
                          return map[event.event_type] || 'Event'
                        })()}
                      </p>
                    </div>
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right rail: type-specific CTAs */}
          <div className="space-y-6">
            {event.event_type === 'direct_donation' ? (
              <Card className="event-card">
                <CardHeader>
                  <CardTitle className="text-gray-900">Make a Donation</CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose your donation amount and support this cause
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Quick Donation Amounts */}
                  <div className="mb-6">
                    <p className="text-gray-700 mb-3 font-medium">Choose Amount</p>
                    <div className="flex flex-wrap items-center gap-2 mb-4 overflow-hidden">
                      {[1,10,25,50,100].map(v => (
                        <Button 
                          key={v}
                          variant={donationAmount===v ? 'default' : 'outline'}
                          onClick={()=>setDonationAmount(v)}
                          className="min-h-[44px] px-4"
                        >
                          ${'{'}v{'}'}
                        </Button>
                      ))}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-gray-600 text-sm font-medium whitespace-nowrap">Custom</span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={donationAmount}
                          onChange={(e)=>setDonationAmount(Math.max(1, Number(e.target.value)))}
                          className="input w-20 sm:w-24 min-h-[44px] text-base"
                          placeholder="$1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-4">Using EventraiseHUB is free. A platform fee of 8.99% applies to donations received (plus Braintree processing fees).</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="donorName" className="text-gray-700 font-medium">Your Name (Optional)</Label>
                      <Input
                        id="donorName"
                        type="text"
                        placeholder="Enter your name"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorEmail" className="text-gray-700 font-medium">Your Email (Optional)</Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donorMessage" className="text-gray-700 font-medium">Message (Optional)</Label>
                      <textarea
                        id="donorMessage"
                        placeholder="Leave a message of support..."
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Donation Amount</span>
                        <span className="text-gray-900 font-semibold">${'{'}donationAmount{'}'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Platform Fee (8.99%)</span>
                        <span className="text-gray-900 font-semibold">${'{'}(donationAmount * 0.0899).toFixed(2){'}'}</span>
                      </div>
                      <div className="border-t border-blue-300 mt-2 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-bold">Total Charged</span>
                          <span className="text-blue-600 font-bold text-lg">
                    ${'{'}(donationAmount + (donationAmount * 0.0899)).toFixed(2){'}'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={async()=>{
                        try {
                          const res = await fetch('/api/donations/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              amount: donationAmount, 
                              eventId: (params as any)?.id,
                              donor_name: donorName,
                              donor_email: donorEmail,
                              message: donorMessage
                            }),
                          })
                          const json = await res.json()
                          if (!res.ok) throw new Error(json.error || 'Failed to start checkout')
                          window.location.href = json.url
                        } catch (e:any) {
                          toast.error(e.message || 'Unable to start checkout')
                        }
                      }}
                      className="w-full"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Donate ${'{'}donationAmount{'}'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="event-card">
                <CardHeader>
                  <CardTitle className="text-gray-900">RSVP</CardTitle>
                  <CardDescription className="text-gray-600">
                    Reserve your spot for this event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rsvpName" className="text-gray-700 font-medium">Your Name</Label>
                      <Input id="rsvpName" type="text" value={donorName} onChange={(e)=>setDonorName(e.target.value)} className="input" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rsvpEmail" className="text-gray-700 font-medium">Your Email</Label>
                      <Input id="rsvpEmail" type="email" value={donorEmail} onChange={(e)=>setDonorEmail(e.target.value)} className="input" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rsvpQty" className="text-gray-700 font-medium">Quantity</Label>
                      <input id="rsvpQty" type="number" min={1} defaultValue={1} className="input w-24" />
                    </div>
                    <Button className="w-full" onClick={async()=>{
                      try {
                        const qtyEl = document.getElementById('rsvpQty') as HTMLInputElement | null
                        const qty = Math.max(1, Number(qtyEl?.value || 1))
                        const res = await fetch(`/api/events/${event.id}/register`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: donorName, email: donorEmail, quantity: qty, type: 'rsvp' })
                        })
                        const json = await res.json()
                        if (!res.ok) throw new Error(json.error || 'Registration failed')
                        toast.success('RSVP confirmed!')
                      } catch (e:any) {
                        toast.error(e.message || 'Unable to RSVP')
                      }
                    }}>Reserve Spot</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Owner registrations table */}
            {user && event && (user.id === (event.organizer_id || event.created_by)) && (
              <Card className="event-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900">Registrations</CardTitle>
                      <CardDescription className="text-gray-600">Owner-only view</CardDescription>
                    </div>
                    <a href={`/api/events/${event.id}/registrations/csv`} className="text-sm text-blue-600 hover:underline">Export CSV</a>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={regLoading}>{regLoading ? 'Loading…' : 'Refresh'}</Button>
                    <span className="text-sm text-gray-600">{Array.isArray(registrations) ? registrations.length : 0} total</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-700">
                          <th className="py-2 pr-4">Created</th>
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Email</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Qty</th>
                          <th className="py-2 pr-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(registrations || []).map((r:any) => (
                          <tr key={r.id} className="border-t border-gray-200 text-gray-800">
                            <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString()}</td>
                            <td className="py-2 pr-4">{r.name || r.participant_name || '—'}</td>
                            <td className="py-2 pr-4">{r.email || r.participant_email || '—'}</td>
                            <td className="py-2 pr-4">{r.type}</td>
                            <td className="py-2 pr-4">{r.quantity}</td>
                            <td className="py-2 pr-4">{r.status}</td>
                          </tr>
                        ))}
                        {Array.isArray(registrations) && registrations.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-gray-600">No registrations yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

