import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireEventAccess } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Get volunteer shifts for the event
    const { data: shifts, error: shiftsError } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('start_time', { ascending: true })

    if (shiftsError) {
      console.error('Error fetching volunteer shifts:', shiftsError)
      return NextResponse.json(
        { error: 'Failed to fetch volunteer shifts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shifts: shifts || []
    })

  } catch (error) {
    console.error('Error in volunteer shifts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params
    const body = await request.json().catch(() => ({}))
    const { title, is_active = true } = body || {}

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Require owner or admin
    const auth = await requireEventAccess(request, eventId)

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('volunteer_shifts')
      .insert({
        event_id: eventId,
        title,
        description: null,
        start_time: null,
        end_time: null,
        max_volunteers: 0, // simple yes/no: unlimited or tracked later
        current_volunteers: 0,
        is_active: !!is_active,
      })
      .select('id, title, is_active')
      .single()

    if (error) {
      console.error('Error creating volunteer shift:', error)
      return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 })
    }

    return NextResponse.json({ success: true, shift: data })
  } catch (error) {
    console.error('Error in volunteer shift create API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
