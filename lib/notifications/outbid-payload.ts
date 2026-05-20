export type OutbidPayload = {
  topic?: string;
  lotId?: string;
  bidId?: string;
  outbidUserId?: string;
  newBidderId?: string;
  newAmountCents?: number;
  lotTitle?: string;
  auctionId?: string;
  auctionTitle?: string | null;
  auctionSlug?: string | null;
};

export function parseOutbidPayload(raw: unknown): OutbidPayload | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as OutbidPayload;
}

export function formatOutbidUsd(cents: number): string {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function outbidPushCopy(payload: OutbidPayload): { title: string; body: string; url: string } {
  const lotTitle = payload.lotTitle || "this lot";
  const amount = formatOutbidUsd(payload.newAmountCents ?? 0);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eventraisehub.com";
  const auctionId = payload.auctionId || "";
  const lotId = payload.lotId || "";
  const url =
    auctionId && lotId ? `${appUrl}/auctions/${auctionId}/lots/${lotId}` : appUrl;

  return {
    title: "You were outbid",
    body: `New high bid ${amount} on "${lotTitle}". Tap to bid again.`,
    url,
  };
}

export function outbidSmsCopy(payload: OutbidPayload): string {
  const copy = outbidPushCopy(payload);
  return `${copy.title}: ${copy.body} ${copy.url}`;
}
