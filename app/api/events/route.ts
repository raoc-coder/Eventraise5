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
    console.log('[api/events] Fetching events for user:', userId)
    // Try filter by common creator columns, falling back gracefully
    let data, error, count
    
    // First try created_by column
    ;({ data, error, count } = await db
      .from('events')
      .select('*', { count: 'exact' })
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .range(from, to))
    
    console.log('[api/events] created_by query result:', { data: data?.length, error, count })
    
    // If created_by column doesn't exist or no results, try organizer_id
    if ((error && (error as any).code === '42703') || (data && data.length === 0)) {
      console.log('[api/events] created_by column not found or no results, trying organizer_id')
      ;({ data, error, count } = await db
        .from('events')
        .select('*', { count: 'exact' })
        .eq('organizer_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to))
      
      console.log('[api/events] organizer_id query result:', { data: data?.length, error, count })
    }
    
    // If organizer_id column doesn't exist, return empty result
    if (error && (error as any).code === '42703') {
      console.log('[api/events] organizer_id column not found, returning empty result')
      return NextResponse.json({ events: [], page, pageSize, total: 0 })
    }
    
    if (error) {
      console.error('[api/events] mine query error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('[api/events] Returning events for user:', data?.length || 0)
    return NextResponse.json({ events: data || [], page, pageSize, total: count || 0 })
  }

  // Execute the main query for all events
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


