import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

<<<<<<< HEAD
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

=======
>>>>>>> bf7868b7bc7790b853acde2d3fea5d9970c824f4
// Security: Admin-only endpoint for data export
export async function GET(request: NextRequest) {
  try {
    // Security: Verify admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the token with Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Security: Check if user is admin (implement your admin logic here)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Security: Get query parameters with validation
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const format = searchParams.get('format') || 'csv'

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Security: Build secure query with proper filtering
    let query = supabase
      .from('donations')
      .select(`
        id,
        amount,
        donor_name,
        donor_email,
        status,
        created_at,
        campaigns(title, organizer_id)
      `)
      .eq('status', 'completed')

    // Security: Filter by campaign if specified
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    // Security: Filter by date range if specified
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: donations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching donations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch donation data' },
        { status: 500 }
      )
    }

    // Security: Log the export action for audit trail
    console.log(`Admin export requested by user ${user.id}:`, {
      campaignId,
      startDate,
      endDate,
      format,
      recordCount: donations?.length || 0
    })

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Donation ID',
        'Amount',
        'Donor Name',
        'Donor Email',
        'Campaign Title',
        'Status',
        'Date'
      ]

      const csvRows = donations?.map(donation => [
        donation.id,
        donation.amount,
        donation.donor_name || 'Anonymous',
        donation.donor_email || '',
        (donation.campaigns as any)?.title || '',
        donation.status,
        new Date(donation.created_at).toISOString()
      ]) || []

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="donations-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: donations,
      meta: {
        total: donations?.length || 0,
        exported_at: new Date().toISOString(),
        exported_by: user.id
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
