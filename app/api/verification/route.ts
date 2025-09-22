import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST: create a verification request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { organizer_id } = body
    if (!organizer_id) return NextResponse.json({ error: 'organizer_id required' }, { status: 400 })
    if (!supabase) return NextResponse.json({ status: 'queued', organizer_id })

    const { data, error } = await supabase
      .from('verification_requests')
      .insert({ organizer_id, status: 'pending', created_at: new Date().toISOString() })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ status: 'queued', id: data.id })
  } catch (e: any) {
    console.error('verification POST error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to create request' }, { status: 500 })
  }
}

// GET: list verification requests (basic listing)
export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ requests: [] })
    const { data, error } = await supabase
      .from('verification_requests')
      .select('id, organizer_id, status, created_at, reviewed_at, reviewer_id')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ requests: data || [] })
  } catch (e: any) {
    console.error('verification GET error:', e)
    return NextResponse.json({ requests: [] })
  }
}

