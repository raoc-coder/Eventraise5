import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

function toCsv(rows: any[]) {
  const headers = ['id','created_at','type','quantity','status','name','email','participant_name','participant_email']
  const escape = (v: any) => {
    const s = v == null ? '' : String(v)
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map(h => escape((r as any)[h])).join(','))
  }
  return lines.join('\n')
}

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    console.log('CSV export request for event:', id)
    if (!id) return new NextResponse('Missing id', { status: 400 })
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || '').trim()
    const from = (searchParams.get('from') || '').trim()
    const to = (searchParams.get('to') || '').trim()

    // Auth
    let db: any
    try {
      const cookieStore = cookies()
      db = createRouteHandlerClient({ cookies: () => cookieStore })
      console.log('Using cookie-based auth')
    } catch {
      db = null
    }
    if (!db) {
      const authHeader = req.headers.get('authorization') || ''
      console.log('Auth header present:', !!authHeader)
      const match = authHeader.match(/^Bearer\s+(.+)$/i)
      if (!match) return new NextResponse('Authentication required', { status: 401 })
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      db = createClient(url, key, { global: { headers: { Authorization: `Bearer ${match[1]}` } } })
      console.log('Using token-based auth')
    }

    const { data: { user } } = await db.auth.getUser()
    console.log('User authenticated:', !!user, user?.id)
    if (!user) return new NextResponse('Authentication required', { status: 401 })

    const { data: ev, error: evErr } = await db
      .from('events')
      .select('id, organizer_id, created_by, title')
      .eq('id', id)
      .single()
    console.log('Event lookup result:', { ev, evErr })
    if (evErr || !ev) return new NextResponse('Event not found', { status: 404 })
    const isOwner = user.id === (ev.organizer_id ?? ev.created_by)
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    console.log('Access check:', { isOwner, isAdmin, userId: user.id, eventOwner: ev.organizer_id, eventCreator: ev.created_by })
    if (!isOwner && !isAdmin) return new NextResponse('Forbidden', { status: 403 })

    let query = db
      .from('event_registrations')
      .select('id, created_at, type, quantity, status, name, email, participant_name, participant_email')
      .eq('event_id', id)

    if (type) query = query.eq('type', type)
    if (from) query = query.gte('created_at', new Date(from).toISOString())
    if (to) {
      const toDate = new Date(to)
      const toIso = isNaN(toDate.getTime()) ? new Date(to).toISOString() : new Date(toDate.getTime() + 24*60*60*1000).toISOString()
      query = query.lt('created_at', toIso)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    console.log('Registrations query result:', { data: data?.length, error })
    if (error) return new NextResponse(error.message, { status: 400 })

    const csv = toCsv(data || [])
    console.log('CSV generated, length:', csv.length)
    const filename = `registrations_${ev.title?.replace(/[^a-z0-9]+/gi,'_').toLowerCase() || 'event'}_${new Date().toISOString().slice(0,10)}.csv`
    console.log('Returning CSV with filename:', filename)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (e) {
    return new NextResponse(e instanceof Error ? e.message : 'Unknown error', { status: 500 })
  }
}


