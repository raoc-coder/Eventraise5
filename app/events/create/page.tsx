'use client'

import { useState, useEffect } from 'react'
import { supabase as sharedSupabase } from '@/lib/supabase'
import { createEventSchema } from '@/lib/validators'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { useCurrency } from '@/app/providers/currency-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/layout/navigation'
import { Heart, ArrowLeft, Calendar, MapPin, Target } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateEventPage() {
  const { user, loading: authLoading } = useAuth()
  const { country, currency, symbol } = useCurrency()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Inline validation support
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateInline = (next: typeof formData) => {
    const nextErrors: Record<string, string> = { ...errors }
    if (next.start_date && next.end_date) {
      const start = new Date(next.start_date)
      const end = new Date(next.end_date)
      if (end < start) {
        nextErrors.end_date = 'End date cannot be before start date'
      } else {
        delete nextErrors.end_date
      }
    }
    setErrors(nextErrors)
  }
  const formatDate = (value: string) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return value
    }
  }
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'direct_donation',
    start_date: '',
    end_date: '',
    goal_amount: '',
    location: '',
    is_public: true,
    invite_emails: '',
    // Ticketing fields
    is_ticketed: false,
    ticket_price: '',
    ticket_currency: currency.toLowerCase(),
    ticket_quantity: '',
    // Volunteer quick ask
    create_volunteer: false,
    volunteer_title: '',
  })

  // Update ticket currency when country changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ticket_currency: currency.toLowerCase()
    }))
  }, [currency])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      // run lightweight validation for dependent fields
      if (field === 'start_date' || field === 'end_date') {
        validateInline(next)
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Client-side validation for friendlier errors
      try {
        setErrors({})
        createEventSchema.parse({
          title: formData.title,
          description: formData.description,
          event_type: formData.event_type,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          goal_amount: formData.goal_amount ? Number(formData.goal_amount) : undefined,
          location: formData.location,
        })
      } catch (err: any) {
        const fieldErrors: Record<string, string> = {}
        if (err?.issues?.length) {
          for (const issue of err.issues) {
            const path = issue.path?.[0]
            if (path && !fieldErrors[path]) fieldErrors[path] = issue.message || 'Invalid value'
          }
        }
        setErrors(fieldErrors)
        toast.error('Please fix the highlighted fields.')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        goal_amount: formData.goal_amount || undefined,
        location: formData.location,
        is_public: formData.is_public,
        // Ticketing data
        is_ticketed: formData.is_ticketed,
        ticket_price: formData.is_ticketed ? parseFloat(formData.ticket_price) : undefined,
        ticket_currency: formData.is_ticketed ? formData.ticket_currency : undefined,
        ticket_quantity: formData.is_ticketed && formData.ticket_quantity ? parseInt(formData.ticket_quantity) : undefined,
      }
      // Try to include user JWT to satisfy RLS (authenticated role)
      let authHeader: Record<string, string> = {}
      let userIdHeader: Record<string, string> = {}
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        if (supabaseUrl && supabaseAnonKey) {
          const client = sharedSupabase!
          const { data: sessionData } = await client.auth.getSession()
          const token = sessionData?.session?.access_token
          const uid = sessionData?.session?.user?.id
          if (token) authHeader = { Authorization: `Bearer ${token}` }
          if (uid) userIdHeader = { 'x-user-id': uid }
        }
      } catch {}

      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader, ...userIdHeader },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create event')
      const ev = json.event ?? json.data?.event
      if (!ev?.id) throw new Error('Event ID missing from response')

      // Optionally create a simple volunteer opportunity and copy share link
      if (formData.create_volunteer && formData.volunteer_title.trim()) {
        try {
          const client = sharedSupabase!
          const { data: sessionData } = await client.auth.getSession()
          const token = sessionData?.session?.access_token
          const headers: Record<string, string> = { 'Content-Type': 'application/json' }
          if (token) headers.Authorization = `Bearer ${token}`

          const resShift = await fetch(`/api/events/${ev.id}/volunteer-shifts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ title: formData.volunteer_title.trim(), is_active: true })
          })
          const shiftJson = await resShift.json()
          if (!resShift.ok) throw new Error(shiftJson.error || 'Failed to create volunteer opportunity')

          const shareUrl = `${window.location.origin}/events/${ev.id}?shift=${encodeURIComponent(shiftJson.shift.id)}`
          try { await navigator.clipboard.writeText(shareUrl) } catch {}
          toast.success('Volunteer link created and copied to clipboard')
        } catch (volErr: any) {
          toast.error(volErr?.message || 'Volunteer setup failed (you can add it later)')
        }
      }

      toast.success('Event created successfully!')
      router.push(`/events/${ev.id}?created=1`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation showAuth={false} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4 transition-colors text-sm sm:text-base">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Event</h1>
          <p className="text-gray-300 text-sm sm:text-base">Set up your event</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Event Details</CardTitle>
              <CardDescription className="text-sm sm:text-base">Provide information about your event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    aria-invalid={!!errors.title}
                    required
                  />
                  <p className="text-xs text-gray-500">Keep it short and clear. Example: Community Relief Fund</p>
                  {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_type">Event Type *</Label>
                  <select
                    id="event_type"
                    value={formData.event_type}
                    onChange={(e) => handleInputChange('event_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                    aria-invalid={!!errors.event_type}
                    required
                  >
                    <option value="direct_donation">Direct Donation</option>
                    <option value="walkathon">Walk-a-thon</option>
                    <option value="auction">Auction</option>
                    <option value="product_sale">Product Sale</option>
                    <option value="raffle">Raffle</option>
                  </select>
                  {errors.event_type && <p className="text-red-500 text-sm">{errors.event_type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal_amount">Fundraising Goal ({symbol}) *</Label>
                  <Input
                    id="goal_amount"
                    type="number"
                    placeholder={country === 'IN' ? "50000" : "10000"}
                    value={formData.goal_amount}
                    onChange={(e) => handleInputChange('goal_amount', e.target.value)}
                    min={1}
                    step={1}
                    required
                  />
                  <p className="text-xs text-gray-500">Enter a whole {currency} amount. You can adjust later.</p>
                  {errors.goal_amount && <p className="text-red-500 text-sm">{errors.goal_amount}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  placeholder="Describe your event and its purpose"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                  aria-invalid={!!errors.description}
                  required
                />
                <p className="text-xs text-gray-500">Share what the funds will support and why it matters.</p>
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input 
                    id="start_date" 
                    type="date" 
                    value={formData.start_date} 
                    onChange={(e) => handleInputChange('start_date', e.target.value)} 
                    aria-invalid={!!errors.start_date} 
                    required 
                  />
                  <p className="text-xs text-gray-500">Use date-only; time is not required.</p>
                  {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input 
                    id="end_date" 
                    type="date" 
                    value={formData.end_date} 
                    onChange={(e) => handleInputChange('end_date', e.target.value)} 
                    aria-invalid={!!errors.end_date} 
                    required 
                  />
                  <p className="text-xs text-gray-500">End date must be on or after the start date.</p>
                  {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="Event location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
                  <p className="text-xs text-gray-500">If online, leave this blank or write &quot;Online&quot;.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => handleInputChange('is_public', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                     <Label htmlFor="is_public">Make this event public (visible to everyone)</Label>
                </div>
                <p className="text-xs text-gray-500">Uncheck to make it private and invite only specific people.</p>

                {!formData.is_public && (
                  <div className="space-y-2">
                    <Label htmlFor="invite_emails">Invite Donors & Volunteers (Optional)</Label>
                    <textarea
                      id="invite_emails"
                      placeholder="Enter email addresses separated by commas: john@example.com, jane@example.com"
                      value={formData.invite_emails}
                      onChange={(e) => handleInputChange('invite_emails', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                    />
                    <p className="text-sm text-gray-500">
                      For private events, you can invite specific people by email. They&#39;ll receive a direct link to your event.
                    </p>
                  </div>
                )}
              </div>

              {/* Ticketing Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_ticketed"
                    checked={formData.is_ticketed}
                    onChange={(e) => handleInputChange('is_ticketed', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_ticketed">This is a ticketed event</Label>
                </div>
                <p className="text-xs text-gray-500">Enable ticketing to sell tickets for your event.</p>

                {formData.is_ticketed && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="ticket_price">Ticket Price ({symbol})</Label>
                      <Input
                        id="ticket_price"
                        type="number"
                        placeholder={country === 'IN' ? "2000.00" : "25.00"}
                        value={formData.ticket_price}
                        onChange={(e) => handleInputChange('ticket_price', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500">Price per ticket in {currency}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ticket_currency">Currency</Label>
                      <select
                        id="ticket_currency"
                        value={formData.ticket_currency}
                        onChange={(e) => handleInputChange('ticket_currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                      >
                        <option value="usd">USD ($)</option>
                        <option value="inr">INR (₹)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ticket_quantity">Max Tickets (Optional)</Label>
                      <Input
                        id="ticket_quantity"
                        type="number"
                        placeholder="100"
                        value={formData.ticket_quantity}
                        onChange={(e) => handleInputChange('ticket_quantity', e.target.value)}
                        min="1"
                      />
                      <p className="text-xs text-gray-500">Leave blank for unlimited</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Volunteer Quick Ask Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="create_volunteer"
                    checked={formData.create_volunteer}
                    onChange={(e) => handleInputChange('create_volunteer', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="create_volunteer">Create a volunteer opportunity (simple yes/no)</Label>
                </div>
                {formData.create_volunteer && (
                  <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="volunteer_title">Volunteer Ask Title</Label>
                      <Input
                        id="volunteer_title"
                        placeholder="e.g. Yes, I can help!"
                        value={formData.volunteer_title}
                        onChange={(e) => handleInputChange('volunteer_title', e.target.value)}
                      />
                      <p className="text-xs text-gray-500">We’ll create a shareable link for people to say yes.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                     <Button type="submit" disabled={loading}>
                     {loading ? 'Creating Campaign...' : 'Create Campaign'}
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Preview</CardTitle>
              <CardDescription className="text-gray-600">This is how your event will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.title || 'Your Event Title'}</h2>
                  <p className="text-blue-600 font-semibold">
                    {(() => {
                      const map: Record<string, string> = {
                        walkathon: 'Walk-a-thon',
                        auction: 'Auction',
                        product_sale: 'Product Sale',
                        direct_donation: 'Direct Donation',
                        raffle: 'Raffle',
                      }
                      return map[formData.event_type] || 'Event'
                    })()}
                  </p>
                </div>

                {formData.goal_amount && (
                  <div className="flex items-center mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full mr-3">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium text-sm uppercase tracking-wide">Fundraising Goal</p>
                      <p className="text-xl font-bold text-blue-900">${Number(formData.goal_amount).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full mr-3">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Campaign Period</p>
                      <p className="text-blue-900 font-bold">{formatDate(formData.start_date)} - {formatDate(formData.end_date)}</p>
                    </div>
                  </div>
                  {formData.location ? (
                    <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 shadow-sm">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full mr-3">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Location</p>
                        <p className="text-orange-900 font-bold">{formData.location}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-gray-700 whitespace-pre-line">{formData.description || 'Describe your event and its purpose.'}</p>
                </div>

                <div>
                  {formData.is_public ? (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Public</span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">Private</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button disabled>Donate</Button>
                  <Button variant="outline" disabled>Share</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
