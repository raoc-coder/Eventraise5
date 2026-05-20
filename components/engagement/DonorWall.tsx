"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { subscribeToDonorWall, type DonorWallEntry } from "@/lib/realtime/donorWallChannel";

type DonorRow = {
  id: string;
  name: string;
  amountCents: number;
  comment: string | null;
  ts: string;
};

type Props = {
  eventId: string;
  limit?: number;
  className?: string;
};

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function DonorWall({ eventId, limit = 15, className }: Props) {
  const [donors, setDonors] = useState<DonorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");

  const load = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/donor-wall?eventId=${eventId}&limit=${limit}`, { cache: "no-store" });
      const body = await res.json();
      if (res.ok && Array.isArray(body.donors)) {
        setDonors(
          body.donors.map((d: { id: string; name: string; amountCents: number; comment?: string; ts: string }) => ({
            id: d.id,
            name: d.name,
            amountCents: d.amountCents,
            comment: d.comment ?? null,
            ts: d.ts,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!eventId || !supabase) return;

    const prepend = (entry: DonorWallEntry) => {
      setDonors((prev) => {
        if (prev.some((d) => d.id === entry.id)) return prev;
        const row: DonorRow = {
          id: entry.id,
          name: entry.displayName,
          amountCents: entry.amountCents,
          comment: entry.message,
          ts: entry.createdAt,
        };
        return [row, ...prev].slice(0, limit);
      });
      setAnnouncement(`${entry.displayName} donated ${formatUsd(entry.amountCents)}.`);
    };

    const { unsubscribe } = subscribeToDonorWall(supabase, eventId, { onEntry: prepend });
    return unsubscribe;
  }, [eventId, limit]);

  return (
    <Card className={className ?? "border-trust-100"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-trust-950">
          <Heart className="h-5 w-5 text-action-500" aria-hidden />
          Recent supporters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        {loading ? (
          <p className="text-sm text-trust-700" aria-busy="true">
            Loading donor wall…
          </p>
        ) : donors.length === 0 ? (
          <p className="text-sm text-trust-700">Be the first to give — your gift will show here.</p>
        ) : (
          <ul className="space-y-3" aria-label="Recent donations">
            {donors.map((d) => (
              <li key={d.id} className="rounded-lg border border-trust-100 bg-trust-50/50 px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-trust-950">{d.name}</span>
                  <span className="text-sm font-semibold text-action-600">{formatUsd(d.amountCents)}</span>
                </div>
                {d.comment && <p className="mt-1 text-xs text-trust-700">{d.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
