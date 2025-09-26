import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    const { id: requestId } = await params

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 })
    }

    // Fetch donation request details
    const { data, error } = await supabaseAdmin
      .from('donation_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error) {
      console.error('Failed to fetch payment request:', error)
      return NextResponse.json({ 
        error: 'Payment request not found' 
      }, { status: 404 })
    }

    // If there's an event_id, try to fetch event details separately
    let eventData = null
    if (data.event_id) {
      try {
        const { data: event, error: eventError } = await supabaseAdmin
          .from('events')
          .select('id, title, description, start_date, end_date, location')
          .eq('id', data.event_id)
          .single()
        
        if (!eventError && event) {
          eventData = event
        }
      } catch (eventFetchError) {
        console.warn('Could not fetch event details:', eventFetchError)
        // Continue without event data
      }
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'Payment request not found' 
      }, { status: 404 })
    }

    // Check if request is still pending
    if (data.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Payment request has already been processed' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      paymentRequest: {
        ...data,
        events: eventData
      },
      event_id: data.event_id,
      amount: data.amount_cents / 100,
      currency: data.currency,
      donor_name: data.donor_name,
      donor_email: data.donor_email
    })

  } catch (error) {
    console.error('Payment request fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch payment request' 
    }, { status: 500 })
  }
}