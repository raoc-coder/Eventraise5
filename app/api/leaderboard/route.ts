import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Leaderboard: aggregate donations by donor_name
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ topDonors: [], milestones: [] })
    }

    const { data, error } = await supabase
      .from('donations')
      .select('donor_name, amount, status')
      .eq('status', 'completed')

    if (error) {
      console.error('leaderboard query error:', error)
      return NextResponse.json({ topDonors: [], milestones: [] })
    }

    const totals: Record<string, number> = {}
    for (const row of data || []) {
      const name = row.donor_name || 'Anonymous'
      totals[name] = (totals[name] || 0) + (row.amount || 0)
    }

    const topDonors = Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((d, idx) => ({ rank: idx + 1, ...d }))

    const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0)
    const milestones = [
      { id: 'm_total_5k', label: 'Reached $5k', achieved: totalAmount >= 5000 },
      { id: 'm_total_10k', label: 'Reached $10k', achieved: totalAmount >= 10000 },
    ]

    return NextResponse.json({ topDonors, milestones })
  } catch (e) {
    console.error('leaderboard handler error:', e)
    return NextResponse.json({ topDonors: [], milestones: [] })
  }
}

