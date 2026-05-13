import { isValidBidAmount, minNextBidCents } from "@/lib/auction/bid-rules";

describe("minNextBidCents", () => {
  it("returns starting bid when there is no high bid yet", () => {
    expect(minNextBidCents(5000, 0, 100)).toBe(5000);
  });

  it("requires current high plus increment when bidding has started", () => {
    expect(minNextBidCents(5000, 5000, 100)).toBe(5100);
    expect(minNextBidCents(100, 250, 25)).toBe(275);
  });
});

describe("isValidBidAmount", () => {
  it("accepts exactly the minimum next bid", () => {
    expect(isValidBidAmount(5000, 5000, 0, 100)).toBe(true);
    expect(isValidBidAmount(5100, 5000, 5000, 100)).toBe(true);
  });

  it("rejects bids below the minimum", () => {
    expect(isValidBidAmount(5099, 5000, 5000, 100)).toBe(false);
    expect(isValidBidAmount(4999, 5000, 0, 100)).toBe(false);
  });
});
