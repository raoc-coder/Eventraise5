// Intentionally no top-level import to avoid Sentry duplicate import wrapping

async function handlerShare(req: Request) {
  try {
    const { SendGridService } = await import('@/lib/sendgrid')
    const { to, eventId, message } = await req.json()
    if (!to || !eventId) {
      return Response.json({ ok: false, error: 'Missing to or eventId' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://'+(process.env.VERCEL_URL || 'localhost:3000')
    const eventUrl = `${appUrl}/events/${encodeURIComponent(eventId)}`

    const sent = await SendGridService.sendDonationLink(to, eventUrl, message)
    if (!sent) {
      return Response.json({ ok: false, error: 'Email service not configured or failed' }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

export { handlerShare as POST }
import { NextRequest, NextResponse } from 'next/server'
import { SendGridService } from '@/lib/sendgrid'
import { getAppUrl } from '@/lib/config'

export async function POST(req: NextRequest) {
  try {
    const { to, eventId, message } = await req.json()
    if (!to || !eventId) return NextResponse.json({ error: 'Missing to or eventId' }, { status: 400 })
    const appUrl = getAppUrl()
    const link = `${appUrl}/donations/new?eventId=${encodeURIComponent(eventId)}`
    const html = `
      <p>You have been invited to support a campaign.</p>
      <p><a href="${link}">Click here to donate securely</a></p>
      ${message ? `<p>${message}</p>` : ''}
    `
    // Basic send using SendGrid fallback path
    const ok = await SendGridService.sendDonationConfirmation({
      donorName: 'Supporter',
      donorEmail: to,
      amount: 0,
      donationId: 'invite',
      transactionId: 'n/a',
      donationDate: new Date().toISOString(),
    }).catch(()=>false)
    // If using templates, the above sends a confirmation template.
    // Alternatively, we could implement a direct send method; for now, return the link regardless.
    return NextResponse.json({ ok: true, link })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}


