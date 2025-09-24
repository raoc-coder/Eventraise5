'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createEventSchema } from '@/lib/validators'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/layout/navigation'
import { Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateEventPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      }
      // Try to include user JWT to satisfy RLS (authenticated role)
      let authHeader: Record<string, string> = {}
      let userIdHeader: Record<string, string> = {}
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        if (supabaseUrl && supabaseAnonKey) {
          const client = createClient(supabaseUrl, supabaseAnonKey)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navigation showAuth={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Create New Event</h1>
          <p className="text-gray-300">Set up your fundraising campaign</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Provide information about your fundraising event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal_amount">Fundraising Goal ($) *</Label>
                  <Input
                    id="goal_amount"
                    type="number"
                    placeholder="10000"
                    value={formData.goal_amount}
                    onChange={(e) => handleInputChange('goal_amount', e.target.value)}
                    required
                  />
                  {errors.goal_amount && <p className="text-red-500 text-sm">{errors.goal_amount}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  placeholder="Describe your fundraising campaign and its purpose"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                  aria-invalid={!!errors.description}
                  required
                />
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
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => handleInputChange('is_public', (e.target.checked as unknown) as string)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_public">Make this event public (visible to everyone)</Label>
                </div>

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
                      For private events, you can invite specific people by email. They&#39;ll receive a direct link to your campaign.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating Event...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
