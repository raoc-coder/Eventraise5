import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth-utils'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing payout id' }, { status: 400 })

    // Use standardized admin authentication
    const { user, db } = await requireAdminAuth(req)

    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    const body = await req.json().catch(() => ({}))
    const { status, method, reference, notes } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const updateData: any = { payout_status: status }
    if (method) updateData.payout_method = method
    if (reference) updateData.payout_reference = reference
    if (notes) updateData.payout_notes = notes
    if (status === 'completed') updateData.payout_date = new Date().toISOString()

    const { data, error: updateError } = await supabaseAdmin
      .from('event_payouts')
      .update(updateData)
      .eq('id', id)
      .select('*')

    if (updateError) {
      console.error('Error updating payout:', updateError)
      return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      payout: data?.[0],
      message: 'Payout updated successfully' 
    })
  } catch (e) {
    console.error('Error in admin payout update:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
