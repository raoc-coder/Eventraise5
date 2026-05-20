"use client";

import { useEffect, useState } from "react";

import { Thermometer } from "@/components/p2p/Thermometer";
import { supabase } from "@/lib/supabase";
import type { ThermometerProps } from "@/components/p2p/Thermometer";

type Props = Omit<ThermometerProps, "raisedCents"> & {
  campaignId: string;
  initialRaisedCents: number;
};

/**
 * Thermometer that subscribes to `personal_campaigns` total updates (S5.2).
 */
export function LiveThermometer({ campaignId, initialRaisedCents, ...thermometerProps }: Props) {
  const [raisedCents, setRaisedCents] = useState(initialRaisedCents);

  useEffect(() => {
    setRaisedCents(initialRaisedCents);
  }, [initialRaisedCents]);

  useEffect(() => {
    const client = supabase;
    if (!client || !campaignId) return;

    const channel = client
      .channel(`public:personal_campaign:${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "personal_campaigns",
          filter: `id=eq.${campaignId}`,
        },
        (payload) => {
          const next = Number((payload.new as { total_raised_cents?: number })?.total_raised_cents ?? 0);
          if (Number.isFinite(next)) setRaisedCents(next);
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [campaignId]);

  return (
    <Thermometer raisedCents={raisedCents} celebrateOnIncrease {...thermometerProps} />
  );
}
