import { NextRequest, NextResponse } from 'next/server'
import { getBraintreeGateway } from '@/lib/braintree-server'
import { supabaseAdmin } from '@/lib/supabase'

// Test-only endpoint to force-settle a sandbox transaction
// Protection: only allowed in sandbox and with X-Admin-Token header == process.env.ADMIN_TEST_TOKEN
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    if ((process.env.BRAINTREE_ENVIRONMENT || 'sandbox') !== 'sandbox') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }
    const adminHeader = req.headers.get('x-admin-token')
    if (!process.env.ADMIN_TEST_TOKEN || adminHeader !== process.env.ADMIN_TEST_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const transactionId = body?.transactionId as string
    if (!transactionId) return NextResponse.json({ error: 'transactionId required' }, { status: 400 })

    const gateway = await getBraintreeGateway()
    const testing: any = (gateway as any).testing
    if (!testing?.settle) {
      return NextResponse.json({ error: 'Testing API not available' }, { status: 500 })
    }

    // Force settlement in sandbox
    const result = await testing.settle(transactionId)
    if (!result) {
      return NextResponse.json({ error: 'Settle failed' }, { status: 500 })
    }

    // Update our record (webhook would do this too, but we update inline here)
    await supabaseAdmin
      .from('donation_requests')
      .update({ settlement_status: 'settled', status: 'succeeded', updated_at: new Date().toISOString() })
      .eq('braintree_transaction_id', transactionId)

    return NextResponse.json({ success: true, settled: true, transactionId })
  } catch (e: any) {
    console.error('[settle-test] error', e)
    return NextResponse.json({ error: e?.message || 'Failed to settle' }, { status: 500 })
  }
}


