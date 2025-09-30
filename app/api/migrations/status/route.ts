import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type ColumnCheck = {
  table: string
  column: string
}

async function checkColumnExists(table: string, column: string) {
  try {
    // Try selecting just this column; if the column doesn't exist, PostgREST returns 42703
    const { error } = await (supabaseAdmin as any)
      .from(table)
      .select(`${column}`)
      .limit(1)

    if (error) {
      // 42703 = undefined_column
      if ((error as any).code === '42703') return false
      // Other errors: be conservative and surface them to caller
      return { error }
    }
    return true
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

export async function GET(_req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  }

  const checks: ColumnCheck[] = [
    // donation_requests manual settlement
    { table: 'donation_requests', column: 'fee_cents' },
    { table: 'donation_requests', column: 'net_cents' },
    { table: 'donation_requests', column: 'settlement_status' },
    { table: 'donation_requests', column: 'braintree_transaction_id' },
    // events core ownership/visibility/type
    { table: 'events', column: 'created_by' },
    { table: 'events', column: 'is_published' },
    { table: 'events', column: 'event_type' },
    // RSVP/Tickets presence
    { table: 'event_registrations', column: 'id' },
    { table: 'event_tickets', column: 'id' },
  ]

  const results: Record<string, any> = {}

  for (const { table, column } of checks) {
    const key = `${table}.${column}`
    const res = await checkColumnExists(table, column)
    results[key] = res === true ? true : res === false ? false : res
  }

  const summary = {
    donation_requests: {
      fee_cents: results['donation_requests.fee_cents'] === true,
      net_cents: results['donation_requests.net_cents'] === true,
      settlement_status: results['donation_requests.settlement_status'] === true,
      braintree_transaction_id: results['donation_requests.braintree_transaction_id'] === true,
    },
    events: {
      created_by: results['events.created_by'] === true,
      is_published: results['events.is_published'] === true,
      event_type: results['events.event_type'] === true,
    },
    rsvp_tickets: {
      event_registrations: results['event_registrations.id'] === true,
      event_tickets: results['event_tickets.id'] === true,
    },
  }

  return NextResponse.json({ ok: true, summary, raw: results })
}


