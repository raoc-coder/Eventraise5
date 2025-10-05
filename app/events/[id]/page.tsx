'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/layout/navigation'
import { PayPalDonationButton } from '@/lib/paypal-client'
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
import { supabase } from '@/lib/supabase'
import { EventRegistration } from '@/components/events/event-registration'
import { VolunteerShifts } from '@/components/events/volunteer-shifts'
import { TicketPurchase } from '@/components/events/ticket-purchase'

// Use shared Supabase client to avoid multiple GoTrue instances

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
  is_ticketed?: boolean
  ticket_price?: number
  ticket_currency?: string
  ticket_quantity?: number
  tickets_sold?: number
}

export default function EventDetailPage() {
  const params = useParams() as { id?: string } | null
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
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
  const [regPage, setRegPage] = useState(1)
  const [regTotal, setRegTotal] = useState(0)
  const [regPageSize, setRegPageSize] = useState(25)
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [donationTotal, setDonationTotal] = useState<number>(0)
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  // Volunteers
  const [volunteerShifts, setVolunteerShifts] = useState<any[]>([])
  const [volunteerLoading, setVolunteerLoading] = useState(false)
  const [volunteerName, setVolunteerName] = useState('')
  const [volunteerEmail, setVolunteerEmail] = useState('')
  const [volunteerPhone, setVolunteerPhone] = useState('')
  const [creatingVolunteerAsk, setCreatingVolunteerAsk] = useState(false)
  // Modal state for unified action modal
  const [activeModal, setActiveModal] = useState<'rsvp' | 'volunteer' | 'donation' | null>(null)

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null)
        } else if (analytics) {
          setAnalytics(null)
        } else if (registrations) {
          setRegistrations(null)
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [activeModal, analytics, registrations])


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRaisedAmount = (ev: any): number => {
    if (!ev) return 0
    // Use the real-time donation total if available, otherwise fall back to event fields
    if (donationTotal > 0) return donationTotal
    const val = ev.total_raised ?? ev.amount_raised ?? ev.raised ?? ev.donations_total ?? 0
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }

  const fetchDonationTotal = useCallback(async () => {
    if (!event?.id) return
    try {
      // Always try to get auth token first
      let authToken: string | null = null
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession()
          authToken = data.session?.access_token || null
        }
      } catch (authError) {
        console.warn('Failed to get auth token:', authError)
      }

      // Make request with auth token if available
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`
      }

      const response = await fetch(`/api/events/${event.id}/analytics`, { 
        credentials: 'include',
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.revenue?.total) {
          setDonationTotal(data.revenue.total)
        }
      } else if (response.status === 401) {
        toast.error('Please log in to view analytics')
      } else if (response.status === 403) {
        toast.error('You must be the event owner or admin to view analytics')
      }
    } catch (error) {
      console.error('Failed to fetch donation total:', error)
    }
  }, [event?.id])

  const fetchTickets = useCallback(async () => {
    if (!event?.id) return
    setTicketsLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}/tickets`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to fetch tickets:', response.statusText, errorData)
        setTickets([])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setTickets([])
    } finally {
      setTicketsLoading(false)
    }
  }, [event?.id])

  const fetchVolunteerShifts = useCallback(async () => {
    if (!event?.id) return
    setVolunteerLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}/volunteer-shifts`, { cache: 'no-store' })
      if (!res.ok) {
        setVolunteerShifts([])
        return
      }
      const json = await res.json()
      setVolunteerShifts(Array.isArray(json.shifts) ? json.shifts : [])
    } catch {
      setVolunteerShifts([])
    } finally {
      setVolunteerLoading(false)
    }
  }, [event?.id])

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
          // Fetch donation total, tickets, and volunteer shifts after event is loaded
          setTimeout(() => {
            fetchDonationTotal()
            fetchTickets()
            fetchVolunteerShifts()
          }, 100)
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
  }, [params, searchParams, fetchDonationTotal, fetchTickets, fetchVolunteerShifts])

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

  const fetchRegistrations = async (page = 1, pageSize = 25, filters: any = {}) => {
    if (!event) return
    setRegLoading(true)
    try {
      const sp = new URLSearchParams()
      if (filters.type) sp.set('type', filters.type)
      if (filters.from) sp.set('from', filters.from)
      if (filters.to) sp.set('to', filters.to)
      sp.set('page', String(page))
      sp.set('pageSize', String(pageSize))
      const res = await fetch(`/api/events/${event.id}/registrations?${sp.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load registrations')
      setRegistrations(json.registrations || [])
      setRegTotal(json.total || 0)
      setRegPage(json.page || 1)
      setRegPageSize(json.pageSize || 25)
    } catch (e:any) {
      setRegistrations([])
      setRegTotal(0)
      setRegPage(1)
    } finally {
      setRegLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    if (!event?.id) return
    setAnalyticsLoading(true)
    try {
      // Always try to get auth token first
      let authToken: string | null = null
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession()
          authToken = data.session?.access_token || null
        }
      } catch (authError) {
        console.warn('Failed to get auth token:', authError)
      }

      // Make request with auth token if available
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`
      }

      const res = await fetch(`/api/events/${event.id}/analytics`, { 
        credentials: 'include',
        headers
      })
      
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Please log in to view analytics')
        } else if (res.status === 403) {
          toast.error('You must be the event owner or admin to view analytics')
        } else {
          toast.error(json.error || 'Failed to load analytics')
        }
        throw new Error(json.error || 'Failed to load analytics')
      }
      setAnalytics(json)
    } catch (e:any) {
      setAnalytics(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    if (!event || selectedRegistrations.length === 0) return
    try {
      const res = await fetch(`/api/events/${event.id}/registrations/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_status', 
          registration_ids: selectedRegistrations, 
          status 
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Bulk update failed')
      toast.success(`Updated ${selectedRegistrations.length} registrations`)
      setSelectedRegistrations([])
      fetchRegistrations(regPage, regPageSize)
    } catch (e:any) {
      toast.error(e.message || 'Bulk update failed')
    }
  }

  const deleteEvent = async () => {
    if (!event) return
    if (!confirm('Delete this event? This action cannot be undone.')) return
    
    console.log('Starting delete event:', event.id)
    
    try {
      // Get auth token for the request
      let authToken: string | null = null
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession()
          authToken = data.session?.access_token || null
          console.log('Auth token obtained:', !!authToken)
        }
      } catch (authError) {
        console.error('Failed to get auth token:', authError)
        toast.error('Authentication failed. Please try logging in again.')
        return
      }

      if (!authToken) {
        toast.error('You must be logged in to delete events.')
        return
      }

      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }

      console.log('Making delete request to:', `/api/events/${event.id}`)
      const res = await fetch(`/api/events/${event.id}`, { 
        method: 'DELETE',
        headers
      })
      
      console.log('Delete response status:', res.status)
      const json = await res.json()
      console.log('Delete response:', json)
      
      if (!res.ok) {
        console.error('Delete failed:', json)
        throw new Error(json.error || `Delete failed with status ${res.status}`)
      }
      
      console.log('Delete successful, response data:', json)
      toast.success('Event deleted successfully')
      
      // Force refresh the events list by triggering a storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'event-deleted',
        newValue: event.id,
        url: window.location.href
      }))
      
      // Use router.push instead of window.location to avoid blinking
      setTimeout(() => {
        router.push('/events/mine')
      }, 1000) // Small delay to show success message
    } catch (e: any) {
      console.error('Delete event error:', e)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreatedBanner && (
          <div className="mb-6 p-6 rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg flex items-start justify-between">
            <div>
              <p className="text-green-800 font-semibold">Your event is live!</p>
              <p className="text-green-700 text-sm">Share the link below to start accepting registrations and donations.</p>
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
              <p className="font-semibold text-green-800">Your event is live!</p>
              <p className="text-green-700 text-sm">Share it now or manage it from My Events.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare} className="border-green-600 text-green-700 hover:bg-green-50">Share</Button>
              <Link href="/events/mine">
                <Button>My Events</Button>
              </Link>
              <Button variant="outline" onClick={()=>setShowCreatedBanner(false)} className="border-green-600 text-green-700 hover:bg-green-50">Dismiss</Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-overflow">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
              <Card className="event-card shadow-xl border-0 bg-gradient-to-br from-white to-gray-50" id="donate">
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
                          <Button onClick={updateEvent} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
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
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Event link copied to clipboard!')
                      }} 
                      variant="outline" 
                      className="hover:bg-green-50 transition-colors border-green-200 text-green-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    {editMode ? null : (
                      <>
                        {user && event && (user.id === (event.organizer_id || event.created_by)) && (
                          <div className="flex flex-col sm:flex-row gap-2 ml-auto w-full sm:w-auto">
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <Button variant="outline" onClick={()=>setEditMode(true)} className="hover:bg-gray-50 transition-colors btn-mobile flex-1 sm:flex-none">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button variant="outline" onClick={()=>togglePublish(!(event as any).is_published)} disabled={publishing} className="hover:bg-gray-50 transition-colors btn-mobile flex-1 sm:flex-none">
                                {(event as any).is_published ? 'Unpublish' : 'Publish'}
                              </Button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <Button variant="outline" onClick={() => fetchRegistrations()} className="hover:bg-gray-50 transition-colors btn-mobile flex-1 sm:flex-none">
                                <Users className="h-4 w-4 mr-2" />
                                Registrations
                              </Button>
                              <Button variant="outline" onClick={() => fetchAnalytics()} className="hover:bg-gray-50 transition-colors btn-mobile flex-1 sm:flex-none">
                                <Target className="h-4 w-4 mr-2" />
                                Analytics
                              </Button>
                            </div>
                            <Button variant="outline" onClick={deleteEvent} className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 transition-colors btn-mobile w-full sm:w-auto">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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

          {/* Right rail: Action buttons */}
          <div className="space-y-6">
            <Card className="event-card shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle className="text-gray-900">Get Involved</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose how you&apos;d like to participate in this event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.event_type === 'direct_donation' ? (
                  <Button 
                    onClick={() => setActiveModal('donation')}
                    className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Make a Donation
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => setActiveModal('rsvp')}
                      className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      RSVP to Event
                    </Button>
                    
                    {(event?.is_ticketed || tickets.length > 0) && (
                      <Button 
                        onClick={() => setActiveModal('donation')}
                        className="w-full h-12 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        <Ticket className="h-5 w-5 mr-2" />
                        Purchase Tickets
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => setActiveModal('volunteer')}
                      className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Volunteer
                    </Button>
                    
                    <Button 
                      onClick={() => setActiveModal('donation')}
                      className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Make Donation
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Original content hidden, will be moved to modal */}
            <div className="hidden">
            {event.event_type === 'direct_donation' ? (
              <Card className="event-card" id="donate">
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
                          ${v}
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
                  
                  <p className="text-xs text-gray-600 mb-4">Using EventraiseHUB is free. A platform fee of 8.99% applies to donations received.</p>
                  
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
                        <span className="text-gray-900 font-semibold">${donationAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-blue-300 mt-2 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-bold">You’ll Be Charged</span>
                          <span className="text-blue-600 font-bold text-lg">
                            ${donationAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">Fees are deducted from your donation so the organizer receives the net amount.</p>
                    </div>

                    <div className="space-y-4">
                      <PayPalDonationButton
                        amount={donationAmount}
                        eventId={(params as any)?.id}
                        onSuccess={(orderId) => {
                          toast.success('Donation successful! Thank you for your support.')
                          // Reset form
                          setDonationAmount(1)
                          setDonorName('')
                          setDonorEmail('')
                          setDonorMessage('')
                        }}
                        onError={(error) => {
                          toast.error(error)
                        }}
                        disabled={donationAmount < 1}
                      />
                      
                      {/* PayPal Marks for branding */}
                      <div className="flex items-center justify-center">
                        <img alt="Powered by PayPal" src="https://www.paypalobjects.com/webstatic/mktg/logo/bdg_now_accepting_pp_2line_w.png" className="h-6" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* RSVP Card */}
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

                {/* Ticket Purchase Section */}
                {(event?.is_ticketed || tickets.length > 0) && (
                  <Card id="tickets" className="event-card">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Purchase Tickets</CardTitle>
                      <CardDescription className="text-gray-600">
                        Buy tickets for this event
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ticketsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-4 text-gray-700">Loading tickets...</p>
                        </div>
                      ) : tickets.length === 0 && event?.is_ticketed ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-4">
                            <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Tickets Coming Soon</h3>
                          <p className="text-gray-600 mb-4">
                            Ticket sales for this event haven&apos;t started yet or are temporarily unavailable.
                          </p>
                          <p className="text-sm text-gray-500">
                            Please check back later or contact the event organizer for more information.
                          </p>
                        </div>
                      ) : (
                        <TicketPurchase 
                          event={{
                            id: event.id,
                            title: event.title,
                            description: event.description,
                            start_date: event.start_date,
                            location: event.location,
                            organizer_id: event.organizer_id || event.created_by || ''
                          }}
                          tickets={tickets}
                          onSuccess={() => {
                            toast.success('Tickets purchased successfully!')
                            fetchTickets() // Refresh tickets to update quantities
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Volunteer Opportunities */}
                <Card className="event-card">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Volunteer Opportunities</CardTitle>
                    <CardDescription className="text-gray-600">
                      Lend a hand by signing up for an available shift
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user && (user.id === (event.organizer_id || event.created_by)) && (
                      <div className="mb-6 p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                          <div className="flex-1">
                            <Label htmlFor="newShiftTitle" className="text-gray-700 font-medium">Create a quick volunteer ask</Label>
                            <Input id="newShiftTitle" placeholder="e.g. Yes, I can help!" value={volunteerName} onChange={(e)=>setVolunteerName(e.target.value)} />
                          </div>
                          <Button
                            disabled={creatingVolunteerAsk}
                            onClick={async()=>{
                              const title = volunteerName?.trim()
                              if (!title) { toast.error('Please enter a title'); return }
                              try {
                                setCreatingVolunteerAsk(true)
                                // Retrieve auth token for owner-only action
                                const { data: { session } } = await (supabase as any).auth.getSession()
                                if (!session?.access_token) {
                                  toast.error('Please log in again')
                                  return
                                }
                                const res = await fetch(`/api/events/${event.id}/volunteer-shifts`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`
                                  },
                                  body: JSON.stringify({ title, is_active: true })
                                })
                                const json = await res.json()
                                if (!res.ok) throw new Error(json.error || 'Failed to create')
                                toast.success('Volunteer ask created')
                                setVolunteerName('')
                                fetchVolunteerShifts()
                              } catch (e:any) {
                                toast.error(e.message || 'Unable to create')
                              } finally {
                                setCreatingVolunteerAsk(false)
                              }
                            }}
                          >{creatingVolunteerAsk ? 'Creating…' : 'Create'}</Button>
                        </div>
                        {volunteerShifts.length > 0 && (
                          <div className="mt-3 text-sm text-gray-700">
                            Share link to collect Yes responses:{' '}
                            <Button
                              variant="outline"
                              className="ml-2"
                              onClick={()=>{
                                const url = `${window.location.origin}/events/${event.id}?shift=${encodeURIComponent(volunteerShifts[0].id)}`
                                navigator.clipboard.writeText(url)
                                toast.success('Share link copied to clipboard')
                              }}
                            >Copy share link</Button>
                          </div>
                        )}
                      </div>
                    )}
                    {volunteerLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Loading shifts...</p>
                      </div>
                    ) : volunteerShifts.length === 0 ? (
                      <div className="text-center py-8 text-gray-600">No active volunteer shifts at the moment.</div>
                    ) : (
                      <div className="space-y-4">
                        {volunteerShifts.map((shift:any) => {
                          const spotsLeft = Math.max(0, (shift.max_volunteers || 0) - (shift.current_volunteers || 0))
                          return (
                            <div key={shift.id} className="border rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <div className="font-medium text-gray-900">{shift.title || 'Volunteer Shift'}</div>
                                  <div className="text-sm text-gray-600">
                                    {shift.start_time ? new Date(shift.start_time).toLocaleString() : ''}
                                    {shift.end_time ? ` - ${new Date(shift.end_time).toLocaleTimeString()}` : ''}
                                  </div>
                                  {typeof shift.max_volunteers === 'number' && (
                                    <div className="text-sm text-gray-700 mt-1">{spotsLeft} of {shift.max_volunteers} spots left</div>
                                  )}
                                </div>
                                <div className="w-full sm:w-auto">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <Input placeholder="Full name" value={volunteerName} onChange={(e)=>setVolunteerName(e.target.value)} />
                                    <Input placeholder="Email" type="email" value={volunteerEmail} onChange={(e)=>setVolunteerEmail(e.target.value)} />
                                    <Input placeholder="Phone (optional)" value={volunteerPhone} onChange={(e)=>setVolunteerPhone(e.target.value)} />
                                  </div>
                                  <div className="mt-2 flex justify-end">
                                    <Button
                                      disabled={spotsLeft === 0 || !volunteerName || !volunteerEmail}
                                      onClick={async()=>{
                                        try {
                                          const res = await fetch('/api/events/volunteer-signup', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              shift_id: shift.id,
                                              volunteer_name: volunteerName,
                                              volunteer_email: volunteerEmail,
                                              volunteer_phone: volunteerPhone
                                            })
                                          })
                                          const json = await res.json()
                                          if (!res.ok) throw new Error(json.error || 'Signup failed')
                                          toast.success('Thanks for signing up! We\'ll email you details.')
                                          setVolunteerName('')
                                          setVolunteerEmail('')
                                          setVolunteerPhone('')
                                          fetchVolunteerShifts()
                                        } catch (e:any) {
                                          toast.error(e.message || 'Unable to sign up')
                                        }
                                      }}
                                    >Sign Up</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Optional Donation Card */}
                <Card className="event-card">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Support This Event</CardTitle>
                    <CardDescription className="text-gray-600">
                      Make an optional donation to support this event
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
                            ${v}
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
                    
                    <p className="text-xs text-gray-600 mb-4">Using EventraiseHUB is free. A platform fee of 8.99% applies to donations received.</p>
                    
                    <div className="space-y-4">
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
                          <span className="text-gray-900 font-semibold">${donationAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-blue-300 mt-2 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-bold">You&apos;ll Be Charged</span>
                            <span className="text-blue-600 font-bold text-lg">
                              ${donationAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Fees are deducted from your donation so the organizer receives the net amount.</p>
                      </div>

                      <div className="space-y-4">
                        <PayPalDonationButton
                          amount={donationAmount}
                          eventId={(params as any)?.id}
                          onSuccess={(orderId) => {
                            toast.success('Donation successful! Thank you for your support.')
                            // Reset form
                            setDonationAmount(1)
                            setDonorMessage('')
                          }}
                          onError={(error) => {
                            toast.error(error)
                          }}
                          disabled={donationAmount < 1}
                        />
                        
                        <div className="text-center">
                          <Button 
                            variant="outline"
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
                          Donate ${donationAmount}
                          </Button>
                          {/* Removed legacy Braintree method */}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            </div>

          </div>
        </div>
      </div>

      {/* Unified Action Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveModal(null)
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeModal === 'rsvp' && 'RSVP to Event'}
                    {activeModal === 'volunteer' && 'Volunteer Opportunities'}
                    {activeModal === 'donation' && 'Support This Event'}
                  </h2>
                  <p className="text-gray-600">
                    {activeModal === 'rsvp' && 'Reserve your spot for this event'}
                    {activeModal === 'volunteer' && 'Lend a hand by signing up for an available shift'}
                    {activeModal === 'donation' && 'Make a donation to support this event'}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Close
                </Button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                {activeModal === 'rsvp' && (
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
                        setActiveModal(null)
                      } catch (e:any) {
                        toast.error(e.message || 'Unable to RSVP')
                      }
                    }}>Reserve Spot</Button>
                  </div>
                )}

                {activeModal === 'volunteer' && (
                  <div className="space-y-4">
                    {user && (user.id === (event.organizer_id || event.created_by)) && (
                      <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                          <div className="flex-1">
                            <Label htmlFor="newShiftTitle" className="text-gray-700 font-medium">Create a quick volunteer ask</Label>
                            <Input id="newShiftTitle" placeholder="e.g. Yes, I can help!" value={volunteerName} onChange={(e)=>setVolunteerName(e.target.value)} />
                          </div>
                          <Button
                            disabled={creatingVolunteerAsk}
                            onClick={async()=>{
                              const title = volunteerName?.trim()
                              if (!title) { toast.error('Please enter a title'); return }
                              try {
                                setCreatingVolunteerAsk(true)
                                const { data: { session } } = await (supabase as any).auth.getSession()
                                if (!session?.access_token) {
                                  toast.error('Please log in again')
                                  return
                                }
                                const res = await fetch(`/api/events/${event.id}/volunteer-shifts`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session.access_token}`
                                  },
                                  body: JSON.stringify({ title, is_active: true })
                                })
                                const json = await res.json()
                                if (!res.ok) throw new Error(json.error || 'Failed to create')
                                toast.success('Volunteer ask created')
                                setVolunteerName('')
                                fetchVolunteerShifts()
                              } catch (e:any) {
                                toast.error(e.message || 'Unable to create')
                              } finally {
                                setCreatingVolunteerAsk(false)
                              }
                            }}
                          >{creatingVolunteerAsk ? 'Creating…' : 'Create'}</Button>
                        </div>
                        {volunteerShifts.length > 0 && (
                          <div className="mt-3 text-sm text-gray-700">
                            Share link to collect Yes responses:{' '}
                            <Button
                              variant="outline"
                              className="ml-2"
                              onClick={()=>{
                                const url = `${window.location.origin}/events/${event.id}?shift=${encodeURIComponent(volunteerShifts[0].id)}`
                                navigator.clipboard.writeText(url)
                                toast.success('Share link copied to clipboard')
                              }}
                            >Copy share link</Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {volunteerLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Loading shifts...</p>
                      </div>
                    ) : volunteerShifts.length === 0 ? (
                      <div className="text-center py-8 text-gray-600">No active volunteer shifts at the moment.</div>
                    ) : (
                      <div className="space-y-4">
                        {volunteerShifts.map((shift:any) => {
                          const spotsLeft = Math.max(0, (shift.max_volunteers || 0) - (shift.current_volunteers || 0))
                          return (
                            <div key={shift.id} className="border rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <div className="font-medium text-gray-900">{shift.title || 'Volunteer Shift'}</div>
                                  <div className="text-sm text-gray-600">
                                    {shift.start_time ? new Date(shift.start_time).toLocaleString() : ''}
                                    {shift.end_time ? ` - ${new Date(shift.end_time).toLocaleTimeString()}` : ''}
                                  </div>
                                  {typeof shift.max_volunteers === 'number' && (
                                    <div className="text-sm text-gray-700 mt-1">{spotsLeft} of {shift.max_volunteers} spots left</div>
                                  )}
                                </div>
                                <div className="w-full sm:w-auto">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <Input placeholder="Full name" value={volunteerName} onChange={(e)=>setVolunteerName(e.target.value)} />
                                    <Input placeholder="Email" type="email" value={volunteerEmail} onChange={(e)=>setVolunteerEmail(e.target.value)} />
                                    <Input placeholder="Phone (optional)" value={volunteerPhone} onChange={(e)=>setVolunteerPhone(e.target.value)} />
                                  </div>
                                  <div className="mt-2 flex justify-end">
                                    <Button
                                      disabled={spotsLeft === 0 || !volunteerName || !volunteerEmail}
                                      onClick={async()=>{
                                        try {
                                          const res = await fetch('/api/events/volunteer-signup', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              shift_id: shift.id,
                                              volunteer_name: volunteerName,
                                              volunteer_email: volunteerEmail,
                                              volunteer_phone: volunteerPhone
                                            })
                                          })
                                          const json = await res.json()
                                          if (!res.ok) throw new Error(json.error || 'Signup failed')
                                          toast.success('Thanks for signing up! We\'ll email you details.')
                                          setVolunteerName('')
                                          setVolunteerEmail('')
                                          setVolunteerPhone('')
                                          fetchVolunteerShifts()
                                          setActiveModal(null)
                                        } catch (e:any) {
                                          toast.error(e.message || 'Unable to sign up')
                                        }
                                      }}
                                    >Sign Up</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeModal === 'donation' && (
                  <div className="space-y-4">
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
                            ${v}
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
                    
                    <p className="text-xs text-gray-600 mb-4">Using EventraiseHUB is free. A platform fee of 8.99% applies to donations received.</p>
                    
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
                          <span className="text-gray-900 font-semibold">${donationAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-blue-300 mt-2 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-bold">You&apos;ll Be Charged</span>
                            <span className="text-blue-600 font-bold text-lg">
                              ${donationAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Fees are deducted from your donation so the organizer receives the net amount.</p>
                      </div>

                      <div className="space-y-4">
                        <PayPalDonationButton
                          amount={donationAmount}
                          eventId={(params as any)?.id}
                          onSuccess={(orderId) => {
                            toast.success('Donation successful! Thank you for your support.')
                            // Reset form
                            setDonationAmount(1)
                            setDonorName('')
                            setDonorEmail('')
                            setDonorMessage('')
                            setActiveModal(null)
                          }}
                          onError={(error) => {
                            toast.error(error)
                          }}
                          disabled={donationAmount < 1}
                        />
                        
                        {/* PayPal Marks for branding */}
                        <div className="flex items-center justify-center">
                          <img alt="Powered by PayPal" src="https://www.paypalobjects.com/webstatic/mktg/logo/bdg_now_accepting_pp_2line_w.png" className="h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {user && event && (user.id === (event.organizer_id || event.created_by)) && analytics && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAnalytics(null)
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Event Analytics</h2>
                  <p className="text-gray-600">Performance metrics and insights for {event.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={analyticsLoading}>
                    {analyticsLoading ? 'Loading…' : 'Refresh'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={()=>setAnalytics(null)}>
                    Close
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">Registrations</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.registrations?.total || 0}</p>
                  <p className="text-sm text-blue-700">{analytics.registrations?.attendees || 0} total attendees</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-900">Revenue</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">${(analytics.revenue?.total || 0).toFixed(2)}</p>
                  <p className="text-sm text-green-700">${(analytics.revenue?.donations?.net || 0).toFixed(2)} net after fees</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-purple-900">Breakdown</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-purple-700">{analytics.registrations?.breakdown?.rsvp || 0} RSVP</p>
                    <p className="text-sm text-purple-700">{analytics.registrations?.breakdown?.ticket || 0} Tickets</p>
                    <p className="text-sm text-purple-700">{analytics.registrations?.breakdown?.confirmed || 0} Confirmed</p>
                  </div>
                </div>
              </div>
              
              {/* Additional metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Donation Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Donations:</span>
                      <span className="font-medium">${(analytics.revenue?.donations?.gross || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fees:</span>
                      <span className="font-medium">${(analytics.revenue?.donations?.fees || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-900 font-medium">Net to You:</span>
                      <span className="font-bold text-green-600">${(analytics.revenue?.donations?.net || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Completed: {analytics.revenue?.donations?.count || 0}</span>
                      <span>Pending: {analytics.revenue?.donations?.pending || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Event Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Type:</span>
                      <span className="font-medium capitalize">{event.event_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${(event as any).is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                        {(event as any).is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal:</span>
                      <span className="font-medium">
                        {event.goal_amount ? `$${event.goal_amount.toLocaleString()}` : 'No goal set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {user && event && (user.id === (event.organizer_id || event.created_by)) && registrations && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setRegistrations(null)
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Event Registrations</h2>
                  <p className="text-gray-600">Manage registrations and attendees for {event.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchRegistrations()} disabled={regLoading}>
                    <Users className="h-4 w-4 mr-2" />
                    {regLoading ? 'Loading…' : 'Refresh'}
                  </Button>
                  <button 
                    onClick={async () => {
                      try {
                        // Get fresh session token like we do for analytics
                        const { data: { session } } = await (supabase as any).auth.getSession()
                        if (!session) {
                          toast.error('Please log in to export data')
                          return
                        }
                        
                        console.log('Starting CSV export for event:', event.id)
                        console.log('Session token present:', !!session.access_token)
                        
                        const response = await fetch(`/api/events/${event.id}/registrations/csv`, {
                          method: 'GET',
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json'
                          },
                          credentials: 'include'
                        })
                        
                        console.log('CSV export response:', response.status, response.statusText)
                        
                        if (!response.ok) {
                          const errorText = await response.text()
                          console.error('CSV export failed:', errorText)
                          throw new Error(`Export failed: ${response.status} ${response.statusText}`)
                        }
                        
                        const blob = await response.blob()
                        console.log('CSV blob created, size:', blob.size)
                        
                        if (blob.size === 0) {
                          throw new Error('Empty CSV file received')
                        }
                        
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `registrations_${event.title?.replace(/[^a-z0-9]+/gi,'_').toLowerCase() || 'event'}_${new Date().toISOString().slice(0,10)}.csv`
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)
                        toast.success('CSV exported successfully')
                      } catch (error) {
                        console.error('Export error:', error)
                        toast.error(`Failed to export CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
                      }
                    }}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Export CSV
                  </button>
                  <Button variant="outline" size="sm" onClick={()=>setRegistrations(null)}>
                    Close
                  </Button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Type</label>
                  <select id="regType" className="w-full border border-gray-300 rounded px-2 py-2 text-sm">
                    <option value="">All Types</option>
                    <option value="rsvp">RSVP</option>
                    <option value="ticket">Ticket</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">From Date</label>
                  <input id="regFrom" type="date" className="w-full border border-gray-300 rounded px-2 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">To Date</label>
                  <input id="regTo" type="date" className="w-full border border-gray-300 rounded px-2 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Page Size</label>
                  <input id="regPageSize" type="number" min={1} max={100} defaultValue={25} className="w-full border border-gray-300 rounded px-2 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 invisible">Actions</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={async()=>{
                      const typeEl = document.getElementById('regType') as HTMLSelectElement | null
                      const fromEl = document.getElementById('regFrom') as HTMLInputElement | null
                      const toEl = document.getElementById('regTo') as HTMLInputElement | null
                      const sizeEl = document.getElementById('regPageSize') as HTMLInputElement | null
                      const filters = {
                        type: typeEl?.value || '',
                        from: fromEl?.value || '',
                        to: toEl?.value || '',
                      }
                      const pageSize = Math.max(1, Math.min(100, Number(sizeEl?.value || 25)))
                      await fetchRegistrations(1, pageSize, filters)
                    }} className="flex-1">
                      {regLoading ? 'Loading…' : 'Apply'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={()=>fetchRegistrations(regPage, regPageSize)} disabled={regLoading} className="flex-1">
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  {Array.isArray(registrations) ? registrations.length : 0} shown of {regTotal} total
                  {Array.isArray(registrations) && registrations.length > 0 && (
                    <span className="ml-2">
                      ({registrations.filter((r:any)=>r.type==='rsvp').length} RSVP, {registrations.filter((r:any)=>r.type==='ticket').length} tickets)
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={()=>fetchRegistrations(Math.max(1, regPage-1), regPageSize)} disabled={regLoading || regPage <= 1}>Prev</Button>
                  <span className="text-sm text-gray-600">Page {regPage}</span>
                  <Button variant="outline" size="sm" onClick={()=>fetchRegistrations(regPage+1, regPageSize)} disabled={regLoading || (regPage * regPageSize) >= regTotal}>Next</Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedRegistrations.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">{selectedRegistrations.length} selected</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={()=>bulkUpdateStatus('confirmed')}>
                        Mark Confirmed
                      </Button>
                      <Button variant="outline" size="sm" onClick={()=>bulkUpdateStatus('cancelled')}>
                        Mark Cancelled
                      </Button>
                      <Button variant="outline" size="sm" onClick={()=>setSelectedRegistrations([])}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-gray-700 bg-gray-50">
                      <th className="py-3 px-3 w-12">
                        <input 
                          type="checkbox" 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRegistrations((registrations || []).map((r:any) => r.id))
                            } else {
                              setSelectedRegistrations([])
                            }
                          }}
                          checked={selectedRegistrations.length === (registrations || []).length && (registrations || []).length > 0}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="py-3 px-3 hidden md:table-cell font-medium min-w-[120px]">Created</th>
                      <th className="py-3 px-3 font-medium min-w-[150px]">Name</th>
                      <th className="py-3 px-3 hidden lg:table-cell font-medium min-w-[200px]">Email</th>
                      <th className="py-3 px-3 font-medium min-w-[80px]">Type</th>
                      <th className="py-3 px-3 font-medium min-w-[60px]">Qty</th>
                      <th className="py-3 px-3 font-medium min-w-[100px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(registrations || []).map((r:any) => (
                      <tr key={r.id} className="border-t border-gray-200 text-gray-800 hover:bg-gray-50">
                        <td className="py-3 px-3 w-12">
                          <input 
                            type="checkbox" 
                            checked={selectedRegistrations.includes(r.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRegistrations([...selectedRegistrations, r.id])
                              } else {
                                setSelectedRegistrations(selectedRegistrations.filter(id => id !== r.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell text-gray-600 min-w-[120px]">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-medium min-w-[150px]">
                          <div className="truncate" title={r.name || r.participant_name || '—'}>
                            {r.name || r.participant_name || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell text-gray-600 min-w-[200px]">
                          <div className="truncate" title={r.email || r.participant_email || '—'}>
                            {r.email || r.participant_email || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap min-w-[80px]">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            r.type === 'rsvp' ? 'bg-blue-100 text-blue-800' : 
                            r.type === 'ticket' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-center font-medium min-w-[60px]">
                          {r.quantity}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap min-w-[100px]">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            r.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            r.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {Array.isArray(registrations) && registrations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <Users className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm">No registrations yet</p>
                            <p className="text-xs text-gray-400">Registrations will appear here once people start signing up</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

