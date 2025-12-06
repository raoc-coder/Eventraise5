import { NextRequest, NextResponse } from 'next/server'
import { requireEventAccess } from '@/lib/auth-utils'

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, id)

    // Get registrations by type
    const { data: registrations, error: regErr } = await db
      .from('event_registrations')
      .select('type, quantity, status, created_at, name, email, participant_name, participant_email')
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
    const totalAttendees = registrations?.reduce((sum: number, r: any) => sum + (r.quantity || 1), 0) || 0
    const rsvpCount = registrations?.filter((r: any) => r.type === 'rsvp').length || 0
    const ticketCount = registrations?.filter((r: any) => r.type === 'ticket').length || 0
    const confirmedCount = registrations?.filter((r: any) => r.status === 'confirmed').length || 0

    // Revenue analytics - only count succeeded donations
    const succeededDonations = donations?.filter((d: any) => d.status === 'succeeded') || []
    const totalDonations = succeededDonations.reduce((sum: number, d: any) => sum + (d.amount_cents || 0), 0)
    const totalFees = succeededDonations.reduce((sum: number, d: any) => sum + (d.fee_cents || 0), 0)
    const totalNet = succeededDonations.reduce((sum: number, d: any) => sum + (d.net_cents || 0), 0)

    // Ticket revenue (from ticket sales - this would need to be calculated from actual ticket purchases)
    // For now, we'll set this to 0 since ticket revenue should come from actual ticket purchases
    const ticketRevenue = 0

    // Additional metrics
    const completedDonations = succeededDonations.length
    const pendingDonations = donations?.filter((d: any) => d.status === 'pending').length || 0

    // Daily registration trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyTrends = registrations
      ?.filter((r: any) => new Date(r.created_at) >= thirtyDaysAgo)
      .reduce((acc: Record<string, number>, r: any) => {
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
        id: event.id,
        title: event.title,
        start_date: event.start_date,
        end_date: event.end_date
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
          net: totalNet / 100,
          count: completedDonations,
          pending: pendingDonations
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
