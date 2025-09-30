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
      .select('id, organizer_id, created_by, is_published')
      .eq('id', id)
      .single()
    if (evErr || !ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    
    const isOwner = user.id === (ev.organizer_id ?? ev.created_by)
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Fetch tickets for this event
    const { data, error } = await db
      .from('event_tickets')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ tickets: data || [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const { name, price_cents, currency, quantity_total, sales_start_at, sales_end_at } = body

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
      .select('id, organizer_id, created_by')
      .eq('id', id)
      .single()
    if (evErr || !ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    
    const isOwner = user.id === (ev.organizer_id ?? ev.created_by)
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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
