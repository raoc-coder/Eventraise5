import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const { action, registration_ids, status } = body

    if (!action || !registration_ids || !Array.isArray(registration_ids)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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

    if (action === 'update_status') {
      if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 })
      
      const { data, error } = await db
        .from('event_registrations')
        .update({ status })
        .in('id', registration_ids)
        .eq('event_id', id)
        .select('id')

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ updated: data?.length || 0 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
