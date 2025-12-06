import { NextRequest, NextResponse } from 'next/server'
import { requireEventAccess } from '@/lib/auth-utils'

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Use regular client for public ticket viewing
    const { supabase } = await import('@/lib/supabase')
    const db = supabase
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    // Fetch tickets for this event (public access)
    const { data, error } = await db
      .from('event_tickets')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[api/events/tickets] Error fetching tickets:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    console.log('[api/events/tickets] Fetched tickets:', data?.length || 0)
    return NextResponse.json({ tickets: data || [] })
  } catch (e) {
    console.error('[api/events/tickets] Unexpected error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const { name, price_cents, currency, quantity_total, sales_start_at, sales_end_at } = body

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, id)

    // Create ticket
    const { data, error } = await db
      .from('event_tickets')
      .insert({
        event_id: id,
        name: name || 'General Admission',
        price_cents: Math.max(0, Number(price_cents) || 0),
        currency: currency || 'usd',
        quantity_total: quantity_total ? Number(quantity_total) : null,
        sales_start_at: sales_start_at || null,
        sales_end_at: sales_end_at || null,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ticket: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
