/**
 * Platform / PayPal fee helpers in integer cents (ADR-0011 / Sprint 7).
 */
import { centsToDollars, dollarsToCents, type Cents } from "@/lib/money/cents";

export type FeeBreakdownCents = {
  amountCents: Cents;
  platformFeeCents: Cents;
  paypalFeeCents: Cents;
  totalFeesCents: Cents;
  netAmountCents: Cents;
};

/** Legacy dollar-shaped fees for existing PayPal API callers. */
export type FeeBreakdownDollars = {
  platformFee: number;
  paypalFee: number;
  totalFees: number;
  netAmount: number;
};

const PLATFORM_FEE_BPS = 899; // 8.99%

function paypalFeeCentsFor(amountCents: Cents, currency: string): Cents {
  if (currency === "INR") {
    // ~2% + ₹3 fixed
    return Math.round(amountCents * 0.02) + 300;
  }
  // ~2.9% + $0.49 fixed
  return Math.round(amountCents * 0.029) + 49;
}

/** Compute fees from an integer-cents gross amount. */
export function calculatePlatformFeeCents(
  amountCents: Cents,
  currency: string = "USD",
): FeeBreakdownCents {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new TypeError(`Expected non-negative integer cents, got ${amountCents}`);
  }
  const platformFeeCents = Math.round((amountCents * PLATFORM_FEE_BPS) / 10000);
  const paypalFeeCents = paypalFeeCentsFor(amountCents, currency);
  const totalFeesCents = platformFeeCents + paypalFeeCents;
  const netAmountCents = Math.max(0, amountCents - totalFeesCents);
  return {
    amountCents,
    platformFeeCents,
    paypalFeeCents,
    totalFeesCents,
    netAmountCents,
  };
}

/** Dollar wrapper kept for createDonationOrder / UI fee display. */
export function calculatePlatformFeeFromDollars(
  amountDollars: number,
  currency: string = "USD",
): FeeBreakdownDollars {
  const amountCents = dollarsToCents(amountDollars);
  const c = calculatePlatformFeeCents(amountCents, currency);
  return {
    platformFee: centsToDollars(c.platformFeeCents),
    paypalFee: centsToDollars(c.paypalFeeCents),
    totalFees: centsToDollars(c.totalFeesCents),
    netAmount: centsToDollars(c.netAmountCents),
  };
}

/** True when PayPal capture amount (dollars string/number) matches stored cents. */
export function captureAmountMatchesOrder(
  capturedAmount: string | number | null | undefined,
  orderAmountCents: number,
): boolean {
  if (capturedAmount == null || capturedAmount === "") return false;
  try {
    return dollarsToCents(capturedAmount) === orderAmountCents;
  } catch {
    return false;
  }
}
