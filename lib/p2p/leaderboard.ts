/** Rows with cents raised — sort descending for display rank. */
export function sortByRaisedDesc<T extends { total_raised_cents: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => b.total_raised_cents - a.total_raised_cents);
}

export function formatRankDelta(prevRank: number | null, nextRank: number): "up" | "down" | "same" | "new" {
  if (prevRank === null) return "new";
  if (nextRank < prevRank) return "up";
  if (nextRank > prevRank) return "down";
  return "same";
}
