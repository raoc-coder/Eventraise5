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
  
  // Try to select with organizer_id and tickets first, fall back to basic select if columns don't exist
  let { data, error } = await db.from('events').select(`
    *,
    organizer_id,
    created_by,
    event_tickets!left(
      id,
      name,
      price_cents,
      currency,
      quantity_total,
      quantity_sold
    )
  `).eq('id', id).single()
  
  if (error && (error as any).code === '42703') {
    // Column doesn't exist, try without organizer_id and tickets
    const result = await db.from('events').select('*').eq('id', id).single()
    data = result.data
    error = result.error
  }
  
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  
  // Process event with ticket data
  if (data && data.event_tickets && data.event_tickets.length > 0) {
    const ticket = data.event_tickets[0] // Get first ticket
    data.is_ticketed = true
    data.ticket_price = ticket.price_cents / 100 // Convert cents to dollars
    data.ticket_currency = ticket.currency
    data.ticket_quantity = ticket.quantity_total
    data.tickets_sold = ticket.quantity_sold || 0
  } else {
    data.is_ticketed = false
  }
  
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
    console.log('[api/events/delete] Starting delete request')
    
    // Use standardized authentication
    const { user, db } = await requireAuth(req)
    console.log('[api/events/delete] User authenticated:', user.id)
    
    // Await params in Next.js 15
    const { id } = await params
    console.log('[api/events/delete] Deleting event:', id)
    
    // First check if user owns this event
    const { data: event, error: fetchError } = await db
      .from('events')
      .select('created_by, organizer_id, title')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('[api/events/delete] Error fetching event:', fetchError)
      return fail('Event not found', 404)
    }
    
    console.log('[api/events/delete] Event found:', { 
      title: event.title, 
      created_by: event.created_by, 
      organizer_id: event.organizer_id,
      user_id: user.id 
    })
    
    // Check if user is the owner (supports both created_by and organizer_id)
    const isOwner = event.created_by === user.id || event.organizer_id === user.id
    console.log('[api/events/delete] Is owner:', isOwner)
    
    if (!isOwner) {
      console.log('[api/events/delete] Access denied - not owner')
      return fail('You can only delete your own events', 403)
    }
    
    // Delete the event - try with admin client first
    console.log('[api/events/delete] Proceeding with deletion using admin client')
    const adminDb = supabaseAdmin
    if (!adminDb) {
      console.error('[api/events/delete] Admin client not available')
      return fail('Admin client unavailable', 500)
    }
    
    const { data: deletedData, error } = await adminDb.from('events').delete().eq('id', id).select()
    if (error) {
      console.error('[api/events/delete] Delete error:', error)
      return fail(error.message, 500, { code: (error as any).code })
    }
    
    console.log('[api/events/delete] Delete result:', { deletedData, error })
    
    // Verify deletion by trying to fetch the event
    const { data: verifyData, error: verifyError } = await adminDb.from('events').select('id').eq('id', id).single()
    console.log('[api/events/delete] Verification query result:', { verifyData, verifyError })
    
    if (verifyData) {
      console.error('[api/events/delete] Event still exists after deletion!')
      return fail('Event deletion failed - event still exists', 500)
    }
    
    console.log('[api/events/delete] Event deleted successfully and verified')
    return ok({ deleted: true, deletedData })
  } catch (e: any) {
    console.error('[api/events/delete] unexpected error:', e)
    return fail(e?.message || 'Unexpected error', 500)
  }
}


