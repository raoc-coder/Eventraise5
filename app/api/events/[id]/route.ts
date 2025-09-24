import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin || supabase
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  const { data, error } = await db.from('events').select('*').eq('id', params.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ event: data })
}


