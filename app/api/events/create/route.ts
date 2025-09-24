import { NextRequest, NextResponse } from 'next/server'
import { ok, fail } from '@/lib/api'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { createEventSchema } from '@/lib/validators'
import { getClientKeyFromHeaders, rateLimit } from '@/lib/rate-limit'

function toIsoDate(dateStr: string) {
  // Expect YYYY-MM-DD; store start of day UTC
  return new Date(`${dateStr}T00:00:00Z`).toISOString()
}

export async function POST(req: NextRequest) {
  try {
    const db = supabaseAdmin || supabase
    if (!db) return fail('Database unavailable', 500)

    const clientKey = getClientKeyFromHeaders(req.headers as any)
    if (!rateLimit(`evt-create:${clientKey}`, 10)) return fail('Too many requests', 429)

    const raw = await req.json().catch(() => ({}))
    const body = createEventSchema.parse(raw)
    const { title, description, event_type, start_date, end_date, /* registration_deadline, goal_amount, */ max_participants, location, image_url } = body

    const todayIso = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const safeTitle = title && String(title).trim().length > 0 ? String(title).trim() : 'Untitled Event'
    const safeDescription = typeof description === 'string' ? description : ''
    // Simplify: default to direct_donation
    const safeType = typeof event_type === 'string' && event_type ? event_type : 'direct_donation'
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
    if (max_participants !== undefined && max_participants !== '') insertPayload.max_participants = Number(max_participants as any)
    if (image_url) insertPayload.image_url = image_url

    // Attempt to set ownership and publish flags if supported
    const userId = req.headers.get('x-user-id') || ''
    if (userId) {
      insertPayload.organizer_id = userId
      insertPayload.created_by = userId
    }
    insertPayload.is_published = true

    let { data, error } = await db.from('events').insert(insertPayload).select('*').single()
    if (error) {
      const msg = (error as any).message || ''
      const code = (error as any).code || ''
      if (
        code === '42703' ||
        code === 'PGRST204' ||
        msg.includes('is_published') ||
        msg.includes('created_by') ||
        msg.includes('organizer_id')
      ) {
        // Column(s) not present in this schema; retry without optional fields
        delete insertPayload.organizer_id
        delete insertPayload.created_by
        delete insertPayload.is_published
        ;({ data, error } = await db.from('events').insert(insertPayload).select('*').single())
      }
    }
    if (error) {
      console.error('[events/create] insert error', error)
      return fail(error.message || 'Failed to create event', 500, { code: (error as any).code })
    }

    return ok({ event: data })
  } catch (e: any) {
    console.error('[events/create] unexpected', e)
    return fail(e?.message || 'Unexpected error', 500)
  }
}


