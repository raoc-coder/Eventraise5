/**
 * Rate limiting for API routes and middleware.
 *
 * Prefers Upstash Redis REST when UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN are set (durable across serverless instances).
 * Falls back to in-memory buckets (best-effort per instance only).
 */

type Bucket = { tokens: number; updatedAt: number };
const buckets: Map<string, Bucket> = new Map();

function rateLimitMemory(key: string, limitPerMinute: number): boolean {
  const now = Date.now();
  const refillMs = 60_000;
  const bucket = buckets.get(key) || { tokens: limitPerMinute, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor((elapsed / refillMs) * limitPerMinute);
  const tokens = Math.min(limitPerMinute, bucket.tokens + Math.max(0, refill));
  const allowed = tokens > 0;
  buckets.set(key, { tokens: allowed ? tokens - 1 : tokens, updatedAt: now });
  return allowed;
}

async function rateLimitUpstash(
  baseUrl: string,
  token: string,
  key: string,
  limitPerMinute: number,
): Promise<boolean> {
  // Fixed window per calendar minute — simple and shared across instances.
  const window = Math.floor(Date.now() / 60_000);
  const redisKey = `rl:${key}:${window}`;
  const url = baseUrl.replace(/\/$/, "");

  const incrRes = await fetch(`${url}/incr/${encodeURIComponent(redisKey)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!incrRes.ok) {
    console.warn("[rate-limit] Upstash INCR failed; falling back to memory", incrRes.status);
    return rateLimitMemory(key, limitPerMinute);
  }
  const incrJson = (await incrRes.json().catch(() => null)) as { result?: number } | null;
  const count = typeof incrJson?.result === "number" ? incrJson.result : Number.POSITIVE_INFINITY;

  // Best-effort TTL so keys do not accumulate.
  void fetch(`${url}/expire/${encodeURIComponent(redisKey)}/120`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => undefined);

  return count <= limitPerMinute;
}

/** Returns true if the request is allowed. */
export async function rateLimit(key: string, limitPerMinute = 20): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    try {
      return await rateLimitUpstash(url, token, key, limitPerMinute);
    } catch (e) {
      console.warn("[rate-limit] Upstash error; falling back to memory", e);
      return rateLimitMemory(key, limitPerMinute);
    }
  }
  return rateLimitMemory(key, limitPerMinute);
}

export function getClientKeyFromHeaders(headers: Headers): string {
  const xf = headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0].trim() || "unknown";
  const ua = headers.get("user-agent") || "";
  return `${ip}:${ua.slice(0, 80)}`;
}

/** True when durable store is configured (for status scripts / ADR compliance). */
export function hasDurableRateLimitStore(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}
