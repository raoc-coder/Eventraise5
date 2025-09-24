import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function toIsoDate(dateStr: string) {
  // Expect YYYY-MM-DD; store start of day UTC
  return new Date(`${dateStr}T00:00:00Z`).toISOString()
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    const body = await req.json().catch(() => ({}))
    const { title, description, event_type, start_date, end_date, registration_deadline, goal_amount, max_participants, location, image_url } = body

    if (!title || !description || !event_type || !start_date || !end_date || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const insertPayload: any = {
      title,
      description,
      event_type,
      start_date: toIsoDate(start_date),
      end_date: toIsoDate(end_date),
      location,
    }

    if (registration_deadline) insertPayload.registration_deadline = toIsoDate(registration_deadline)
    if (goal_amount) insertPayload.goal_amount = Number(goal_amount)
    if (max_participants) insertPayload.max_participants = Number(max_participants)
    if (image_url) insertPayload.image_url = image_url

    const { data, error } = await supabaseAdmin.from('events').insert(insertPayload).select('*').single()
    if (error) {
      console.error('[events/create] insert error', error)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (e) {
    console.error('[events/create] unexpected', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}


