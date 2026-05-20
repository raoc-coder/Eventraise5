import {
  captureIdempotencyKeyForLot,
} from "@/lib/auction/settle-lot";
import {
  auctionPlatformFeeCents,
  sellThroughPercent,
  isPracticeVaultToken,
} from "@/lib/auction/paypal-vault";

describe("captureIdempotencyKeyForLot", () => {
  it("is stable per lot", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(captureIdempotencyKeyForLot(id)).toBe(`auction_capture:${id}`);
  });
});

describe("auctionPlatformFeeCents", () => {
  it("computes fee from gmv", () => {
    expect(auctionPlatformFeeCents(10000)).toBeGreaterThan(0);
  });
});

describe("sellThroughPercent", () => {
  it("returns percentage rounded", () => {
    expect(sellThroughPercent(3, 4)).toBe(75);
    expect(sellThroughPercent(0, 0)).toBe(0);
  });
});

describe("isPracticeVaultToken", () => {
  it("allows practice token outside live", () => {
    expect(isPracticeVaultToken("practice_vault")).toBe(true);
    expect(isPracticeVaultToken("real_token")).toBe(false);
  });
});
