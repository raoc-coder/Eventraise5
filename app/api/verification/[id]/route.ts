import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PATCH: review a verification request (approve/reject)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { status, reviewer_id } = body as { status?: 'approved' | 'rejected'; reviewer_id?: string }
    if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })
    if (!supabase) return NextResponse.json({ id, status })

    const { error } = await supabase
      .from('verification_requests')
      .update({ status, reviewed_at: new Date().toISOString(), reviewer_id: reviewer_id || null })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ id, status })
  } catch (e: any) {
    console.error('verification PATCH error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to update request' }, { status: 500 })
  }
}


