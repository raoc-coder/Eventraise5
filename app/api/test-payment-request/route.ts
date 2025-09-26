import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    // Test simple donation_requests query
    const { data, error } = await supabaseAdmin
      .from('donation_requests')
      .select('id, amount_cents, status, created_at')
      .limit(5)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Test query error:', error)
      return NextResponse.json({ 
        error: 'Query failed',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Donation requests query successful',
      count: data?.length || 0,
      sample: data?.[0] || null
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}