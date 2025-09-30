import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Build authenticated client
    let db: any
    try {
      const cookieStore = cookies()
      db = createRouteHandlerClient({ cookies: () => cookieStore })
    } catch {
      db = null
    }

    if (!db) {
      const authHeader = req.headers.get('authorization') || ''
      const match = authHeader.match(/^Bearer\s+(.+)$/i)
      if (!match) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      db = createClient(url, key, { global: { headers: { Authorization: `Bearer ${match[1]}` } } })
    }

    const { data: { user } } = await db.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    // Check if user is owner/admin
    const { data: ev, error: evErr } = await db
      .from('events')
      .select('id, organizer_id, created_by, title, start_date, end_date')
      .eq('id', id)
      .single()
    if (evErr || !ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    
    const isOwner = user.id === (ev.organizer_id ?? ev.created_by)
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Get registrations by type
    const { data: registrations, error: regErr } = await db
      .from('event_registrations')
      .select('type, quantity, status, created_at, braintree_transaction_id, fee_cents, net_cents')
      .eq('event_id', id)

    if (regErr) return NextResponse.json({ error: regErr.message }, { status: 400 })

    // Get donations
    const { data: donations, error: donErr } = await db
      .from('donation_requests')
      .select('amount_cents, fee_cents, net_cents, status, created_at')
      .eq('event_id', id)

    if (donErr) return NextResponse.json({ error: donErr.message }, { status: 400 })

    // Calculate analytics
    const totalRegistrations = registrations?.length || 0
    const totalAttendees = registrations?.reduce((sum, r) => sum + (r.quantity || 1), 0) || 0
    const rsvpCount = registrations?.filter(r => r.type === 'rsvp').length || 0
    const ticketCount = registrations?.filter(r => r.type === 'ticket').length || 0
    const confirmedCount = registrations?.filter(r => r.status === 'confirmed').length || 0

    // Revenue analytics
    const totalDonations = donations?.reduce((sum, d) => sum + (d.amount_cents || 0), 0) || 0
    const totalFees = donations?.reduce((sum, d) => sum + (d.fee_cents || 0), 0) || 0
    const totalNet = donations?.reduce((sum, d) => sum + (d.net_cents || 0), 0) || 0

    // Ticket revenue
    const ticketRevenue = registrations
      ?.filter(r => r.type === 'ticket' && r.status === 'confirmed')
      .reduce((sum, r) => sum + (r.fee_cents || 0) + (r.net_cents || 0), 0) || 0

    // Daily registration trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyTrends = registrations
      ?.filter(r => new Date(r.created_at) >= thirtyDaysAgo)
      .reduce((acc, r) => {
        const date = new Date(r.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + (r.quantity || 1)
        return acc
      }, {} as Record<string, number>) || {}

    // Type breakdown
    const typeBreakdown = {
      rsvp: rsvpCount,
      ticket: ticketCount,
      confirmed: confirmedCount,
      pending: totalRegistrations - confirmedCount
    }

    return NextResponse.json({
      event: {
        id: ev.id,
        title: ev.title,
        start_date: ev.start_date,
        end_date: ev.end_date
      },
      registrations: {
        total: totalRegistrations,
        attendees: totalAttendees,
        breakdown: typeBreakdown
      },
      revenue: {
        donations: {
          gross: totalDonations / 100,
          fees: totalFees / 100,
          net: totalNet / 100
        },
        tickets: {
          gross: ticketRevenue / 100
        },
        total: (totalDonations + ticketRevenue) / 100
      },
      trends: {
        daily: dailyTrends
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
