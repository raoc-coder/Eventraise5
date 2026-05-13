/**
 * Pure helpers mirroring anti-snipe window rules (ADR-0007) for tests / UI hints.
 */

/** True when `now` is within the last 60 seconds before `closesAt` (and before close). */
export function isInsideAntiSnipeWindow(closesAtMs: number, nowMs: number): boolean {
  if (!Number.isFinite(closesAtMs) || !Number.isFinite(nowMs)) return false;
  if (nowMs >= closesAtMs) return false;
  return closesAtMs - nowMs <= 60_000;
}
