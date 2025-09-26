import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { trackVolunteerSignup } from '@/lib/analytics'
import { MonitoringService } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    const {
      shift_id,
      volunteer_name,
      volunteer_email,
      volunteer_phone,
      skills,
      experience_level,
      availability_notes,
      emergency_contact_name,
      emergency_contact_phone
    } = await request.json()

    // Validate required fields
    if (!shift_id || !volunteer_name || !volunteer_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Check if shift exists and get details
    const { data: shift, error: shiftError } = await supabase
      .from('volunteer_shifts')
      .select('*')
      .eq('id', shift_id)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Volunteer shift not found' },
        { status: 404 }
      )
    }

    // Fetch event details separately
    let eventData = null
    if (shift.event_id) {
      try {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, title, start_date, end_date')
          .eq('id', shift.event_id)
          .single()
        
        if (!eventError && event) {
          eventData = event
        }
      } catch (eventFetchError) {
        console.warn('Could not fetch event details for volunteer shift:', eventFetchError)
        // Continue without event data
      }
    }

    // Check if shift is still active
    if (!shift.is_active) {
      return NextResponse.json(
        { error: 'Volunteer shift is no longer active' },
        { status: 400 }
      )
    }

    // Check if shift has capacity
    if (shift.current_volunteers >= shift.max_volunteers) {
      return NextResponse.json(
        { error: 'Volunteer shift is at capacity' },
        { status: 400 }
      )
    }

    // Check if shift time has passed
    if (new Date() > new Date(shift.start_time)) {
      return NextResponse.json(
        { error: 'Volunteer shift has already started' },
        { status: 400 }
      )
    }

    // Create volunteer signup record
    const { data: signup, error: signupError } = await supabase
      .from('volunteer_signups')
      .insert({
        shift_id,
        volunteer_name,
        volunteer_email,
        volunteer_phone,
        skills,
        experience_level,
        availability_notes,
        emergency_contact_name,
        emergency_contact_phone,
        status: 'pending'
      })
      .select()
      .single()

    if (signupError) {
      console.error('Error creating volunteer signup:', signupError)
      return NextResponse.json(
        { error: 'Failed to create volunteer signup' },
        { status: 500 }
      )
    }

    // Track volunteer signup
    if (eventData) {
      trackVolunteerSignup(eventData.id, eventData.title, shift_id, volunteer_email)

      // Track business metrics
      MonitoringService.trackBusinessMetric('volunteer_signup', 0, {
        event_id: eventData.id,
        event_title: eventData.title,
        shift_id,
        shift_title: shift.title,
        volunteer_email,
        experience_level
      })
    }

    return NextResponse.json({
      signup_id: signup.id,
      message: 'Volunteer signup created successfully'
    })

  } catch (error) {
    console.error('Error in volunteer signup:', error)
    
    // Monitor critical signup errors
    MonitoringService.trackCriticalError(
      error instanceof Error ? error : new Error('Unknown volunteer signup error'),
      {
        endpoint: 'volunteer_signup',
        error_type: 'signup_failure'
      }
    )
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
