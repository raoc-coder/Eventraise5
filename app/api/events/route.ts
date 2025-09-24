import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const db = supabaseAdmin || supabase
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || '1')
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '12')))
  const mine = searchParams.get('mine') === '1'
  const type = searchParams.get('type') || ''
  const userId = req.headers.get('x-user-id') || ''
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Base query; prefer published only if column exists
  let query = db.from('events').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
  if (type) {
    // Apply type filter; if column missing, it will be handled below
    query = query.eq('event_type', type)
  }

  if (mine && userId) {
    // Try filter by common creator columns, falling back gracefully
    let data, error, count
    // Attempt created_by
    ;({ data, error, count } = await db
      .from('events')
      .select('*', { count: 'exact' })
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .range(from, to))
    if (error && (error as any).code === '42703') {
      // Column not found; try organizer_id
      ;({ data, error, count } = await db
        .from('events')
        .select('*', { count: 'exact' })
        .eq('organizer_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to))
    }
    if (error) {
      console.error('[api/events] mine query error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ events: data, page, pageSize, total: count })
  }

  let { data, error, count } = await query
  if (error && (error as any).code === '42703') {
    // Column filters not available; retry without specific filters
    ;({ data, error, count } = await db
      .from('events')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range(from, to))
  }
  if (error) {
    console.error('[api/events] list error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ events: data, page, pageSize, total: count })
}


