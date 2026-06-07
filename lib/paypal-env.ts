/**
 * PayPal environment helpers (ADR-0006 / vault rehearsal).
 * Server APIs use PAYPAL_ENVIRONMENT; client UI uses NEXT_PUBLIC_PAYPAL_ENVIRONMENT.
 */

/** API routes + server capture — true unless explicitly production. */
export function isPayPalSandboxServer(): boolean {
  return process.env.PAYPAL_ENVIRONMENT !== "production";
}

/** Register page / client — true unless NEXT_PUBLIC_PAYPAL_ENVIRONMENT=production. */
export function isPayPalSandboxClient(): boolean {
  return process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT !== "production";
}
