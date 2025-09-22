import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Donor wall: recent donations from Supabase
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ donors: [] })
    }

    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const fromParam = url.searchParams.get('from')
    const toParam = url.searchParams.get('to')
    const limit = Math.max(1, Math.min(Number(limitParam) || 20, 100))

    const { data, error } = await supabase
      .from('donations')
      .select('id, donor_name, amount, created_at, status')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('donor-wall query error:', error)
      return NextResponse.json({ donors: [] })
    }

    let rows = data || []
    if (fromParam) {
      rows = rows.filter(d => new Date(d.created_at) >= new Date(fromParam))
    }
    if (toParam) {
      rows = rows.filter(d => new Date(d.created_at) <= new Date(toParam))
    }

    const donors = rows.map(d => ({
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

