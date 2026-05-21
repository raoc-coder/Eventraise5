/**
 * Twilio Verify v2 (Sprint 0.3a — phone auth).
 */

export interface TwilioVerifyConfig {
  accountSid: string;
  authToken: string;
  serviceSid: string;
}

export function getTwilioVerifyConfig(): TwilioVerifyConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!accountSid || !authToken || !serviceSid) return null;
  return { accountSid, authToken, serviceSid };
}

function basicAuth(cfg: TwilioVerifyConfig): string {
  return Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64");
}

async function twilioVerifyPost(
  cfg: TwilioVerifyConfig,
  path: string,
  body: Record<string, string>,
): Promise<{ ok: boolean; status: string; raw: unknown }> {
  const url = `https://verify.twilio.com/v2/Services/${cfg.serviceSid}${path}`;
  const params = new URLSearchParams(body);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(cfg)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const raw = await res.json().catch(() => ({}));
  const status = typeof (raw as { status?: string }).status === "string"
    ? (raw as { status: string }).status
    : res.ok
      ? "unknown"
      : "failed";
  return { ok: res.ok, status, raw };
}

export type VerifyChannel = "sms" | "email";

export async function sendVerificationTo(
  to: string,
  channel: VerifyChannel,
): Promise<{ ok: boolean; status: string; error?: string }> {
  const cfg = getTwilioVerifyConfig();
  if (!cfg) {
    return { ok: false, status: "unconfigured", error: "Twilio Verify is not configured" };
  }
  const { ok, status, raw } = await twilioVerifyPost(cfg, "/Verifications", {
    To: channel === "email" ? to.trim().toLowerCase() : to,
    Channel: channel,
  });
  if (!ok) {
    const msg = (raw as { message?: string })?.message || "Failed to send verification code";
    return { ok: false, status, error: msg };
  }
  return { ok: true, status };
}

export async function sendVerification(e164Phone: string): Promise<{
  ok: boolean;
  status: string;
  error?: string;
}> {
  return sendVerificationTo(e164Phone, "sms");
}

export async function sendVerificationEmail(email: string): Promise<{
  ok: boolean;
  status: string;
  error?: string;
}> {
  return sendVerificationTo(email.trim().toLowerCase(), "email");
}

export async function checkVerificationTo(
  to: string,
  code: string,
  channel: VerifyChannel,
): Promise<{ ok: boolean; status: string; error?: string }> {
  const cfg = getTwilioVerifyConfig();
  if (!cfg) {
    return { ok: false, status: "unconfigured", error: "Twilio Verify is not configured" };
  }
  const { ok, status, raw } = await twilioVerifyPost(cfg, "/VerificationCheck", {
    To: channel === "email" ? to.trim().toLowerCase() : to,
    Code: code.trim(),
  });
  if (!ok) {
    const msg = (raw as { message?: string })?.message || "Verification check failed";
    return { ok: false, status, error: msg };
  }
  if (status !== "approved") {
    return { ok: false, status, error: "Invalid or expired code" };
  }
  return { ok: true, status };
}

export async function checkVerification(
  e164Phone: string,
  code: string,
): Promise<{ ok: boolean; status: string; error?: string }> {
  return checkVerificationTo(e164Phone, code, "sms");
}

export async function checkVerificationEmail(
  email: string,
  code: string,
): Promise<{ ok: boolean; status: string; error?: string }> {
  return checkVerificationTo(email, code, "email");
}
