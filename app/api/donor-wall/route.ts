import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Donor wall: recent donations from Supabase
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ donors: [] })
    }

    const { data, error } = await supabase
      .from('donations')
      .select('id, donor_name, amount, created_at, status')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('donor-wall query error:', error)
      return NextResponse.json({ donors: [] })
    }

    const donors = (data || []).map(d => ({
      id: d.id,
      name: d.donor_name || 'Anonymous',
      amount: d.amount,
      ts: d.created_at,
    }))

    return NextResponse.json({ donors })
  } catch (e) {
    console.error('donor-wall handler error:', e)
    return NextResponse.json({ donors: [] })
  }
}

