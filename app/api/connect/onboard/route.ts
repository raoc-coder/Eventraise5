import { NextRequest, NextResponse } from 'next/server'
import { createAccountLink, createConnectAccount } from '@/lib/stripe'
import { getAppUrl } from '@/lib/config'

export async function POST(req: NextRequest) {
  try {
    const base = getAppUrl()
    const { account_id } = await req.json().catch(() => ({}))

    const account = account_id
      ? { id: account_id }
      : await createConnectAccount('express')

    const link = await createAccountLink(
      account.id,
      `${base}/dashboard?onboarding=refresh`,
      `${base}/dashboard?onboarding=return`
    )

    return NextResponse.json({ url: link.url, account_id: account.id })
  } catch (e: any) {
    console.error('connect onboard error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to create onboarding link' }, { status: 500 })
  }
}


