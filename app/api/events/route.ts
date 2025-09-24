import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = supabaseAdmin || supabase
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || '1')
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '12')))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const query = db.from('events').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data, page, pageSize, total: count })
}


