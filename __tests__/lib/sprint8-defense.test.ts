import { readFileSync } from "fs";
import { resolve } from "path";
import { validateAppUrl, corsAllowOrigin } from "@/lib/config/app-url";

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Sprint 8 defense in depth", () => {
  describe("CORS / app URL (M4)", () => {
    it("rejects missing, wildcard, and non-absolute values", () => {
      expect(validateAppUrl("").ok).toBe(false);
      expect(validateAppUrl("*").ok).toBe(false);
      expect(validateAppUrl("https://*.example.com").ok).toBe(false);
      expect(validateAppUrl("not-a-url").ok).toBe(false);
    });

    it("accepts absolute http(s) URLs and returns origin", () => {
      const v = validateAppUrl("https://www.eventraisehub.com/path");
      expect(v.ok).toBe(true);
      if (v.ok) expect(v.origin).toBe("https://www.eventraisehub.com");
      expect(corsAllowOrigin("https://www.eventraisehub.com")).toBe(
        "https://www.eventraisehub.com",
      );
    });
  });

  describe("health advanced (M5)", () => {
    it("gates detailed diagnostics behind auth", () => {
      const src = read("app/api/health/advanced/route.ts");
      expect(src).toMatch(/isOpsAuthorized|resolvePlatformAdminAccess/);
      expect(src).toMatch(/status:\s*['\"]ok['\"]/);
      expect(src).toMatch(/memory_usage/);
    });
  });

  describe("stub APIs retired (L)", () => {
    for (const path of [
      "app/api/ai/suggestions/route.ts",
      "app/api/insights/route.ts",
      "app/api/impact/route.ts",
      "app/api/templates/route.ts",
      "app/api/verification/route.ts",
    ]) {
      it(`${path} returns 410`, () => {
        const src = read(path);
        expect(src).toMatch(/status:\s*410/);
        expect(src).toMatch(/gone/i);
      });
    }
  });

  describe("authz guards on critical money/authz routes", () => {
    it("register rejects unpaid tickets", () => {
      const src = read("app/api/events/[id]/register/route.ts");
      expect(src).toMatch(/Ticket registration requires payment/);
      expect(src).toMatch(/type:\s*['\"]rsvp['\"]/);
    });

    it("create-order server-prices tickets", () => {
      const src = read("app/api/paypal/create-order/route.ts");
      expect(src).toMatch(/event_tickets/);
      expect(src).toMatch(/price_cents/);
      expect(src).toMatch(/calculatePlatformFeeCents|dollarsToCents/);
    });

    it("event payouts restrict completed to platform admin", () => {
      const src = read("app/api/events/[id]/payouts/route.ts");
      expect(src).toMatch(/resolvePlatformAdminAccess/);
      expect(src).toMatch(/ORGANIZER_ALLOWED_STATUSES|Only platform admins/);
    });

    it("cashout denies missing owner", () => {
      const src = read("app/api/organizer/payouts/cashout/route.ts");
      expect(src).toMatch(/!ownerId\s*\|\|\s*ownerId\s*!==\s*userId/);
    });

    it("draft event GET requires owner/platform admin", () => {
      const src = read("app/api/events/[id]/route.ts");
      expect(src).toMatch(/is_published\s*===\s*false/);
      expect(src).toMatch(/authenticateRequest|checkEventAccess|resolvePlatformAdminAccess/);
    });
  });
});
