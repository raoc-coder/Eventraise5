import { NextRequest, NextResponse } from 'next/server'
import { requireEventAccess } from '@/lib/auth-utils'

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id: eventId, ticketId } = await params
    if (!eventId || !ticketId) {
      return NextResponse.json({ error: 'Missing event ID or ticket ID' }, { status: 400 })
    }

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, eventId)

    // Check if ticket has any sales
    const { data: registrations, error: regError } = await db
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('type', 'ticket')
      .not('status', 'eq', 'cancelled')

    if (regError) {
      console.error('[api/tickets/delete] Error checking registrations:', regError)
      return NextResponse.json({ error: 'Failed to check ticket sales' }, { status: 500 })
    }

    if (registrations && registrations.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete ticket with existing sales. Contact support if you need to remove this ticket.' 
      }, { status: 400 })
    }

    // Delete the ticket
    const { error: deleteError } = await db
      .from('event_tickets')
      .delete()
      .eq('id', ticketId)
      .eq('event_id', eventId)

    if (deleteError) {
      console.error('[api/tickets/delete] Error deleting ticket:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[api/tickets/delete] Unexpected error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const { id: eventId, ticketId } = await params
    if (!eventId || !ticketId) {
      return NextResponse.json({ error: 'Missing event ID or ticket ID' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { name, price_cents, currency, quantity_total, sales_start_at, sales_end_at } = body

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, eventId)

    // Update ticket
    const { data, error } = await db
      .from('event_tickets')
      .update({
        name: name || undefined,
        price_cents: price_cents ? Math.max(0, Number(price_cents)) : undefined,
        currency: currency || undefined,
        quantity_total: quantity_total ? Number(quantity_total) : null,
        sales_start_at: sales_start_at || null,
        sales_end_at: sales_end_at || null,
      })
      .eq('id', ticketId)
      .eq('event_id', eventId)
      .select('*')
      .single()

    if (error) {
      console.error('[api/tickets/update] Error updating ticket:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ticket: data })
  } catch (e) {
    console.error('[api/tickets/update] Unexpected error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
