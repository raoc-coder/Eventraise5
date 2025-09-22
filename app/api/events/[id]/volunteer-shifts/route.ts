import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

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
