import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { trackEventRegistration } from '@/lib/analytics'
import { MonitoringService } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    const {
      event_id,
      participant_name,
      participant_email,
      participant_phone,
      ticket_quantity,
      total_amount,
      special_requests,
      dietary_restrictions,
      emergency_contact_name,
      emergency_contact_phone
    } = await request.json()

    // Validate required fields
    if (!event_id || !participant_name || !participant_email || !ticket_quantity) {
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

    // Check if event exists and get details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if registration is still open
    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      )
    }

    // Check if event has capacity
    if (event.max_participants && event.current_participants + ticket_quantity > event.max_participants) {
      return NextResponse.json(
        { error: 'Event is at capacity' },
        { status: 400 }
      )
    }

    // Create registration record
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .insert({
        event_id,
        participant_name,
        participant_email,
        participant_phone,
        ticket_quantity,
        total_amount,
        special_requests,
        dietary_restrictions,
        emergency_contact_name,
        emergency_contact_phone,
        status: 'pending'
      })
      .select()
      .single()

    if (registrationError) {
      console.error('Error creating registration:', registrationError)
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      )
    }

    // Track registration
    trackEventRegistration(event_id, event.title, total_amount, participant_email)

    // Track business metrics
    MonitoringService.trackBusinessMetric('event_registration', total_amount, {
      event_id,
      event_title: event.title,
      participant_email,
      ticket_quantity
    })

    return NextResponse.json({
      registration_id: registration.id,
      message: 'Registration created successfully'
    })

  } catch (error) {
    console.error('Error in event registration:', error)
    
    // Monitor critical registration errors
    MonitoringService.trackCriticalError(
      error instanceof Error ? error : new Error('Unknown registration error'),
      {
        endpoint: 'event_registration',
        error_type: 'registration_failure'
      }
    )
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
