import {
  formatOutbidUsd,
  outbidPushCopy,
  outbidSmsCopy,
  parseOutbidPayload,
} from "@/lib/notifications/outbid-payload";

describe("lib/notifications/outbid-payload", () => {
  const base = {
    topic: "outbid" as const,
    lotId: "lot-1",
    bidId: "bid-2",
    outbidUserId: "user-a",
    newAmountCents: 12500,
    lotTitle: "Weekend getaway",
    auctionId: "auc-9",
  };

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://test.eventraisehub.com";
  });

  it("parses object payloads", () => {
    expect(parseOutbidPayload(base)?.lotId).toBe("lot-1");
  });

  it("rejects non-object payloads", () => {
    expect(parseOutbidPayload(null)).toBeNull();
    expect(parseOutbidPayload("x")).toBeNull();
  });

  it("formats USD from cents", () => {
    expect(formatOutbidUsd(12500)).toMatch(/\$125/);
  });

  it("builds push copy with deep link", () => {
    const copy = outbidPushCopy(base);
    expect(copy.title).toBe("You were outbid");
    expect(copy.body).toContain("Weekend getaway");
    expect(copy.body).toContain("$125");
    expect(copy.url).toBe("https://test.eventraisehub.com/auctions/auc-9/lots/lot-1");
  });

  it("SMS copy includes title, body, and URL", () => {
    const sms = outbidSmsCopy(base);
    expect(sms).toContain("You were outbid");
    expect(sms).toContain("https://test.eventraisehub.com/auctions/auc-9/lots/lot-1");
  });

  it("dedupe key shape is stable for fan-out docs", () => {
    const dedupe = `outbid:${base.lotId}:${base.outbidUserId}:${base.bidId}`;
    expect(dedupe).toBe("outbid:lot-1:user-a:bid-2");
  });
});
