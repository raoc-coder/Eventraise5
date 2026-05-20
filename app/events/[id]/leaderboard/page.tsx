"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { subscribeToEventLeaderboard } from "@/lib/realtime/leaderboardChannel";

/** Fallback poll when Realtime is unavailable (ADR-0002 degradation). */
const FALLBACK_POLL_MS = 60_000;

type Individual = {
  id: string;
  slug: string;
  display_name: string;
  total_raised_cents: number;
};

type Team = {
  id: string;
  name: string;
  slug: string;
  total_raised_cents: number;
  member_count: number;
};

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function RankLabel({ rank }: { rank: number }) {
  const cls = rank === 1 ? "text-action-600" : "text-trust-600";
  return <span className={`text-xs font-bold ${cls}`}>#{rank}</span>;
}

export default function EventLeaderboardPage() {
  const params = useParams() as { id?: string };
  const eventId = params?.id ?? "";
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const prevTopRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/leaderboard?scope=all&limit=25`);
      const body = await res.json();
      if (res.ok) {
        const nextIndividuals = body.individuals ?? [];
        setIndividuals(nextIndividuals);
        setTeams(body.teams ?? []);
        const topId = nextIndividuals[0]?.id as string | undefined;
        if (topId && prevTopRef.current && prevTopRef.current !== topId) {
          const name = nextIndividuals[0]?.display_name ?? "A fundraiser";
          setLiveAnnouncement(`${name} is now leading the fundraiser board.`);
        }
        if (topId) prevTopRef.current = topId;
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!eventId || !supabase) return;

    const { unsubscribe } = subscribeToEventLeaderboard(supabase, eventId, {
      onTotalsChanged: () => {
        setLiveConnected(true);
        void load();
      },
      onError: () => setLiveConnected(false),
    });

    const fallback = setInterval(() => void load(), FALLBACK_POLL_MS);

    return () => {
      unsubscribe();
      clearInterval(fallback);
    };
  }, [eventId, load]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/30 to-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <Button asChild variant="ghost" className="mb-6 text-trust-800">
          <Link href={eventId ? `/events/${eventId}` : "/events"}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to event
          </Link>
        </Button>

        <header className="mb-8 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-action-500 text-white shadow-md">
            <Trophy className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-trust-950">Leaderboard</h1>
            <p className="text-sm text-trust-800">
              {liveConnected ? "Live updates enabled." : "Updates every minute (fallback)."}
            </p>
          </div>
        </header>

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {liveAnnouncement}
        </p>

        {loading ? (
          <p className="text-trust-700" aria-busy="true">
            Loading…
          </p>
        ) : (
          <div className="space-y-8">
            <section aria-labelledby="lb-fundraisers-heading">
              <h2 id="lb-fundraisers-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-trust-700">
                Fundraisers
              </h2>
              {individuals.length === 0 ? (
                <p className="text-sm text-trust-700">No active personal pages yet.</p>
              ) : (
                <ol className="space-y-2" aria-label="Fundraiser rankings">
                  {individuals.map((row, idx) => (
                    <li key={row.id}>
                      <Card className={idx === 0 ? "border-action-200 bg-action-50/30" : "border-trust-100"}>
                        <CardContent className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-2">
                            <RankLabel rank={idx + 1} />
                            <p className="font-semibold text-trust-950">{row.display_name}</p>
                          </div>
                          <p className="font-semibold text-action-600" aria-label={`${row.display_name} raised`}>
                            {formatUsd(row.total_raised_cents)}
                          </p>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section aria-labelledby="lb-teams-heading">
              <h2 id="lb-teams-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-trust-700">
                Teams
              </h2>
              {teams.length === 0 ? (
                <p className="text-sm text-trust-700">No teams yet.</p>
              ) : (
                <ol className="space-y-2" aria-label="Team rankings">
                  {teams.map((row, idx) => (
                    <li key={row.id}>
                      <Card className={idx === 0 ? "border-action-200 bg-action-50/30" : "border-trust-100"}>
                        <CardContent className="flex items-center justify-between py-3">
                          <div>
                            <RankLabel rank={idx + 1} />
                            <p className="font-semibold text-trust-950">{row.name}</p>
                            <p className="text-xs text-trust-700">{row.member_count} members</p>
                          </div>
                          <p className="font-semibold text-action-600" aria-label={`${row.name} team total`}>
                            {formatUsd(row.total_raised_cents)}
                          </p>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
