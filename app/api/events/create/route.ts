import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

function toIsoDate(dateStr: string) {
  // Expect YYYY-MM-DD; store start of day UTC
  return new Date(`${dateStr}T00:00:00Z`).toISOString()
}

export async function POST(req: NextRequest) {
  try {
    const db = supabaseAdmin || supabase
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    const body = await req.json().catch(() => ({}))
    const { title, description, event_type, start_date, end_date, /* registration_deadline, goal_amount, */ max_participants, location, image_url } = body

    const todayIso = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const safeTitle = title && String(title).trim().length > 0 ? String(title).trim() : 'Untitled Event'
    const safeDescription = typeof description === 'string' ? description : ''
    // Pick a broadly valid default across schema variants
    const safeType = typeof event_type === 'string' && event_type ? event_type : 'fundraiser'
    const safeStart = typeof start_date === 'string' && start_date ? start_date : todayIso
    const safeEnd = typeof end_date === 'string' && end_date ? end_date : todayIso
    const safeLocation = typeof location === 'string' && location ? location : 'TBD'

    const insertPayload: any = {
      title: safeTitle,
      description: safeDescription,
      event_type: safeType,
      start_date: toIsoDate(safeStart),
      end_date: toIsoDate(safeEnd),
      location: safeLocation,
    }

    // registration_deadline and goal_amount are not present in older schemas; omit to be compatible
    if (max_participants !== undefined && max_participants !== '') insertPayload.max_participants = Number(max_participants)
    if (image_url) insertPayload.image_url = image_url

    const { data, error } = await db.from('events').insert(insertPayload).select('*').single()
    if (error) {
      console.error('[events/create] insert error', error)
      return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (e) {
    console.error('[events/create] unexpected', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}


