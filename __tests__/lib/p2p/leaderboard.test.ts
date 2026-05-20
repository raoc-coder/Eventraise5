import { formatRankDelta, sortByRaisedDesc } from "@/lib/p2p/leaderboard";

describe("sortByRaisedDesc", () => {
  it("orders by total_raised_cents descending", () => {
    const sorted = sortByRaisedDesc([
      { id: "a", total_raised_cents: 100 },
      { id: "b", total_raised_cents: 500 },
      { id: "c", total_raised_cents: 200 },
    ]);
    expect(sorted.map((r) => r.id)).toEqual(["b", "c", "a"]);
  });
});

describe("formatRankDelta", () => {
  it("detects rank movement", () => {
    expect(formatRankDelta(3, 1)).toBe("up");
    expect(formatRankDelta(1, 4)).toBe("down");
    expect(formatRankDelta(2, 2)).toBe("same");
    expect(formatRankDelta(null, 1)).toBe("new");
  });
});
