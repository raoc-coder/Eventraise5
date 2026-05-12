/**
 * Personal-campaign attribution helpers (Sprint 1.5 / US 1.1).
 *
 * Sprint 1 added the `personal_campaigns` table and rollup trigger on
 * `donation_requests`. Sprint 1.5 wires the donation flow so a donor arriving
 * from `/p/[slug]?eventId=…` actually has their donation credited back to
 * that personal page.
 *
 * Server-side validation lives here so:
 *   - it can be reused by both `/api/paypal/create-order` and any future
 *     non-PayPal donation entrypoint (Stripe, Apple Pay, manual);
 *   - it is unit-testable in isolation without spinning up Supabase;
 *   - the same attribution policy applies everywhere (no drift).
 *
 * Policy (Sprint 1.5):
 *   - `personalCampaignId` is optional. If absent, return `null` and let the
 *     donation flow continue against the event only.
 *   - If present, the campaign MUST exist, MUST be `status='active'`, and
 *     MUST belong to the same `event_id` as the donation. Otherwise the
 *     attribution is dropped silently (the donation still succeeds). The
 *     "drop silently" behaviour is intentional for donor UX — a paused
 *     campaign between page-load and pay-click must not break the donation.
 *     ADR-0014 covers the observability so we can alert on a high drop rate.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Minimal shape exposed to callers after a successful validation. */
export interface AttributedPersonalCampaign {
  id: string;
  event_id: string;
  status: string;
}

/**
 * Minimal interface the helper actually depends on — kept narrow so unit
 * tests can pass a plain object instead of a full Supabase client.
 */
export interface PersonalCampaignReader {
  from(table: "personal_campaigns"): {
    select(columns: string): {
      eq(column: "id", value: string): {
        maybeSingle(): Promise<{
          data: AttributedPersonalCampaign | null;
          error: { message?: string } | null;
        }>;
      };
    };
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Returns true only for the canonical RFC 4122 UUID v1–v5 shape. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Validate a personal-campaign attribution request against the database.
 *
 * Returns the campaign row when the supplied id is for an `active` campaign
 * tied to the given event. Returns `null` for every other case (missing id,
 * malformed id, not-found, wrong event, paused/cancelled, lookup error).
 * Callers should always treat `null` as "no attribution" and continue the
 * donation flow.
 */
export async function loadActivePersonalCampaign(
  client: PersonalCampaignReader | SupabaseClient,
  personalCampaignId: string | null | undefined,
  eventId: string,
): Promise<AttributedPersonalCampaign | null> {
  if (!personalCampaignId) return null;
  if (!isUuid(personalCampaignId)) return null;
  if (!isUuid(eventId)) return null;

  const { data, error } = await (client as PersonalCampaignReader)
    .from("personal_campaigns")
    .select("id, event_id, status")
    .eq("id", personalCampaignId)
    .maybeSingle();

  if (error) return null;
  if (!data) return null;
  if (data.status !== "active") return null;
  if (data.event_id !== eventId) return null;

  return data;
}
