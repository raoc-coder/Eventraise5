/**
 * Client-side mirror of server bid increment rules (Sprint 3 / ADR-0007 base increments).
 * Authoritative validation runs in `place_auction_bid` (migration 024).
 */

export function minNextBidCents(
  startingBidCents: number,
  currentHighBidCents: number,
  minIncrementCents: number,
): number {
  const start = Math.max(0, Math.floor(startingBidCents));
  const high = Math.max(0, Math.floor(currentHighBidCents));
  const inc = Math.max(1, Math.floor(minIncrementCents));
  if (high <= 0) return start;
  return high + inc;
}

export function isValidBidAmount(
  amountCents: number,
  startingBidCents: number,
  currentHighBidCents: number,
  minIncrementCents: number,
): boolean {
  if (!Number.isFinite(amountCents) || amountCents <= 0) return false;
  const min = minNextBidCents(startingBidCents, currentHighBidCents, minIncrementCents);
  return Math.floor(amountCents) >= min;
}
