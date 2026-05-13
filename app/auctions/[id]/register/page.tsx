"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers";

export default function AuctionRegisterPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const auctionId = params?.id ?? "";

  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const idempotencyKey = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `reg_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user && auctionId) {
      try {
        localStorage.setItem("redirectAfterLogin", `/auctions/${auctionId}/register`);
      } catch {
        /* ignore */
      }
      router.replace("/auth/login");
    }
  }, [authLoading, user, auctionId, router]);

  useEffect(() => {
    if (!auctionId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/auctions/${auctionId}`);
        const body = await res.json();
        if (!cancelled && res.ok && body.auction) {
          setTitle(body.auction.title);
        } else if (!cancelled) {
          setTitle(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auctionId]);

  async function onRegister() {
    if (!user || !auctionId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message || body.error || "Registration failed.");
        return;
      }
      toast.success(body.replay ? "You are already registered." : "You are registered to bid.");
      router.push(`/auctions/${auctionId}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!auctionId) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-red-600">Missing auction.</main>
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-trust-700">Checking your session…</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/40 to-white">
      <Navigation />
      <main className="mx-auto max-w-lg px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <Button asChild variant="ghost" className="mb-6 text-trust-800 hover:text-trust-950">
          <Link href={`/auctions/${auctionId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to auction
          </Link>
        </Button>

        <Card className="border-trust-100 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-600 text-white">
                <CreditCard className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-trust-950">Register to bid</CardTitle>
                <CardDescription className="text-trust-700">
                  {loading ? "Loading…" : title ? title : "Auction unavailable"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-trust-800">
              PayPal vaulting at registration (ADR-0006) is wired next: you will vault a payment method here before the gala. For now, confirming registration lets you place practice bids in sandbox.
            </p>
            <Button
              type="button"
              onClick={onRegister}
              disabled={submitting || !title}
              className="w-full bg-gradient-to-r from-action-500 to-action-600 text-white hover:from-action-600 hover:to-action-700"
              size="lg"
            >
              {submitting ? "Saving…" : "Confirm registration"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
