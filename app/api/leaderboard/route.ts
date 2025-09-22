import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Leaderboard: aggregate donations by donor_name
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ topDonors: [], milestones: [] })
    }

    const url = new URL(request.url)
    const fromParam = url.searchParams.get('from')
    const toParam = url.searchParams.get('to')
    const limitParam = url.searchParams.get('limit')
    const limit = Math.max(1, Math.min(Number(limitParam) || 10, 50))

    const { data, error } = await supabase
      .from('donations')
      .select('donor_name, amount, status, created_at')
      .eq('status', 'completed')

    if (error) {
      console.error('leaderboard query error:', error)
      return NextResponse.json({ topDonors: [], milestones: [] })
    }

    let rows = data || []
    if (fromParam) rows = rows.filter(r => new Date(r.created_at) >= new Date(fromParam))
    if (toParam) rows = rows.filter(r => new Date(r.created_at) <= new Date(toParam))

    const totals: Record<string, number> = {}
    for (const row of rows) {
      const name = row.donor_name || 'Anonymous'
      totals[name] = (totals[name] || 0) + (row.amount || 0)
    }

    const topDonors = Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
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

