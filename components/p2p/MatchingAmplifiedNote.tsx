"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  amplifiedDonationCents,
  matchingConsumptionCents,
  parseMultiplier,
} from "@/lib/p2p/matching-gifts";

type GiftDto = {
  cap_cents: number;
  consumed_cents: number;
  multiplier: number | string;
};

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Donation form: show projected match from the active pool (ADR-0013 action accent). */
export function MatchingAmplifiedNote({
  eventId,
  donationDollars,
}: {
  eventId: string;
  donationDollars: number;
}) {
  const [gift, setGift] = useState<GiftDto | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/matching-gifts`);
        const body = await res.json();
        if (!cancelled) setGift(body.matchingGift ?? null);
      } catch {
        if (!cancelled) setGift(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (!gift || donationDollars <= 0) return null;

  const donationCents = Math.round(donationDollars * 100);
  const mult = parseMultiplier(gift.multiplier);
  const matchCents = matchingConsumptionCents(
    donationCents,
    mult,
    gift.cap_cents,
    gift.consumed_cents,
  );
  if (matchCents <= 0) return null;

  const totalCents = amplifiedDonationCents(
    donationCents,
    mult,
    gift.cap_cents,
    gift.consumed_cents,
  );

  return (
    <div
      className="rounded-lg border border-action-200 bg-action-50/80 px-3 py-2 text-sm text-trust-900"
      role="status"
    >
      <p className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-action-600" aria-hidden />
        <span>
          Your <strong>{formatUsd(donationCents)}</strong> gift could unlock an extra{" "}
          <strong className="text-action-700">{formatUsd(matchCents)}</strong> from the matching pool — up to{" "}
          <strong className="text-action-700">{formatUsd(totalCents)}</strong> total impact.
        </span>
      </p>
    </div>
  );
}
