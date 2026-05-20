/**
 * PayPal Vault + vaulted capture for auctions (ADR-0006).
 */

import { calculatePlatformFee, paypalConfig } from "@/lib/paypal";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`PayPal token failed (${response.status}): ${text.slice(0, 200)}`);
  }
  const data = JSON.parse(text) as { access_token?: string };
  if (!data.access_token) throw new Error("Missing PayPal access_token");
  return data.access_token;
}

export function isPracticeVaultToken(token: string | null | undefined): boolean {
  return token === "practice_vault" && paypalConfig.environment !== "live";
}

export async function createVaultSetupToken(returnUrl: string, cancelUrl: string): Promise<{
  ok: boolean;
  setupTokenId?: string;
  approveUrl?: string;
  error?: string;
}> {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${paypalConfig.baseUrl}/v3/vault/setup-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        payment_source: {
          paypal: {
            usage_type: "MERCHANT",
            experience_context: {
              return_url: returnUrl,
              cancel_url: cancelUrl,
            },
          },
        },
      }),
    });

    const raw = await response.text();
    const json = raw ? JSON.parse(raw) : {};
    if (!response.ok) {
      return { ok: false, error: json?.message || `setup-token failed (${response.status})` };
    }

    const approve = (json.links as { rel?: string; href?: string }[] | undefined)?.find(
      (l) => l.rel === "approve" || l.rel === "payer-action",
    );

    return {
      ok: true,
      setupTokenId: json.id as string,
      approveUrl: approve?.href,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "setup-token error" };
  }
}

export async function createVaultPaymentToken(setupTokenId: string): Promise<{
  ok: boolean;
  paymentMethodToken?: string;
  error?: string;
}> {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${paypalConfig.baseUrl}/v3/vault/payment-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        payment_source: {
          token: {
            id: setupTokenId,
            type: "SETUP_TOKEN",
          },
        },
      }),
    });

    const raw = await response.text();
    const json = raw ? JSON.parse(raw) : {};
    if (!response.ok) {
      return { ok: false, error: json?.message || `payment-token failed (${response.status})` };
    }

    const tokenId = json.id as string | undefined;
    if (!tokenId) return { ok: false, error: "Missing payment token id" };
    return { ok: true, paymentMethodToken: tokenId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "payment-token error" };
  }
}

/** Vaulted capture: create + capture order in one flow (CAPTURE intent). */
export async function captureAuctionWithVaultToken(params: {
  paymentMethodToken: string;
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  customId: string;
}): Promise<{
  ok: boolean;
  orderId?: string;
  captureId?: string;
  error?: string;
}> {
  if (isPracticeVaultToken(params.paymentMethodToken)) {
    return { ok: true, orderId: "practice_order", captureId: "practice_capture" };
  }

  const amount = (params.amountCents / 100).toFixed(2);
  const currency = params.currency.toUpperCase() === "USD" ? "USD" : params.currency.toUpperCase();

  try {
    const accessToken = await getPayPalAccessToken();
    const requestId = params.idempotencyKey.slice(0, 108);

    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currency, value: amount },
          custom_id: params.customId.slice(0, 127),
        },
      ],
      payment_source: {
        token: {
          id: params.paymentMethodToken,
          type: "PAYMENT_METHOD_TOKEN",
        },
      },
    };

    const createRes = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": requestId,
      },
      body: JSON.stringify(orderBody),
    });

    const createRaw = await createRes.text();
    const order = createRaw ? JSON.parse(createRaw) : {};
    if (!createRes.ok) {
      return { ok: false, error: order?.message || `create order failed (${createRes.status})` };
    }

    const orderId = order.id as string;
    const captureRes = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": `${requestId}_cap`.slice(0, 108),
      },
    });

    const captureRaw = await captureRes.text();
    const captured = captureRaw ? JSON.parse(captureRaw) : {};
    if (!captureRes.ok) {
      return { ok: false, orderId, error: captured?.message || `capture failed (${captureRes.status})` };
    }

    const captureId =
      captured?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      captured?.id ||
      undefined;

    return { ok: true, orderId, captureId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "vault capture error" };
  }
}

export function auctionPlatformFeeCents(gmvCents: number, currency = "USD"): number {
  const dollars = gmvCents / 100;
  const fees = calculatePlatformFee(dollars, currency);
  return Math.round(fees.platformFee * 100);
}

export function sellThroughPercent(closedWithWinner: number, totalLots: number): number {
  if (totalLots <= 0) return 0;
  return Math.round((100 * closedWithWinner) / totalLots);
}
