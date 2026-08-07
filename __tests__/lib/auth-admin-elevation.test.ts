/**
 * Documents Sprint 6 / ADR-0018: organizer phone OTP must not mint platform admin.
 * Route wiring is covered by code review + smoke; this locks the helper contract.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

describe("auth verify check — no platform admin elevation (ADR-0018)", () => {
  it("does not call createSessionForPlatformAdmin", () => {
    const src = readFileSync(
      resolve(process.cwd(), "app/api/auth/verify/check/route.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/createSessionForPlatformAdmin/);
    expect(src).toMatch(/createSessionForPhoneUser/);
    expect(src).toMatch(/is_platform_admin:\s*false/);
    const jsonReturn = src.slice(src.lastIndexOf("return NextResponse.json"));
    expect(jsonReturn).not.toMatch(/refresh_token/);
  });

  it("admin login response does not echo refresh_token", () => {
    const src = readFileSync(
      resolve(process.cwd(), "app/api/admin/auth/login/route.ts"),
      "utf8",
    );
    expect(src).toMatch(/setSession/);
    const jsonReturn = src.slice(src.lastIndexOf("return NextResponse.json"));
    expect(jsonReturn).not.toMatch(/refresh_token/);
  });
});
