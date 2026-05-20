import { sendDeliveryRow, type DeliveryRow } from "@/lib/notifications/send-delivery";

jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: null,
}));

jest.mock("@/lib/twilio-sms", () => ({
  sendSms: jest.fn(),
}));

describe("lib/notifications/send-delivery", () => {
  const payload = {
    topic: "outbid",
    lotId: "lot-1",
    bidId: "bid-2",
    outbidUserId: "user-a",
    newAmountCents: 5000,
    lotTitle: "Dinner for two",
    auctionId: "auc-1",
  };

  it("skips email channel without sending", async () => {
    const row: DeliveryRow = {
      id: "x",
      dedupe_key: "outbid:lot-1:user-a:bid-2",
      channel: "email",
      status: "pending",
      payload,
      user_id: "user-a",
    };
    const result = await sendDeliveryRow(row);
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe("email_channel_removed");
  });

  it("fails when user_id cannot be resolved", async () => {
    const row: DeliveryRow = {
      id: "x",
      dedupe_key: "outbid:lot-1::bid-2",
      channel: "push",
      status: "pending",
      payload: { lotId: "lot-1" },
      user_id: null,
    };
    const result = await sendDeliveryRow(row);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("missing_user_id");
  });

  it("fails push when VAPID is not configured", async () => {
    const prev = {
      VAPID_SUBJECT: process.env.VAPID_SUBJECT,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    };
    delete process.env.VAPID_SUBJECT;
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    const row: DeliveryRow = {
      id: "x",
      dedupe_key: "outbid:lot-1:user-a:bid-2",
      channel: "push",
      status: "pending",
      payload,
      user_id: "user-a",
    };
    const result = await sendDeliveryRow(row);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("vapid_not_configured");

    process.env.VAPID_SUBJECT = prev.VAPID_SUBJECT;
    process.env.VAPID_PUBLIC_KEY = prev.VAPID_PUBLIC_KEY;
    process.env.VAPID_PRIVATE_KEY = prev.VAPID_PRIVATE_KEY;
  });
});
