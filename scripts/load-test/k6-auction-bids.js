/**
 * Auction bid load stub — fill env vars before running against sandbox.
 *
 *   BIDDER_TOKEN  — Supabase JWT for a registered bidder
 *   AUCTION_ID, LOT_ID, CRON_SECRET (optional)
 */
import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://localhost:3000";
const token = __ENV.BIDDER_TOKEN;
const auctionId = __ENV.AUCTION_ID;
const lotId = __ENV.LOT_ID;

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  if (!token || !auctionId || !lotId) {
    return;
  }
  const idem = `k6_${__VU}_${__ITER}_${Date.now()}`;
  const res = http.post(
    `${baseUrl}/api/auctions/${auctionId}/lots/${lotId}/bids`,
    JSON.stringify({ amountCents: 1000 + __ITER * 100 }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idem,
      },
    },
  );
  check(res, { "bid accepted or replay": (r) => r.status === 200 || r.status === 409 });
  sleep(0.5);
}
