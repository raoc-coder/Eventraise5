// Very lightweight in-memory rate limiter (best-effort; per-instance)
// Use ONLY to curb accidental bursts. For production, use an external store.

type Bucket = { tokens: number; updatedAt: number }
const buckets: Map<string, Bucket> = new Map()

export function rateLimit(key: string, limitPerMinute = 20): boolean {
  const now = Date.now()
  const refillMs = 60_000
  const bucket = buckets.get(key) || { tokens: limitPerMinute, updatedAt: now }
  const elapsed = now - bucket.updatedAt
  const refill = Math.floor((elapsed / refillMs) * limitPerMinute)
  const tokens = Math.min(limitPerMinute, bucket.tokens + Math.max(0, refill))
  const allowed = tokens > 0
  buckets.set(key, { tokens: allowed ? tokens - 1 : tokens, updatedAt: now })
  return allowed
}

export function getClientKeyFromHeaders(headers: Headers): string {
  const xf = headers.get('x-forwarded-for') || ''
  const ip = xf.split(',')[0].trim() || 'unknown'
  const ua = headers.get('user-agent') || ''
  return `${ip}:${ua}`
}


