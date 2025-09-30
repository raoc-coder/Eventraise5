import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '')
    const email = String(body?.email || '')
    const quantity = Math.max(1, Number(body?.quantity || 1))
    const type = (String(body?.type || 'rsvp') === 'ticket') ? 'ticket' : 'rsvp'

    if (!name && !email) {
      return NextResponse.json({ error: 'Name or email required' }, { status: 400 })
    }

    const { data: eventRow, error: evErr } = await supabaseAdmin
      .from('events')
      .select('id, is_published')
      .eq('id', id)
      .single()
    if (evErr || !eventRow) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .insert({
        event_id: id,
        type,
        quantity,
        name: name || null,
        email: email || null,
        status: 'confirmed',
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ registration: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}


