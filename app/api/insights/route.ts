import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Performance insights from Supabase donations table
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ funnel: null, topDonors: [], dropOffs: null })
    }

    const { data, error } = await supabase
      .from('donations')
      .select('donor_name, amount, status, created_at')

    if (error) {
      console.error('insights query error:', error)
      return NextResponse.json({ funnel: null, topDonors: [], dropOffs: null })
    }

    const completed = (data || []).filter(d => d.status === 'completed')
    const starts = (data || []).length
    const completes = completed.length
    const conversion = starts ? completes / starts : 0

    const totals: Record<string, { total: number; count: number }> = {}
    for (const row of completed) {
      const name = row.donor_name || 'Anonymous'
      if (!totals[name]) totals[name] = { total: 0, count: 0 }
      totals[name].total += row.amount || 0
      totals[name].count += 1
    }
    const topDonors = Object.entries(totals)
      .map(([name, v]) => ({ name, total: v.total, count: v.count }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Drop-offs are approximated as starts - completes
    const dropOffs = { step: 'payment', count: Math.max(0, starts - completes) }

    return NextResponse.json({
      funnel: { visits: null, starts, completes, conversion },
      topDonors,
      dropOffs,
    })
  } catch (e) {
    console.error('insights handler error:', e)
    return NextResponse.json({ funnel: null, topDonors: [], dropOffs: null })
  }
}

