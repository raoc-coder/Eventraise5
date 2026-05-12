/**
 * Integer-cents helpers for monetary math and display.
 *
 * ADR-0011: all new monetary columns introduced by Epics 1 and 2 use integer
 * cents with the `_cents` suffix. This module is the single source of truth
 * for converting between cents and display strings, and for safe arithmetic
 * on amounts. Floating-point math must not appear in auction or P2P code paths.
 */

export type Cents = number;

/** Currency codes we support today. */
export type CurrencyCode = "USD";

/** Lower bound (inclusive) for any valid amount in cents. */
export const MIN_CENTS: Cents = 0;

/** Upper bound (exclusive) — guards against unintentionally huge values. */
export const MAX_CENTS: Cents = Number.MAX_SAFE_INTEGER;

/**
 * Type guard: returns true if the value is a finite, non-negative integer
 * within the safe range. Negative or fractional values are rejected.
 */
export function isCents(value: unknown): value is Cents {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= MIN_CENTS &&
    value < MAX_CENTS
  );
}

/**
 * Parse and validate an unknown input as cents. Throws on invalid input so
 * callers (API routes, trigger code) fail loudly rather than silently
 * corrupting totals.
 */
export function toCents(value: unknown): Cents {
  if (!isCents(value)) {
    throw new TypeError(
      `Expected non-negative integer cents within safe range, got: ${String(value)}`,
    );
  }
  return value;
}

/**
 * Convert a dollar-denominated number or numeric string into cents.
 * Rounds to the nearest cent to avoid floating-point drift such as
 * `Math.round(19.99 * 100) === 1999`.
 */
export function dollarsToCents(dollars: number | string): Cents {
  const n = typeof dollars === "string" ? Number(dollars) : dollars;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) {
    throw new TypeError(
      `Expected non-negative finite number of dollars, got: ${String(dollars)}`,
    );
  }
  return Math.round(n * 100);
}

/** Convert cents to a dollars number (for legacy interop only). */
export function centsToDollars(cents: Cents): number {
  return toCents(cents) / 100;
}

/**
 * Format an integer-cents amount as a localized currency string.
 * Defaults to USD with two fraction digits, matching the rest of the app.
 */
export function formatCents(
  cents: Cents,
  options: { currency?: CurrencyCode; locale?: string; trimZeroCents?: boolean } = {},
): string {
  const { currency = "USD", locale = "en-US", trimZeroCents = false } = options;
  const safe = toCents(cents);
  const fractionDigits = trimZeroCents && safe % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(safe / 100);
}

/** Clamp a percentage value into the inclusive [0, 100] range. */
export function clampPercent(p: number): number {
  if (!Number.isFinite(p)) return 0;
  if (p < 0) return 0;
  if (p > 100) return 100;
  return p;
}

/**
 * Compute progress toward a goal as a percentage (0–100 inclusive). Returns 0
 * for non-positive goals so callers do not need to special-case missing goals.
 */
export function progressPercent(raisedCents: Cents, goalCents: Cents): number {
  const r = toCents(raisedCents);
  const g = toCents(goalCents);
  if (g <= 0) return 0;
  return clampPercent((r / g) * 100);
}

/**
 * Safely sum any number of cents amounts, throwing if any input is invalid.
 * Useful in rollup paths to avoid silently swallowing NaN.
 */
export function sumCents(...values: Cents[]): Cents {
  let total = 0;
  for (const v of values) {
    total += toCents(v);
  }
  return toCents(total);
}
