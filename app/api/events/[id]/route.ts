import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { updateEventSchema } from '@/lib/validators'
import { ok, fail } from '@/lib/api'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(_req: Request, { params }: any) {
  // Use regular client for now
  const db = supabase
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  
  // Await params in Next.js 15
  const { id } = await params
  
  // Try to select with organizer_id first, fall back to basic select if column doesn't exist
  let { data, error } = await db.from('events').select('*, organizer_id, created_by').eq('id', id).single()
  
  if (error && (error as any).code === '42703') {
    // Column doesn't exist, try without organizer_id
    const result = await db.from('events').select('*').eq('id', id).single()
    data = result.data
    error = result.error
  }
  
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ event: data })
}

export async function PATCH(req: Request, { params }: any) {
  // Use regular client for now
  const db = supabase
  if (!db) return fail('Database unavailable', 500)
  
  // Await params in Next.js 15
  const { id } = await params
  
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
  const { data, error } = await db.from('events').update(update).eq('id', id).select('*').single()
  if (error) return fail(error.message, 500, { code: (error as any).code })
  return ok({ event: data })
}

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    // Use standardized authentication
    const { user, db } = await requireAuth(req)
    
    // Await params in Next.js 15
    const { id } = await params
    
    // First check if user owns this event
    const { data: event, error: fetchError } = await db
      .from('events')
      .select('created_by, organizer_id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('[api/events/delete] Error fetching event:', fetchError)
      return fail('Event not found', 404)
    }
    
    // Check if user is the owner (supports both created_by and organizer_id)
    const isOwner = event.created_by === user.id || event.organizer_id === user.id
    if (!isOwner) {
      return fail('You can only delete your own events', 403)
    }
    
    // Delete the event
    const { error } = await db.from('events').delete().eq('id', id)
    if (error) {
      console.error('[api/events/delete] Delete error:', error)
      return fail(error.message, 500, { code: (error as any).code })
    }
    
    return ok({ deleted: true })
  } catch (e: any) {
    console.error('[api/events/delete] unexpected', e)
    return fail(e?.message || 'Unexpected error', 500)
  }
}


