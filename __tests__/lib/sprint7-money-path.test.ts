import { readFileSync } from "fs";
import { resolve } from "path";

describe("Sprint 7 money-path wiring", () => {
  it("capture-order uses shared settlePaypalCapture", () => {
    const src = readFileSync(
      resolve(process.cwd(), "app/api/paypal/capture-order/route.ts"),
      "utf8",
    );
    expect(src).toMatch(/settlePaypalCapture/);
    expect(src).toMatch(/capturedAmount:\s*captureResult\.amount/);
  });

  it("webhook uses shared settlePaypalCapture", () => {
    const src = readFileSync(
      resolve(process.cwd(), "app/api/paypal/webhook/route.ts"),
      "utf8",
    );
    expect(src).toMatch(/settlePaypalCapture/);
    expect(src).toMatch(/source:\s*['\"]webhook['\"]/);
  });

  it("auction register rejects arbitrary client vault tokens", () => {
    const src = readFileSync(
      resolve(process.cwd(), "app/api/auctions/[id]/register/route.ts"),
      "utf8",
    );
    expect(src).toMatch(/token_not_allowed/);
    expect(src).toMatch(/practice_vault/);
  });

  it("migration 034 defines capture uniqueness and atomic inventory", () => {
    const src = readFileSync(
      resolve(process.cwd(), "supabase/migrations/034_money_path_integrity.sql"),
      "utf8",
    );
    expect(src).toMatch(/uq_donation_requests_paypal_capture_id/);
    expect(src).toMatch(/increment_event_ticket_sold/);
    expect(src).toMatch(/auction_vault_setups/);
  });
});
