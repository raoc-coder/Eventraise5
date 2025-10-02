import { NextRequest, NextResponse } from 'next/server'
import { requireEventAccess } from '@/lib/auth-utils'

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

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, id)

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


