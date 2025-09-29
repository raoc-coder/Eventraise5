import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication - try both cookie and header auth
    let user = null
    
    // Try cookie-based auth first
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data: { user: cookieUser } } = await supabase.auth.getUser()
      user = cookieUser
    } catch (e) {
      // If cookie auth fails, try header auth
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        const { data: { user: headerUser } } = await supabase.auth.getUser(token)
        user = headerUser
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const campaignId = searchParams.get('campaignId')
    const status = searchParams.get('status') // completed|failed|pending
    const settlement = searchParams.get('settlement') // settled|pending|failed
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const baseSelect = 'id, amount_cents, fee_cents, net_cents, status, settlement_status, donor_name, donor_email, created_at, event_id, campaign_id, braintree_transaction_id'
    let query = supabaseAdmin
      .from('donation_requests')
      .select(baseSelect)
      .order('created_at', { ascending: false })

    if (eventId) (query as any).eq('event_id', eventId)
    if (campaignId) (query as any).eq('campaign_id', campaignId)
    if (status) (query as any).eq('status', status)
    if (settlement) (query as any).eq('settlement_status', settlement)

    if (startDate) (query as any).gte('created_at', new Date(startDate).toISOString())
    if (endDate) {
      const endIso = new Date(endDate)
      endIso.setHours(23,59,59,999)
      ;(query as any).lte('created_at', endIso.toISOString())
    }

    let { data, error } = await query

    // Fallback if certain columns don't exist in live schema (42703: undefined_column)
    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      let q2 = supabaseAdmin
        .from('donation_requests')
        .select('id, amount_cents, fee_cents, net_cents, status, settlement_status, donor_name, donor_email, created_at, braintree_transaction_id')
        .order('created_at', { ascending: false })
      if (status) (q2 as any).eq('status', status)
      if (settlement) (q2 as any).eq('settlement_status', settlement)
      if (startDate) (q2 as any).gte('created_at', new Date(startDate).toISOString())
      if (endDate) {
        const endIso = new Date(endDate)
        endIso.setHours(23,59,59,999)
        ;(q2 as any).lte('created_at', endIso.toISOString())
      }
      const alt = await q2
      data = alt.data as any
      error = alt.error as any
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ donations: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch donations' }, { status: 500 })
  }
}


