/**
 * Twilio Programmable Messaging (donation invites, future notification SMS).
 * Distinct from Verify (auth OTP).
 */

export function getTwilioMessagingConfig(): {
  accountSid: string;
  authToken: string;
  messagingServiceSid?: string;
  fromNumber?: string;
} | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!accountSid || !authToken) return null;
  if (!messagingServiceSid && !fromNumber) return null;
  return { accountSid, authToken, messagingServiceSid, fromNumber };
}

export async function sendSms(toE164: string, body: string): Promise<boolean> {
  const cfg = getTwilioMessagingConfig();
  if (!cfg) return false;

  const params = new URLSearchParams({ To: toE164, Body: body });
  if (cfg.messagingServiceSid) {
    params.set("MessagingServiceSid", cfg.messagingServiceSid);
  } else if (cfg.fromNumber) {
    params.set("From", cfg.fromNumber);
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  return res.ok;
}
