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
  Globe
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
}

export default function EventDetailPage() {
  const params = useParams()
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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
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
          if (searchParams.get('created') === '1') {
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
  }, [params.id, searchParams])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
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
        body: JSON.stringify({ to: shareEmail, eventId: params.id, message: shareMsg }),
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button className="btn-primary">Browse Events</Button>
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                  EventraiseHub
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Browse Events</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreatedBanner && (
          <div className="mb-6 p-4 rounded-lg border border-green-300 bg-green-50 flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold">Your event is live!</p>
              <p className="text-green-700/80 text-sm">Share it now or manage it from My Events.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>Share</Button>
              <Link href="/events/mine">
                <Button className="btn-primary">My Events</Button>
              </Link>
              <Button variant="outline" onClick={()=>setShowCreatedBanner(false)}>Dismiss</Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editMode ? (
                      <div className="space-y-2">
                        <input value={draft.title} onChange={(e)=>setDraft({...draft,title:e.target.value})} className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700" />
                        <textarea value={draft.description} onChange={(e)=>setDraft({...draft,description:e.target.value})} className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input type="date" value={draft.start_date} onChange={(e)=>setDraft({...draft,start_date:e.target.value})} className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700" />
                          <input type="date" value={draft.end_date} onChange={(e)=>setDraft({...draft,end_date:e.target.value})} className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700" />
                          <input value={draft.location} onChange={(e)=>setDraft({...draft,location:e.target.value})} placeholder="Location" className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={updateEvent} disabled={saving} className="btn-primary">{saving?'Saving…':'Save'}</Button>
                          <Button variant="outline" onClick={()=>setEditMode(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-2xl text-white mb-2">{event.title}</CardTitle>
                        <p className="text-gray-300">Direct Donation Campaign</p>
                      </>
                    )}
                    {event.goal_amount && (
                      <div className="flex items-center mt-2">
                        <Target className="h-4 w-4 text-cyan-400 mr-1" />
                        <span className="text-sm text-cyan-400 font-semibold">Goal: ${event.goal_amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleShare} variant="outline" className="text-cyan-400 hover:bg-cyan-500/20">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button className="btn-primary" onClick={async()=>{
                      try {
                        const res = await fetch('/api/donations/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: donationAmount, eventId: params.id }),
                        })
                        const json = await res.json()
                        if (!res.ok) throw new Error(json.error || 'Failed to start checkout')
                        window.location.href = json.url
                      } catch (e:any) {
                        toast.error(e.message || 'Unable to start checkout')
                      }
                    }}>Donate</Button>
                    <Button variant="outline" onClick={()=>setShareOpen(!shareOpen)}>Email Link</Button>
                    {editMode ? null : (
                      <>
                        {user && (
                          <>
                            <Button variant="outline" onClick={()=>setEditMode(true)}>Edit</Button>
                            <Button variant="outline" onClick={deleteEvent} className="text-red-500 border-red-500">Delete</Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">{event.description}</p>
                
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Calendar className="h-5 w-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Campaign Period</p>
                      <p className="text-white font-semibold">{formatDate(event.start_date)} - {formatDate(event.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <MapPin className="h-5 w-5 text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white font-semibold">{event.location || 'Online'}</p>
                    </div>
                  </div>
                  {event.goal_amount && (
                    <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                      <Target className="h-5 w-5 text-cyan-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-400">Fundraising Goal</p>
                        <p className="text-white font-semibold">${event.goal_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Heart className="h-5 w-5 text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Campaign Type</p>
                      <p className="text-white font-semibold">Direct Donation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Donation Form */}
          <div className="space-y-6">
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Support This Campaign</CardTitle>
                <CardDescription className="text-gray-300">
                  Make a direct donation to support this cause
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Quick Donation Amounts */}
                <div className="mb-6">
                  <p className="text-gray-300 mb-2">Quick Donate</p>
                  <div className="flex items-center gap-2 mb-3">
                    {[10,25,50].map(v => (
                      <Button key={v} variant="outline" onClick={()=>setDonationAmount(v)} className={donationAmount===v?"border-cyan-400 text-cyan-400":""}>${v}</Button>
                    ))}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm">Custom</span>
                      <input
                        type="number"
                        min={1}
                        value={donationAmount}
                        onChange={(e)=>setDonationAmount(Math.max(1, Number(e.target.value)))}
                        className="w-24 px-2 py-1 rounded-md bg-gray-800 text-white border border-gray-700"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="donorName" className="text-gray-300">Your Name (Optional)</Label>
                    <Input
                      id="donorName"
                      type="text"
                      placeholder="Enter your name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donorEmail" className="text-gray-300">Your Email (Optional)</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donorMessage" className="text-gray-300">Message (Optional)</Label>
                    <textarea
                      id="donorMessage"
                      placeholder="Leave a message of support..."
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      rows={3}
                    />
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Donation Amount</span>
                      <span className="text-white font-semibold">${donationAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Platform Fee (8.99%)</span>
                      <span className="text-white font-semibold">${(donationAmount * 0.0899).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-600 mt-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">Total Charged</span>
                        <span className="text-cyan-400 font-bold text-lg">
                          ${(donationAmount + (donationAmount * 0.0899)).toFixed(2)}
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
                            eventId: params.id,
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
                    className="w-full btn-primary"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Donate ${donationAmount}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Info */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Campaign Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Campaign Type</span>
                    <span className="text-cyan-400 font-bold">Direct Donation</span>
                  </div>
                  {event.goal_amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Fundraising Goal</span>
                      <span className="text-white font-bold">${event.goal_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Campaign Period</span>
                    <span className="text-white font-bold">
                      {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
