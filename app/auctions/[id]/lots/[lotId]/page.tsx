"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Shield } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers";
import { minNextBidCents } from "@/lib/auction/bid-rules";
import { supabase } from "@/lib/supabase";
import { subscribeToAuctionLot } from "@/lib/realtime/auctionChannel";

type Lot = {
  id: string;
  auction_id: string;
  title: string;
  starting_bid_cents: number;
  min_increment_cents: number;
  current_high_bid_cents: number;
  closes_at: string;
  extension_count?: number;
  status: string;
};

export default function AuctionLotBidPage() {
  const params = useParams() as { id?: string; lotId?: string };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const auctionId = params?.id ?? "";
  const lotId = params?.lotId ?? "";

  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auctionId || !lotId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/auctions/${auctionId}/lots/${lotId}`);
        const body = await res.json();
        if (!cancelled && res.ok && body.lot) {
          setLot(body.lot);
          const min = minNextBidCents(
            body.lot.starting_bid_cents,
            body.lot.current_high_bid_cents,
            body.lot.min_increment_cents,
          );
          setAmount(String(Math.max(1, Math.ceil(min / 100))));
        } else if (!cancelled) {
          setLot(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auctionId, lotId]);

  useEffect(() => {
    if (!lotId || !supabase) return;
    const { unsubscribe } = subscribeToAuctionLot(supabase, lotId, {
      onLotState: (s) => {
        setLot((prev) =>
          prev
            ? {
                ...prev,
                current_high_bid_cents: s.currentHighBidCents,
                closes_at: s.closesAt,
                extension_count: s.extensionCount,
                status: s.status ?? prev.status,
              }
            : prev,
        );
      },
    });
    return unsubscribe;
  }, [lotId]);

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      try {
        localStorage.setItem("redirectAfterLogin", `/auctions/${auctionId}/lots/${lotId}`);
      } catch {
        /* ignore */
      }
      router.push("/auth/login");
      return;
    }
    if (!lot) return;

    const dollars = Number(amount);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error("Enter a valid bid amount.");
      return;
    }
    const amountCents = Math.round(dollars * 100);
    const min = minNextBidCents(lot.starting_bid_cents, lot.current_high_bid_cents, lot.min_increment_cents);
    if (amountCents < min) {
      toast.error(`Minimum bid is ${(min / 100).toFixed(2)} USD.`);
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `bid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const res = await fetch(`/api/auctions/${auctionId}/lots/${lotId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ amountCents }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message || body.error || "Bid not accepted.");
        return;
      }
      if (body.lotExtended) {
        toast.success("Lot extended — new closing time.", { icon: "⏱️" });
      } else {
        toast.success(body.replay ? "Bid confirmed (replay)." : "Your bid is in.");
      }
      if (typeof body.closesAt === "string" && lot) {
        setLot({
          ...lot,
          current_high_bid_cents: amountCents,
          closes_at: body.closesAt,
          extension_count:
            typeof body.extensionCount === "number" ? body.extensionCount : lot.extension_count ?? 0,
        });
        const nextMin = minNextBidCents(
          lot.starting_bid_cents,
          amountCents,
          lot.min_increment_cents,
        );
        setAmount(String(Math.max(1, Math.ceil(nextMin / 100))));
      } else {
        const refetch = await fetch(`/api/auctions/${auctionId}/lots/${lotId}`);
        const j = await refetch.json();
        if (refetch.ok && j.lot) {
          setLot(j.lot);
          const nextMin = minNextBidCents(j.lot.starting_bid_cents, j.lot.current_high_bid_cents, j.lot.min_increment_cents);
          setAmount(String(Math.max(1, Math.ceil(nextMin / 100))));
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!auctionId || !lotId) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-red-600">Invalid link.</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/40 to-white pb-28 sm:pb-12">
      <Navigation />
      <main className="mx-auto max-w-lg px-4 pt-10 sm:px-6 sm:pt-14">
        <Button asChild variant="ghost" className="mb-6 text-trust-800 hover:text-trust-950">
          <Link href={`/auctions/${auctionId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            All lots
          </Link>
        </Button>

        {loading ? (
          <p className="text-trust-700">Loading lot…</p>
        ) : !lot ? (
          <Card className="border-trust-100">
            <CardHeader>
              <CardTitle className="text-trust-950">Lot not found</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-trust-950 sm:text-3xl">{lot.title}</h1>
              <p className="mt-2 text-sm text-trust-800">
                Current high:{" "}
                <span className="font-semibold text-action-600">
                  {(lot.current_high_bid_cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}
                </span>
              </p>
              <p className="text-xs text-trust-600">Closes {new Date(lot.closes_at).toLocaleString()}</p>
              {(lot.extension_count ?? 0) > 0 && (
                <p className="mt-1 text-xs font-medium text-action-600">
                  Lot extended {lot.extension_count}× (anti-snipe)
                </p>
              )}
            </header>

            <Card className="mb-6 border-trust-100">
              <CardHeader>
                <CardTitle className="text-trust-950">Secure bidding</CardTitle>
                <CardDescription className="flex items-start gap-2 text-trust-800">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-trust-600" aria-hidden />
                  Bids are validated on the server. You must register for this auction before placing bids.
                </CardDescription>
              </CardHeader>
            </Card>

            <form onSubmit={submitBid} className="space-y-4">
              <div>
                <label htmlFor="bid-amt" className="mb-1 block text-sm font-medium text-trust-900">
                  Your bid (USD)
                </label>
                <input
                  id="bid-amt"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-trust-200 px-3 py-3 text-lg text-trust-950 shadow-sm focus:border-trust-500 focus:outline-none focus:ring-2 focus:ring-trust-500/30"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || lot.status !== "open" || new Date(lot.closes_at) <= new Date()}
                className="w-full bg-gradient-to-r from-action-500 to-action-600 py-6 text-lg font-semibold text-white hover:from-action-600 hover:to-action-700 sm:py-6"
              >
                {authLoading ? "Checking session…" : submitting ? "Placing bid…" : "Place bid"}
              </Button>
              {lot.status !== "open" && (
                <p className="text-center text-sm text-trust-700">This lot is not accepting bids ({lot.status}).</p>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  );
}
