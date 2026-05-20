import {
  amplifiedDonationCents,
  matchingConsumptionCents,
  parseMultiplier,
} from "@/lib/p2p/matching-gifts";

describe("matchingConsumptionCents", () => {
  it("applies multiplier up to remaining cap", () => {
    expect(matchingConsumptionCents(10000, 2, 50000, 0)).toBe(20000);
    expect(matchingConsumptionCents(10000, 2, 15000, 0)).toBe(15000);
  });

  it("returns zero when pool exhausted", () => {
    expect(matchingConsumptionCents(10000, 2, 50000, 50000)).toBe(0);
  });

  it("handles 1x multiplier", () => {
    expect(matchingConsumptionCents(5000, 1, 100000, 0)).toBe(5000);
  });
});

describe("amplifiedDonationCents", () => {
  it("sums donation and match", () => {
    expect(amplifiedDonationCents(10000, 2, 100000, 0)).toBe(30000);
  });
});

describe("parseMultiplier", () => {
  it("parses numeric strings", () => {
    expect(parseMultiplier("2.5")).toBe(2.5);
    expect(parseMultiplier(null)).toBe(1);
  });
});
