/**
 * Matching-gift math (mirrors DB trigger intent in migration 028).
 */

export function matchingConsumptionCents(
  donationCents: number,
  multiplier: number,
  capCents: number,
  consumedCents: number,
): number {
  if (donationCents <= 0 || multiplier <= 0 || capCents <= 0) return 0;
  const room = Math.max(0, capCents - consumedCents);
  const raw = Math.round(donationCents * multiplier);
  return Math.min(raw, room);
}

/** Donation + match drawn from the active pool (for donor-facing copy). */
export function amplifiedDonationCents(
  donationCents: number,
  multiplier: number,
  capCents: number,
  consumedCents: number,
): number {
  return donationCents + matchingConsumptionCents(donationCents, multiplier, capCents, consumedCents);
}

export function parseMultiplier(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  const n = parseFloat(String(value ?? "1"));
  return Number.isFinite(n) && n > 0 ? n : 1;
}
