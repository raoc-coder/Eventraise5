// Fallback Pages Router API to avoid Sentry App Router wrapping conflicts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const { SendGridService } = await import('@/lib/sendgrid')
    const { to, eventId, message } = req.body || {}
    if (!to || !eventId) {
      return res.status(400).json({ ok: false, error: 'Missing to or eventId' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL || 'localhost:3000'}`
    const eventUrl = `${appUrl}/events/${encodeURIComponent(String(eventId))}`

    const sent = await SendGridService.sendDonationLink(String(to), eventUrl, typeof message === 'string' ? message : undefined)
    if (!sent) {
      return res.status(500).json({ ok: false, error: 'Email service not configured or failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Unexpected error' })
  }
}

