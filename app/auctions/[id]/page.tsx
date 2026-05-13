"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Gavel, ArrowRight, UserPlus } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Auction = {
  id: string;
  event_id: string;
  title: string;
  slug: string;
};

type Lot = {
  id: string;
  title: string;
  starting_bid_cents: number;
  min_increment_cents: number;
  current_high_bid_cents: number;
  closes_at: string;
  status: string;
};

export default function AuctionOverviewPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ?? "";
  const [auction, setAuction] = useState<Auction | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [aRes, lRes] = await Promise.all([
          fetch(`/api/auctions/${id}`),
          fetch(`/api/auctions/${id}/lots`),
        ]);
        const aJson = await aRes.json();
        const lJson = await lRes.json();
        if (!cancelled) {
          setAuction(aRes.ok ? aJson.auction ?? null : null);
          setLots(lRes.ok ? lJson.lots ?? [] : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-red-600">Missing auction id.</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/40 to-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <header className="mb-8 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-trust-700 text-white shadow-md">
            <Gavel className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-trust-700">Auction</p>
            {loading ? (
              <h1 className="text-2xl font-bold text-trust-950">Loading…</h1>
            ) : auction ? (
              <h1 className="text-2xl font-bold text-trust-950 sm:text-3xl">{auction.title}</h1>
            ) : (
              <h1 className="text-2xl font-bold text-trust-950">Not available</h1>
            )}
            {auction && (
              <Button asChild variant="link" className="mt-1 h-auto p-0 text-trust-800">
                <Link href={`/events/${auction.event_id}`}>View parent event</Link>
              </Button>
            )}
          </div>
        </header>

        {auction && (
          <div className="mb-6">
            <Button asChild className="w-full bg-gradient-to-r from-action-500 to-action-600 text-white hover:from-action-600 hover:to-action-700 sm:w-auto">
              <Link href={`/auctions/${id}/register`}>
                <UserPlus className="mr-2 h-4 w-4" aria-hidden />
                Register to bid
              </Link>
            </Button>
          </div>
        )}

        {loading ? (
          <p className="text-trust-700">Loading lots…</p>
        ) : !auction ? (
          <Card className="border-trust-100">
            <CardHeader>
              <CardTitle className="text-trust-950">Auction not found</CardTitle>
              <CardDescription className="text-trust-700">This auction may be unpublished or the link is invalid.</CardDescription>
            </CardHeader>
          </Card>
        ) : lots.length === 0 ? (
          <Card className="border-trust-100">
            <CardHeader>
              <CardTitle className="text-trust-950">No lots yet</CardTitle>
              <CardDescription className="text-trust-700">Check back after the organizer publishes items.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="space-y-3">
            {lots.map((lot) => (
              <li key={lot.id}>
                <Card className="border-trust-100 shadow-sm">
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-trust-950">{lot.title}</p>
                      <p className="text-sm text-trust-700">
                        High bid: {(lot.current_high_bid_cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}{" "}
                        · Min increment {(lot.min_increment_cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}
                      </p>
                      <p className="text-xs text-trust-600">Closes {new Date(lot.closes_at).toLocaleString()}</p>
                    </div>
                    <Button asChild variant="outline" className="border-trust-400 text-trust-900 hover:bg-trust-50">
                      <Link href={`/auctions/${id}/lots/${lot.id}`}>
                        Bid
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
