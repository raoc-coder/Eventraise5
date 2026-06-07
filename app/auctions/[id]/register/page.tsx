"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard, ExternalLink } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers";
import { isPayPalSandboxClient } from "@/lib/paypal-env";

const SETUP_TOKEN_KEY = "auction_vault_setup_token";

function RegisterForm() {
  const params = useParams() as { id?: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const auctionId = params?.id ?? "";
  const vaultReturn = searchParams?.get("vault");

  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approveUrl, setApproveUrl] = useState<string | null>(null);
  const [setupTokenId, setSetupTokenId] = useState<string | null>(null);

  const idempotencyKey = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `reg_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  const isSandbox = isPayPalSandboxClient();

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

  async function finalizeVault(tokenId: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/vault/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ setupTokenId: tokenId }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message || body.error || "Could not save payment method.");
        return;
      }
      sessionStorage.removeItem(SETUP_TOKEN_KEY);
      toast.success("Payment method saved. You can bid now.");
      router.push(`/auctions/${auctionId}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (vaultReturn !== "return" || !auctionId) return;
    const stored = sessionStorage.getItem(SETUP_TOKEN_KEY);
    if (stored) {
      void finalizeVault(stored);
    } else {
      toast.error("Vault session expired. Please link PayPal again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultReturn, auctionId]);

  async function startPayPalVault() {
    if (!user || !auctionId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/vault/setup`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message || body.error || "Could not start PayPal setup.");
        return;
      }
      if (body.setupTokenId) {
        sessionStorage.setItem(SETUP_TOKEN_KEY, body.setupTokenId);
        setSetupTokenId(body.setupTokenId);
      }
      if (body.approveUrl) {
        setApproveUrl(body.approveUrl);
        window.open(body.approveUrl, "_blank", "noopener,noreferrer");
        toast.success("Complete PayPal approval in the new tab, then return here.");
      } else {
        toast.error("No PayPal approval URL returned.");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onPracticeRegister() {
    if (!user || !auctionId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ practiceVault: true }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message || body.error || "Registration failed.");
        return;
      }
      toast.success("Sandbox registration complete (practice vault).");
      router.push(`/auctions/${auctionId}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!auctionId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-red-600">Missing auction.</main>
    );
  }

  if (authLoading || !user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-trust-700">Checking your session…</main>
    );
  }

  return (
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
            Link a PayPal payment method (vaulted). If you win, we capture only the winning amount (ADR-0006).
          </p>

          <Button
            type="button"
            onClick={startPayPalVault}
            disabled={submitting || !title}
            className="w-full bg-gradient-to-r from-action-500 to-action-600 text-white hover:from-action-600 hover:to-action-700"
            size="lg"
          >
            {submitting ? "Working…" : "Link PayPal payment method"}
          </Button>

          {approveUrl && (
            <Button asChild variant="outline" className="w-full border-trust-300">
              <a href={approveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                Open PayPal approval
              </a>
            </Button>
          )}

          {setupTokenId && vaultReturn !== "return" && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={submitting}
              onClick={() => finalizeVault(setupTokenId)}
            >
              I completed PayPal approval
            </Button>
          )}

          {isSandbox && (
            <div className="border-t border-trust-100 pt-4">
              <p className="mb-2 text-xs text-trust-700">Sandbox only — skip PayPal UI:</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={submitting}
                onClick={onPracticeRegister}
              >
                Practice register (no PayPal vault)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function AuctionRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/40 to-white">
      <Navigation />
      <Suspense
        fallback={
          <main className="mx-auto max-w-lg px-4 py-16 text-center text-trust-700">Loading…</main>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
