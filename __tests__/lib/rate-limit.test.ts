/**
 * Sprint 6 — rate limit memory path + durable-store detection.
 */
import { rateLimit, hasDurableRateLimitStore } from "@/lib/rate-limit";

describe("rateLimit (Sprint 6)", () => {
  const prevUrl = process.env.UPSTASH_REDIS_REST_URL;
  const prevToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  afterEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = prevUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = prevToken;
  });

  it("allows up to the limit then denies (memory fallback)", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const key = `test-${Date.now()}-${Math.random()}`;
    expect(await rateLimit(key, 3)).toBe(true);
    expect(await rateLimit(key, 3)).toBe(true);
    expect(await rateLimit(key, 3)).toBe(true);
    expect(await rateLimit(key, 3)).toBe(false);
  });

  it("reports durable store only when both Upstash env vars are set", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(hasDurableRateLimitStore()).toBe(false);
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(hasDurableRateLimitStore()).toBe(true);
  });
});
