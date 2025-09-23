import { NextRequest, NextResponse } from 'next/server'

// Organizer verification: placeholder POST to request verification
export async function POST(req: NextRequest) {
	const start = Date.now()
	let body: any = {}
	try {
		body = await req.json()
	} catch {}
	const { organizer_id } = body

	const logBase = {
		path: '/api/verification',
		method: 'POST',
		timestamp: new Date().toISOString(),
		reqId: req.headers.get('x-request-id') || undefined,
	}

	if (!organizer_id) {
		console.warn('[api/verification] Bad request', { ...logBase, durationMs: Date.now() - start })
		return NextResponse.json({ error: 'organizer_id required' }, { status: 400 })
	}

	console.log('[api/verification] Queuing verification', { ...logBase, organizer_id, durationMs: Date.now() - start })
	// Pretend we queued a verification job
	return NextResponse.json({ status: 'queued', organizer_id })
}

