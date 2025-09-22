import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CSVExportService } from '@/lib/csv-export'
import { MonitoringService } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const campaignId = searchParams.get('campaignId')
    const eventId = searchParams.get('eventId')
    const includePersonalData = searchParams.get('includePersonalData') === 'true'

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const options = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      campaignId: campaignId || undefined,
      eventId: eventId || undefined,
      includePersonalData
    }

    let csvContent: string

    switch (reportType) {
      case 'donations':
        csvContent = await CSVExportService.exportDonations(options)
        break
      case 'event-registrations':
        csvContent = await CSVExportService.exportEventRegistrations(options)
        break
      case 'volunteers':
        csvContent = await CSVExportService.exportVolunteers(options)
        break
      case 'campaign-analytics':
        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID is required for campaign analytics' },
            { status: 400 }
          )
        }
        csvContent = await CSVExportService.exportCampaignAnalytics(campaignId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    // Track report generation
    MonitoringService.trackBusinessMetric('report_generated', 0, {
      report_type: reportType,
      campaign_id: campaignId,
      event_id: eventId,
      include_personal_data: includePersonalData
    })

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${reportType}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error generating report:', error)
    
    // Monitor report generation errors
    MonitoringService.trackCriticalError(
      error instanceof Error ? error : new Error('Unknown report generation error'),
      {
        endpoint: 'admin_reports',
        error_type: 'report_generation_failure'
      }
    )
    
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

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
    .select('amount, created_at, campaign_id, status')

  if (Object.keys(dateFilter).length > 0) {
    donationsQuery = donationsQuery.filter('created_at', 'gte', startDate || '1900-01-01')
    if (endDate) {
      donationsQuery = donationsQuery.filter('created_at', 'lte', endDate)
    }
  }

  if (campaignId) {
    donationsQuery = donationsQuery.eq('campaign_id', campaignId)
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

  // Campaign performance
  const campaignPerformance = await getCampaignPerformance(campaignId)

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
    campaignPerformance,
    eventPerformance,
    generated_at: new Date().toISOString()
  }
}

async function getCampaignPerformance(campaignId?: string) {
  if (!supabase) return null

  let query = supabase
    .from('campaigns')
    .select(`
      id,
      title,
      goal_amount,
      current_amount,
      created_at,
      donations(count)
    `)

  if (campaignId) {
    query = query.eq('id', campaignId)
  }

  const { data: campaigns } = await query.limit(10)

  return campaigns?.map(campaign => ({
    id: campaign.id,
    title: campaign.title,
    goal_amount: campaign.goal_amount,
    current_amount: campaign.current_amount,
    progress_percentage: campaign.goal_amount > 0 
      ? (campaign.current_amount / campaign.goal_amount) * 100 
      : 0,
    donation_count: (campaign.donations as any)?.length || 0,
    created_at: campaign.created_at
  })) || []
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
