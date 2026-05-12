import {
  buildDedupeKey as _unusedImportProbe,
} from "@/lib/notifications/dispatcher";
import {
  centsToDollars,
  clampPercent,
  dollarsToCents,
  formatCents,
  isCents,
  progressPercent,
  sumCents,
  toCents,
} from "@/lib/money/cents";

// Probe import is kept compile-time only to make sure the dispatcher module
// exports remain referenceable from tests without bundling errors.
void _unusedImportProbe;

describe("lib/money/cents", () => {
  describe("isCents / toCents", () => {
    it("accepts non-negative safe integers", () => {
      expect(isCents(0)).toBe(true);
      expect(isCents(1)).toBe(true);
      expect(isCents(123456)).toBe(true);
      expect(toCents(0)).toBe(0);
      expect(toCents(42)).toBe(42);
    });

    it("rejects negatives, fractions, NaN, Infinity, non-numbers", () => {
      expect(isCents(-1)).toBe(false);
      expect(isCents(1.5)).toBe(false);
      expect(isCents(Number.NaN)).toBe(false);
      expect(isCents(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isCents("100" as unknown)).toBe(false);

      expect(() => toCents(-5)).toThrow(TypeError);
      expect(() => toCents(1.99)).toThrow(TypeError);
      expect(() => toCents("100")).toThrow(TypeError);
    });
  });

  describe("dollarsToCents / centsToDollars", () => {
    it("rounds dollars to the nearest cent without float drift", () => {
      expect(dollarsToCents(19.99)).toBe(1999);
      expect(dollarsToCents("0.1") + dollarsToCents("0.2")).toBe(30);
      expect(dollarsToCents(100)).toBe(10000);
    });

    it("rejects invalid dollar inputs", () => {
      expect(() => dollarsToCents(-0.01)).toThrow(TypeError);
      expect(() => dollarsToCents(Number.NaN)).toThrow(TypeError);
      expect(() => dollarsToCents("abc")).toThrow(TypeError);
    });

    it("centsToDollars round-trips through dollarsToCents", () => {
      expect(centsToDollars(dollarsToCents(7.25))).toBeCloseTo(7.25, 2);
    });
  });

  describe("formatCents", () => {
    it("formats USD with two fraction digits by default", () => {
      expect(formatCents(1999)).toBe("$19.99");
      expect(formatCents(0)).toBe("$0.00");
    });

    it("trims zero cents when asked", () => {
      expect(formatCents(2500, { trimZeroCents: true })).toBe("$25");
      expect(formatCents(2501, { trimZeroCents: true })).toBe("$25.01");
    });

    it("throws on invalid cents input", () => {
      expect(() => formatCents(-1)).toThrow(TypeError);
      expect(() => formatCents(1.5)).toThrow(TypeError);
    });
  });

  describe("progressPercent / clampPercent", () => {
    it("returns 0 when the goal is zero or negative", () => {
      expect(progressPercent(1000, 0)).toBe(0);
    });

    it("returns 100 when raised >= goal", () => {
      expect(progressPercent(5000, 1000)).toBe(100);
      expect(progressPercent(1000, 1000)).toBe(100);
    });

    it("returns proportional value below the goal", () => {
      expect(progressPercent(2500, 10000)).toBeCloseTo(25, 5);
    });

    it("clamps and ignores non-finite inputs", () => {
      expect(clampPercent(-3)).toBe(0);
      expect(clampPercent(150)).toBe(100);
      expect(clampPercent(Number.NaN)).toBe(0);
    });
  });

  describe("sumCents", () => {
    it("sums valid amounts", () => {
      expect(sumCents(100, 200, 300)).toBe(600);
    });

    it("throws on any invalid amount", () => {
      expect(() => sumCents(100, -1)).toThrow(TypeError);
      expect(() => sumCents(100, 1.5)).toThrow(TypeError);
    });
  });
});
