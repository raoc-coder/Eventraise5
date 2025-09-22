import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MonitoringService } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    const { reportType, filters, schedule } = await request.json()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Generate comprehensive analytics data
    const analyticsData = await generateAnalyticsData(filters)

    // Track analytics request
    MonitoringService.trackBusinessMetric('analytics_requested', 0, {
      report_type: reportType,
      filters: JSON.stringify(filters),
      scheduled: !!schedule
    })

    return NextResponse.json({
      success: true,
      data: analyticsData,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating analytics:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

async function generateAnalyticsData(filters: any = {}) {
  if (!supabase) {
    throw new Error('Database not configured')
  }

  const { startDate, endDate, campaignId, eventId } = filters

  // Build date filter
  let dateFilter = {}
  if (startDate) {
    dateFilter = { ...dateFilter, gte: startDate }
  }
  if (endDate) {
    dateFilter = { ...dateFilter, lte: endDate }
  }

  // Get donations analytics
  let donationsQuery = supabase
    .from('donations')
    .select('amount, created_at, status')

  if (Object.keys(dateFilter).length > 0) {
    donationsQuery = donationsQuery.filter('created_at', 'gte', startDate || '1900-01-01')
    if (endDate) {
      donationsQuery = donationsQuery.filter('created_at', 'lte', endDate)
    }
  }

  const { data: donations, error: donationsError } = await donationsQuery

  if (donationsError) {
    throw new Error(`Failed to fetch donations: ${donationsError.message}`)
  }

  // Get event registrations analytics
  let registrationsQuery = supabase
    .from('event_registrations')
    .select('total_amount, registration_date, event_id, status')

  if (Object.keys(dateFilter).length > 0) {
    registrationsQuery = registrationsQuery.filter('registration_date', 'gte', startDate || '1900-01-01')
    if (endDate) {
      registrationsQuery = registrationsQuery.filter('registration_date', 'lte', endDate)
    }
  }

  if (eventId) {
    registrationsQuery = registrationsQuery.eq('event_id', eventId)
  }

  const { data: registrations, error: registrationsError } = await registrationsQuery

  if (registrationsError) {
    throw new Error(`Failed to fetch registrations: ${registrationsError.message}`)
  }

  // Get volunteer analytics
  let volunteersQuery = supabase
    .from('volunteer_signups')
    .select('signed_up_at, status, volunteer_shifts!inner(event_id)')

  if (Object.keys(dateFilter).length > 0) {
    volunteersQuery = volunteersQuery.filter('signed_up_at', 'gte', startDate || '1900-01-01')
    if (endDate) {
      volunteersQuery = volunteersQuery.filter('signed_up_at', 'lte', endDate)
    }
  }

  if (eventId) {
    volunteersQuery = volunteersQuery.eq('volunteer_shifts.event_id', eventId)
  }

  const { data: volunteers, error: volunteersError } = await volunteersQuery

  if (volunteersError) {
    throw new Error(`Failed to fetch volunteers: ${volunteersError.message}`)
  }

  // Calculate analytics
  const totalDonations = donations?.length || 0
  const totalDonationAmount = donations?.reduce((sum, donation) => sum + donation.amount, 0) || 0
  const averageDonation = totalDonations > 0 ? totalDonationAmount / totalDonations : 0

  const totalRegistrations = registrations?.length || 0
  const totalRegistrationAmount = registrations?.reduce((sum, reg) => sum + reg.total_amount, 0) || 0
  const averageRegistration = totalRegistrations > 0 ? totalRegistrationAmount / totalRegistrations : 0

  const totalVolunteers = volunteers?.length || 0
  const confirmedVolunteers = volunteers?.filter(v => v.status === 'confirmed').length || 0

  // Monthly breakdown
  const monthlyData = getMonthlyBreakdown(donations || [], registrations || [])

  // Event performance
  const eventPerformance = await getEventPerformance(eventId)

  return {
    summary: {
      totalDonations,
      totalDonationAmount,
      averageDonation,
      totalRegistrations,
      totalRegistrationAmount,
      averageRegistration,
      totalVolunteers,
      confirmedVolunteers,
      totalRevenue: totalDonationAmount + totalRegistrationAmount
    },
    monthlyData,
    eventPerformance,
    generated_at: new Date().toISOString()
  }
}


async function getEventPerformance(eventId?: string) {
  if (!supabase) return null

  let query = supabase
    .from('events')
    .select(`
      id,
      title,
      start_date,
      end_date,
      max_participants,
      current_participants,
      ticket_price,
      event_registrations(count)
    `)

  if (eventId) {
    query = query.eq('id', eventId)
  }

  const { data: events } = await query.limit(10)

  return events?.map(event => ({
    id: event.id,
    title: event.title,
    start_date: event.start_date,
    end_date: event.end_date,
    max_participants: event.max_participants,
    current_participants: event.current_participants,
    capacity_percentage: event.max_participants > 0 
      ? (event.current_participants / event.max_participants) * 100 
      : 0,
    ticket_price: event.ticket_price,
    registration_count: (event.event_registrations as any)?.length || 0
  })) || []
}

function getMonthlyBreakdown(donations: any[], registrations: any[]) {
  const monthlyData: { [key: string]: { donations: number, registrations: number, revenue: number } } = {}

  // Process donations
  donations.forEach(donation => {
    const month = new Date(donation.created_at).toISOString().substring(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { donations: 0, registrations: 0, revenue: 0 }
    }
    monthlyData[month].donations += 1
    monthlyData[month].revenue += donation.amount
  })

  // Process registrations
  registrations.forEach(registration => {
    const month = new Date(registration.registration_date).toISOString().substring(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { donations: 0, registrations: 0, revenue: 0 }
    }
    monthlyData[month].registrations += 1
    monthlyData[month].revenue += registration.total_amount
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ...data
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}
