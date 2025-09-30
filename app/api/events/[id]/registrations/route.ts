import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || '').trim()
    const from = (searchParams.get('from') || '').trim()
    const to = (searchParams.get('to') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '25')))

    // Build authenticated client via cookie or header token
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

    // Identify user
    const { data: { user } } = await db.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    // Ensure the requester is owner/admin
    const { data: ev, error: evErr } = await db
      .from('events')
      .select('id, organizer_id, created_by')
      .eq('id', id)
      .single()
    if (evErr || !ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const isOwner = user.id === (ev.organizer_id ?? ev.created_by)
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Build query with filters and pagination
    let query = db
      .from('event_registrations')
      .select('id, created_at, type, quantity, status, name, email, participant_name, participant_email', { count: 'exact' })
      .eq('event_id', id)

    if (type) {
      query = query.eq('type', type)
    }
    if (from) {
      query = query.gte('created_at', new Date(from).toISOString())
    }
    if (to) {
      // add one day to include the 'to' date if provided as YYYY-MM-DD
      const toDate = new Date(to)
      const toIso = isNaN(toDate.getTime()) ? new Date(to).toISOString() : new Date(toDate.getTime() + 24*60*60*1000).toISOString()
      query = query.lt('created_at', toIso)
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    query = query.order('created_at', { ascending: false }).range(start, end)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ registrations: data || [], page, pageSize, total: count ?? 0 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}


