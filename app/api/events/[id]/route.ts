import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { updateEventSchema } from '@/lib/validators'
import { ok, fail } from '@/lib/api'

export async function GET(_req: Request, { params }: any) {
  const db = supabaseAdmin || supabase
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  const { data, error } = await db.from('events').select('*, organizer_id, created_by').eq('id', params.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ event: data })
}

export async function PATCH(req: Request, { params }: any) {
  const db = supabaseAdmin || supabase
  if (!db) return fail('Database unavailable', 500)
  const raw = await req.json().catch(() => ({}))
  const body = updateEventSchema.parse(raw)
  const toIso = (d?: string) => (d ? new Date(`${d}T00:00:00Z`).toISOString() : undefined)
  const update: any = {}
  if (body.title !== undefined) update.title = body.title
  if (body.description !== undefined) update.description = body.description
  if (body.event_type !== undefined) update.event_type = body.event_type
  if (body.start_date !== undefined) update.start_date = toIso(body.start_date)
  if (body.end_date !== undefined) update.end_date = toIso(body.end_date)
  if (body.location !== undefined) update.location = body.location
  if (body.goal_amount !== undefined) update.goal_amount = Number(body.goal_amount)
  if (body.is_public !== undefined) update.is_public = body.is_public
  const { data, error } = await db.from('events').update(update).eq('id', params.id).select('*').single()
  if (error) return fail(error.message, 500, { code: (error as any).code })
  return ok({ event: data })
}

export async function DELETE(_req: Request, { params }: any) {
  const db = supabaseAdmin || supabase
  if (!db) return fail('Database unavailable', 500)
  const { error } = await db.from('events').delete().eq('id', params.id)
  if (error) return fail(error.message, 500, { code: (error as any).code })
  return ok({ deleted: true })
}


