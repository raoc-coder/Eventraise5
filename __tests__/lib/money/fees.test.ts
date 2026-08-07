import {
  calculatePlatformFeeCents,
  calculatePlatformFeeFromDollars,
  captureAmountMatchesOrder,
} from "@/lib/money/fees";
import { dollarsToCents } from "@/lib/money/cents";

describe("lib/money/fees (Sprint 7)", () => {
  it("computes platform fee in integer cents", () => {
    const fees = calculatePlatformFeeCents(10_000, "USD"); // $100
    expect(fees.amountCents).toBe(10_000);
    expect(fees.platformFeeCents).toBe(899); // 8.99%
    expect(fees.paypalFeeCents).toBe(Math.round(10_000 * 0.029) + 49);
    expect(fees.netAmountCents).toBe(
      fees.amountCents - fees.platformFeeCents - fees.paypalFeeCents,
    );
  });

  it("dollar wrapper matches cents conversion", () => {
    const dollars = calculatePlatformFeeFromDollars(25.5, "USD");
    const cents = calculatePlatformFeeCents(dollarsToCents(25.5), "USD");
    expect(Math.round(dollars.platformFee * 100)).toBe(cents.platformFeeCents);
    expect(Math.round(dollars.netAmount * 100)).toBe(cents.netAmountCents);
  });

  it("captureAmountMatchesOrder enforces exact cents", () => {
    expect(captureAmountMatchesOrder("5.00", 500)).toBe(true);
    expect(captureAmountMatchesOrder(5, 500)).toBe(true);
    expect(captureAmountMatchesOrder("0.01", 500)).toBe(false);
    expect(captureAmountMatchesOrder(null, 500)).toBe(false);
  });
});
