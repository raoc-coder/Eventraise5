"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

type MatchingGiftDto = {
  id: string;
  title: string;
  cap_cents: number;
  consumed_cents: number;
  multiplier: number | string;
};

function formatUsd(cents: number): string {
  const n = cents / 100;
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Public matching-pool banner (ADR-0013: trust chrome, action accent on progress). */
export function MatchingGiftBanner({ eventId }: { eventId: string }) {
  const [gift, setGift] = useState<MatchingGiftDto | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/matching-gifts`);
        const body = await res.json();
        if (!cancelled) {
          setGift(body.matchingGift ?? null);
        }
      } catch {
        if (!cancelled) setGift(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (gift === undefined) return null;
  if (!gift || gift.cap_cents <= 0) return null;

  const pct = Math.min(100, Math.round((100 * gift.consumed_cents) / gift.cap_cents));
  const mult =
    typeof gift.multiplier === "number"
      ? gift.multiplier
      : parseFloat(String(gift.multiplier)) || 1;

  return (
    <div className="rounded-xl border border-trust-200 bg-gradient-to-br from-trust-50 to-white p-4 shadow-sm shadow-trust-950/5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-trust-600 text-white">
          <Gift className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-trust-700">Matching gift</p>
          <p className="text-sm font-semibold text-trust-950">{gift.title}</p>
        </div>
      </div>
      <p className="mb-3 text-xs text-trust-800">
        Up to <span className="font-semibold text-action-600">{formatUsd(gift.cap_cents)}</span> matched
        {mult > 1 ? (
          <>
            {" "}
            at <span className="font-semibold text-action-600">{mult}×</span>
          </>
        ) : null}
        . Pool progress:
      </p>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-trust-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-action-500 to-action-600 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-trust-700">
        {formatUsd(gift.consumed_cents)} of {formatUsd(gift.cap_cents)} used ({pct}%)
      </p>
    </div>
  );
}
