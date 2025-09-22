import { supabase } from './supabase'

export interface ExportOptions {
  startDate?: string
  endDate?: string
  campaignId?: string
  eventId?: string
  format?: 'csv' | 'excel'
  includePersonalData?: boolean
}

export interface DonationExportData {
  id: string
  campaign_id: string
  campaign_title: string
  amount: number
  donor_name: string
  donor_email: string
  payment_intent_id: string
  checkout_session_id: string
  status: string
  created_at: string
  tax_deductible: boolean
}

export interface EventRegistrationExportData {
  id: string
  event_id: string
  event_title: string
  participant_name: string
  participant_email: string
  participant_phone: string
  ticket_quantity: number
  total_amount: number
  status: string
  registration_date: string
  special_requests: string
  dietary_restrictions: string
}

export interface VolunteerExportData {
  id: string
  shift_id: string
  shift_title: string
  event_id: string
  event_title: string
  volunteer_name: string
  volunteer_email: string
  volunteer_phone: string
  skills: string[]
  experience_level: string
  status: string
  signed_up_at: string
}

export class CSVExportService {
  static async exportDonations(options: ExportOptions = {}): Promise<string> {
    if (!supabase) {
      throw new Error('Database not configured')
    }

    let query = supabase
      .from('donations')
      .select(`
        id,
        campaign_id,
        amount,
        donor_name,
        donor_email,
        payment_intent_id,
        checkout_session_id,
        status,
        created_at,
        campaigns!inner(title)
      `)

    // Apply filters
    if (options.campaignId) {
      query = query.eq('campaign_id', options.campaignId)
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate)
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate)
    }

    const { data: donations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch donations: ${error.message}`)
    }

    // Convert to CSV format
    const csvData = donations?.map(donation => ({
      id: donation.id,
      campaign_id: donation.campaign_id,
      campaign_title: (donation.campaigns as any)?.title || '',
      amount: donation.amount,
      donor_name: options.includePersonalData ? donation.donor_name : 'Anonymous',
      donor_email: options.includePersonalData ? donation.donor_email : '***@***.***',
      payment_intent_id: donation.payment_intent_id,
      checkout_session_id: donation.checkout_session_id,
      status: donation.status,
      created_at: donation.created_at,
      tax_deductible: 'Yes'
    })) || []

    return this.convertToCSV(csvData, 'donations')
  }

  static async exportEventRegistrations(options: ExportOptions = {}): Promise<string> {
    if (!supabase) {
      throw new Error('Database not configured')
    }

    let query = supabase
      .from('event_registrations')
      .select(`
        id,
        event_id,
        participant_name,
        participant_email,
        participant_phone,
        ticket_quantity,
        total_amount,
        status,
        registration_date,
        special_requests,
        dietary_restrictions,
        events!inner(title)
      `)

    // Apply filters
    if (options.eventId) {
      query = query.eq('event_id', options.eventId)
    }

    if (options.startDate) {
      query = query.gte('registration_date', options.startDate)
    }

    if (options.endDate) {
      query = query.lte('registration_date', options.endDate)
    }

    const { data: registrations, error } = await query.order('registration_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch event registrations: ${error.message}`)
    }

    // Convert to CSV format
    const csvData = registrations?.map(registration => ({
      id: registration.id,
      event_id: registration.event_id,
      event_title: (registration.events as any)?.title || '',
      participant_name: options.includePersonalData ? registration.participant_name : 'Anonymous',
      participant_email: options.includePersonalData ? registration.participant_email : '***@***.***',
      participant_phone: options.includePersonalData ? registration.participant_phone : '***-***-****',
      ticket_quantity: registration.ticket_quantity,
      total_amount: registration.total_amount,
      status: registration.status,
      registration_date: registration.registration_date,
      special_requests: registration.special_requests || '',
      dietary_restrictions: registration.dietary_restrictions || ''
    })) || []

    return this.convertToCSV(csvData, 'event_registrations')
  }

  static async exportVolunteers(options: ExportOptions = {}): Promise<string> {
    if (!supabase) {
      throw new Error('Database not configured')
    }

    let query = supabase
      .from('volunteer_signups')
      .select(`
        id,
        shift_id,
        volunteer_name,
        volunteer_email,
        volunteer_phone,
        skills,
        experience_level,
        status,
        signed_up_at,
        volunteer_shifts!inner(
          title,
          events!inner(title)
        )
      `)

    // Apply filters
    if (options.eventId) {
      query = query.eq('volunteer_shifts.event_id', options.eventId)
    }

    if (options.startDate) {
      query = query.gte('signed_up_at', options.startDate)
    }

    if (options.endDate) {
      query = query.lte('signed_up_at', options.endDate)
    }

    const { data: volunteers, error } = await query.order('signed_up_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch volunteers: ${error.message}`)
    }

    // Convert to CSV format
    const csvData = volunteers?.map(volunteer => ({
      id: volunteer.id,
      shift_id: volunteer.shift_id,
      shift_title: (volunteer.volunteer_shifts as any)?.title || '',
      event_id: (volunteer.volunteer_shifts as any)?.events?.id || '',
      event_title: (volunteer.volunteer_shifts as any)?.events?.title || '',
      volunteer_name: options.includePersonalData ? volunteer.volunteer_name : 'Anonymous',
      volunteer_email: options.includePersonalData ? volunteer.volunteer_email : '***@***.***',
      volunteer_phone: options.includePersonalData ? volunteer.volunteer_phone : '***-***-****',
      skills: volunteer.skills?.join(', ') || '',
      experience_level: volunteer.experience_level,
      status: volunteer.status,
      signed_up_at: volunteer.signed_up_at
    })) || []

    return this.convertToCSV(csvData, 'volunteers')
  }

  static async exportCampaignAnalytics(campaignId: string): Promise<string> {
    if (!supabase) {
      throw new Error('Database not configured')
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    // Get donations for this campaign
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (donationsError) {
      throw new Error(`Failed to fetch donations: ${donationsError.message}`)
    }

    // Calculate analytics
    const totalDonations = donations?.length || 0
    const totalAmount = donations?.reduce((sum, donation) => sum + donation.amount, 0) || 0
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0
    const goalProgress = campaign.goal_amount > 0 ? (totalAmount / campaign.goal_amount) * 100 : 0

    // Create analytics data
    const analyticsData = [
      {
        metric: 'Campaign Title',
        value: campaign.title,
        description: 'Name of the campaign'
      },
      {
        metric: 'Total Donations',
        value: totalDonations.toString(),
        description: 'Number of individual donations'
      },
      {
        metric: 'Total Amount Raised',
        value: `$${totalAmount.toFixed(2)}`,
        description: 'Total amount raised from all donations'
      },
      {
        metric: 'Average Donation',
        value: `$${averageDonation.toFixed(2)}`,
        description: 'Average donation amount'
      },
      {
        metric: 'Goal Amount',
        value: `$${campaign.goal_amount?.toFixed(2) || '0.00'}`,
        description: 'Target fundraising goal'
      },
      {
        metric: 'Goal Progress',
        value: `${goalProgress.toFixed(1)}%`,
        description: 'Percentage of goal achieved'
      },
      {
        metric: 'Campaign Status',
        value: campaign.is_published ? 'Active' : 'Draft',
        description: 'Current campaign status'
      },
      {
        metric: 'Created Date',
        value: new Date(campaign.created_at).toLocaleDateString(),
        description: 'When the campaign was created'
      }
    ]

    return this.convertToCSV(analyticsData, 'campaign_analytics')
  }

  private static convertToCSV(data: any[], filename: string): string {
    if (!data || data.length === 0) {
      return 'No data available'
    }

    // Get headers from the first object
    const headers = Object.keys(data[0])
    
    // Create CSV content
    const csvContent = [
      // Headers
      headers.join(','),
      // Data rows
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    return csvContent
  }

  static downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
