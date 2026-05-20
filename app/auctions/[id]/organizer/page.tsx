"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Download } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Stats = {
  gmvCents: number;
  platformFeeCents: number;
  sellThroughPct: number;
  lotCount: number;
  openLots: number;
  closedLots: number;
  settledLots: number;
  auction: { title: string };
};

function usd(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function AuctionOrganizerPage() {
  const params = useParams() as { id?: string };
  const auctionId = params?.id ?? "";
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auctionId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/auctions/${auctionId}/stats`);
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(body.error || "Could not load stats.");
          setStats(null);
          return;
        }
        setStats(body);
        setError(null);
      } catch {
        if (!cancelled) setError("Request failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auctionId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/30 to-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <Button asChild variant="ghost" className="mb-6 text-trust-800">
          <Link href={auctionId ? `/auctions/${auctionId}` : "/events"}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to auction
          </Link>
        </Button>

        <header className="mb-8 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-trust-600 text-white shadow-md">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-trust-950">Organizer console</h1>
            <p className="text-sm text-trust-800">{stats?.auction?.title ?? "Auction"}</p>
          </div>
        </header>

        {loading ? (
          <p className="text-trust-700">Loading…</p>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-sm text-red-800">{error}</CardContent>
          </Card>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-trust-100">
                <CardHeader className="pb-2">
                  <CardDescription>GMV (high bids)</CardDescription>
                  <CardTitle className="text-2xl text-action-600">{usd(stats.gmvCents)}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-trust-100">
                <CardHeader className="pb-2">
                  <CardDescription>Platform fees (est.)</CardDescription>
                  <CardTitle className="text-2xl text-trust-950">{usd(stats.platformFeeCents)}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-trust-100">
                <CardHeader className="pb-2">
                  <CardDescription>Sell-through</CardDescription>
                  <CardTitle className="text-2xl text-trust-950">{stats.sellThroughPct}%</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-trust-100">
                <CardHeader className="pb-2">
                  <CardDescription>Lots</CardDescription>
                  <CardTitle className="text-lg text-trust-950">
                    {stats.settledLots} settled · {stats.openLots} open · {stats.lotCount} total
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Button asChild className="w-full bg-action-500 text-white hover:bg-action-600">
              <a href={`/api/auctions/${auctionId}/export`} download>
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Export winning bids (CSV)
              </a>
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
