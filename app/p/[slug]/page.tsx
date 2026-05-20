import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Heart, Share2, Shield } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveThermometer } from "@/components/p2p/LiveThermometer";
import { MatchingGiftBanner } from "@/components/p2p/MatchingGiftBanner";
import { supabase } from "@/lib/supabase";
import { isUuid } from "@/lib/p2p/personal-campaigns";

/**
 * Public Personal Campaign page (Epic 1, US 1.1 / Sprint 1).
 *
 * Renders a single P2P fundraising page at `/p/[slug]`. The slug is unique
 * within an event (see migration 021). RLS allows anonymous reads only when
 * `status = 'active'`; non-active pages 404 for the public.
 *
 * Brand contract (ADR-0013):
 *  - Trust Blue dominates chrome, headers, security badge.
 *  - Action Orange is reserved for the donate CTA and the thermometer fill.
 *  - Mobile-first: sticky-bottom CTA on narrow viewports, generous whitespace.
 *
 * Data path (Sprint 1):
 *  - Reads from `public.personal_campaigns` via the anon client.
 *  - Donations and the "Become a fundraiser" flow are deferred (see sprint-plan).
 */

export const dynamic = "force-dynamic";

interface PersonalCampaignRow {
  id: string;
  event_id: string;
  slug: string;
  display_name: string;
  story: string | null;
  goal_amount_cents: number;
  total_raised_cents: number;
  cover_image_url: string | null;
  status: string;
}

interface PageProps {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

function eventIdFromSearchParams(
  raw?: string | string[],
): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return typeof v === "string" && isUuid(v) ? v : undefined;
}

async function loadPersonalCampaign(
  slug: string,
  eventId?: string,
): Promise<PersonalCampaignRow | null> {
  if (!supabase) return null;
  let q = supabase
    .from("personal_campaigns")
    .select(
      "id, event_id, slug, display_name, story, goal_amount_cents, total_raised_cents, cover_image_url, status",
    )
    .eq("slug", slug)
    .eq("status", "active");
  if (eventId) {
    q = q.eq("event_id", eventId);
  }
  const { data, error } = await q.maybeSingle();

  if (error) {
    return null;
  }
  return (data as PersonalCampaignRow | null) ?? null;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const eventId = eventIdFromSearchParams(searchParams?.eventId);
  const campaign = await loadPersonalCampaign(params.slug, eventId);
  if (!campaign) {
    return {
      title: "Personal Fundraiser — EventraiseHub",
    };
  }
  return {
    title: `${campaign.display_name} — EventraiseHub`,
    description:
      campaign.story?.slice(0, 160) ??
      `${campaign.display_name} is raising funds for their event on EventraiseHub.`,
  };
}

export default async function PersonalCampaignPage({ params, searchParams }: PageProps) {
  const eventId = eventIdFromSearchParams(searchParams?.eventId);
  const campaign = await loadPersonalCampaign(params.slug, eventId);
  if (!campaign) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/40 to-white">
      <Navigation />

      <main className="mx-auto max-w-3xl px-3 pb-32 pt-8 sm:px-4 sm:pb-12 sm:pt-12 lg:px-6">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-trust-700">
            Personal Fundraiser
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-trust-950 sm:text-4xl">
            {campaign.display_name}
          </h1>
        </header>

        <div className="mb-6">
          <MatchingGiftBanner eventId={campaign.event_id} />
        </div>

        <Card className="mb-8 overflow-hidden border-trust-100/90 shadow-sm shadow-trust-950/5">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-trust-600 to-trust-800 text-white shadow-md shadow-trust-900/20">
                <Heart className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-trust-950">Progress so far</CardTitle>
                <p className="text-sm text-trust-700">
                  Every contribution lifts the goal together.
                </p>
              </div>
            </div>

            <LiveThermometer
              campaignId={campaign.id}
              initialRaisedCents={campaign.total_raised_cents}
              goalCents={campaign.goal_amount_cents}
              size="lg"
              celebrateOnIncrease
            />
          </CardHeader>

          <CardContent className="space-y-6">
            {campaign.story && (
              <section aria-labelledby="story-heading">
                <h2
                  id="story-heading"
                  className="mb-2 text-lg font-semibold text-trust-950"
                >
                  About this fundraiser
                </h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                  {campaign.story}
                </p>
              </section>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/donations/new?personalCampaignId=${campaign.id}&eventId=${campaign.event_id}`}
                className="w-full sm:w-auto"
              >
                <Button size="mobile" className="w-full">
                  Donate now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="mobile"
                className="w-full sm:w-auto"
              >
                <Share2 className="mr-2 h-4 w-4" aria-hidden />
                Share fundraiser
              </Button>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-trust-100 bg-trust-50/70 p-3 text-xs text-trust-800">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-trust-700" aria-hidden />
              <p className="leading-snug">
                Donations are processed securely. PCI-compliant payments with
                bank-level encryption.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-trust-600">
          Part of an EventraiseHub event •{" "}
          <Link
            href={`/events/${campaign.event_id}`}
            className="text-trust-700 underline-offset-2 hover:underline"
          >
            View the event
          </Link>
        </p>
      </main>
    </div>
  );
}
