/**
 * URL-safe slug helpers for P2P personal campaigns and teams (Sprint 2).
 */

const MAX_LEN = 80

/** Lowercase slug from arbitrary display text; empty input yields empty string. */
export function slugifyDisplayName(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_LEN)
  return s
}

/** Normalize a user-supplied slug segment to [a-z0-9-] or fall back to slugified display name. */
export function normalizeCampaignSlug(raw: string | undefined, displayName: string): string {
  const fromRaw = raw != null ? slugifyDisplayName(raw.replace(/\s+/g, "-")) : ""
  const base = fromRaw || slugifyDisplayName(displayName) || "fundraiser"
  return base.slice(0, MAX_LEN)
}
