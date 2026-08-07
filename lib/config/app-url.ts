/**
 * App URL / CORS helpers (Sprint 8 / M4).
 * NEXT_PUBLIC_APP_URL must be an exact absolute origin — never "*" or a pattern.
 */

export type AppUrlValidation =
  | { ok: true; origin: string }
  | { ok: false; error: string };

export function validateAppUrl(raw: string | undefined | null): AppUrlValidation {
  const value = (raw || "").trim();
  if (!value) {
    return { ok: false, error: "NEXT_PUBLIC_APP_URL is missing" };
  }
  if (value === "*" || value.includes("*")) {
    return { ok: false, error: "NEXT_PUBLIC_APP_URL must not contain wildcards" };
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, error: "NEXT_PUBLIC_APP_URL is not a valid absolute URL" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "NEXT_PUBLIC_APP_URL must use http or https" };
  }
  // Origin only (scheme + host + optional port) — strip path/query for CORS.
  const origin = url.origin;
  if (!origin || origin === "null") {
    return { ok: false, error: "NEXT_PUBLIC_APP_URL produced an invalid origin" };
  }
  return { ok: true, origin };
}

/** Safe CORS allow-origin for next.config / responses. Falls back to production www. */
export function corsAllowOrigin(
  raw: string | undefined | null = process.env.NEXT_PUBLIC_APP_URL,
): string {
  const v = validateAppUrl(raw);
  if (v.ok) return v.origin;
  return "https://www.eventraisehub.com";
}
