"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Heart, Target, ArrowLeft, Pencil } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/providers";
import { MatchingGiftBanner } from "@/components/p2p/MatchingGiftBanner";

type CampaignRow = {
  id: string;
  slug: string;
  display_name: string;
  status: string;
};

type TeamOption = { id: string; name: string };

export default function EventFundraisePage() {
  const params = useParams() as { id?: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const eventId = params?.id ?? "";
  const editSlug = searchParams?.get("edit")?.trim() || "";

  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [myCampaigns, setMyCampaigns] = useState<CampaignRow[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [story, setStory] = useState("");
  const [goalDollars, setGoalDollars] = useState("500");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [teamId, setTeamId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(false);

  const isEdit = !!editSlug;

  const idempotencyKey = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `idem_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user && eventId) {
      try {
        localStorage.setItem("redirectAfterLogin", `/events/${eventId}/fundraise${editSlug ? `?edit=${editSlug}` : ""}`);
      } catch {
        /* ignore */
      }
      router.replace("/auth/login");
    }
  }, [authLoading, user, eventId, router, editSlug]);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setEventLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || !body.event || body.event.is_published === false) {
          setEventTitle(null);
          return;
        }
        setEventTitle(body.event.title ?? "Event");
      } catch {
        if (!cancelled) setEventTitle(null);
      } finally {
        if (!cancelled) setEventLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!user || !eventId) return;
    let cancelled = false;
    (async () => {
      try {
        const [pcRes, teamsRes] = await Promise.all([
          fetch(`/api/personal-campaigns?eventId=${encodeURIComponent(eventId)}`),
          fetch(`/api/events/${eventId}/teams`),
        ]);
        if (cancelled) return;
        const pcBody = await pcRes.json();
        const teamsBody = await teamsRes.json();
        if (pcRes.ok && pcBody.campaigns) {
          setMyCampaigns(
            (pcBody.campaigns as CampaignRow[]).filter((c) => c.status !== "cancelled"),
          );
        }
        if (teamsRes.ok && teamsBody.teams) {
          setTeams(
            (teamsBody.teams as { id: string; name: string }[]).map((t) => ({
              id: t.id,
              name: t.name,
            })),
          );
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, eventId]);

  useEffect(() => {
    if (!isEdit || !editSlug || !eventId || !user) return;
    let cancelled = false;
    (async () => {
      setLoadingCampaign(true);
      try {
        const res = await fetch(
          `/api/personal-campaigns/${encodeURIComponent(editSlug)}?eventId=${encodeURIComponent(eventId)}`,
        );
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok || !body.campaign) {
          toast.error("Could not load your page.");
          return;
        }
        const c = body.campaign;
        setDisplayName(c.display_name ?? "");
        setSlug(c.slug ?? "");
        setStory(c.story ?? "");
        setGoalDollars(String((c.goal_amount_cents ?? 0) / 100));
        setCoverImageUrl(c.cover_image_url ?? "");
        setTeamId(c.team_id ?? "");
      } finally {
        if (!cancelled) setLoadingCampaign(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, editSlug, eventId, user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !eventId) return;

    const goal = Number(goalDollars);
    if (!Number.isFinite(goal) || goal < 0) {
      toast.error("Enter a valid goal amount.");
      return;
    }
    const goalAmountCents = Math.round(goal * 100);
    if (displayName.trim().length < 2) {
      toast.error("Display name must be at least 2 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const res = await fetch(
          `/api/personal-campaigns/${encodeURIComponent(editSlug)}?eventId=${encodeURIComponent(eventId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayName: displayName.trim(),
              slug: slug.trim() || undefined,
              story: story.trim(),
              goalAmountCents,
              coverImageUrl: coverImageUrl.trim() || null,
              teamId: teamId || null,
            }),
          },
        );
        const body = await res.json();
        if (!res.ok) {
          toast.error(body.message || body.error || "Could not save.");
          return;
        }
        toast.success("Page updated.");
        const outSlug = body.campaign?.slug ?? editSlug;
        router.push(`/p/${encodeURIComponent(outSlug)}?eventId=${encodeURIComponent(eventId)}`);
        return;
      }

      const res = await fetch("/api/personal-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          eventId,
          displayName: displayName.trim(),
          slug: slug.trim() || undefined,
          story: story.trim() || undefined,
          goalAmountCents,
          coverImageUrl: coverImageUrl.trim() || undefined,
          teamId: teamId || undefined,
          status: "active",
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message || body.error || "Could not create page.");
        return;
      }
      const campaign = body.campaign;
      if (!campaign?.slug) {
        toast.error("Unexpected response.");
        return;
      }
      toast.success(body.replay ? "Welcome back — your page is ready." : "Your fundraiser page is live.");
      router.push(`/p/${encodeURIComponent(campaign.slug)}?eventId=${encodeURIComponent(eventId)}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-trust-700">Checking your session…</main>
      </div>
    );
  }

  if (!eventId || eventLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-trust-700">Loading…</main>
      </div>
    );
  }

  if (!eventTitle) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-trust-800">
          <p className="mb-4">This event is not available for fundraising.</p>
          <Button asChild variant="outline">
            <Link href="/events">Browse events</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/30 to-white">
      <Navigation />
      <main className="mx-auto max-w-lg px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <Button asChild variant="ghost" className="mb-6 text-trust-800 hover:text-trust-950">
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to event
          </Link>
        </Button>

        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-trust-700">
            {isEdit ? "Edit fundraiser" : "Become a fundraiser"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-trust-950 sm:text-3xl">{eventTitle}</h1>
        </header>

        {myCampaigns.length > 0 && !isEdit && (
          <Card className="mb-6 border-trust-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-trust-950">Your pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link
                    href={`/p/${encodeURIComponent(c.slug)}?eventId=${encodeURIComponent(eventId)}`}
                    className="font-medium text-trust-800 hover:underline"
                  >
                    {c.display_name}
                  </Link>
                  <Button asChild variant="ghost" size="sm" className="text-trust-700">
                    <Link href={`/events/${eventId}/fundraise?edit=${encodeURIComponent(c.slug)}`}>
                      <Pencil className="mr-1 h-3 w-3" aria-hidden />
                      Edit
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <MatchingGiftBanner eventId={eventId} />
        </div>

        <Card className="border-trust-100 shadow-md shadow-trust-950/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-trust-600 to-trust-800 text-white shadow-md">
                <Target className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-trust-950">
                  {isEdit ? "Update your page" : "Your fundraiser"}
                </CardTitle>
                <CardDescription className="text-trust-700">
                  Set a public name, URL slug, goal, and optional team.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingCampaign && isEdit ? (
              <p className="text-trust-700">Loading your page…</p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    minLength={2}
                    className="border-trust-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated if empty on create"
                    className="border-trust-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="story">Your story</Label>
                  <textarea
                    id="story"
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    rows={4}
                    className="flex w-full rounded-md border border-trust-200 bg-white px-3 py-2 text-sm text-trust-950 shadow-sm focus-visible:ring-2 focus-visible:ring-trust-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover">Cover image URL (optional)</Label>
                  <Input
                    id="cover"
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://…"
                    className="border-trust-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal (USD)</Label>
                  <Input
                    id="goal"
                    type="number"
                    min={0}
                    value={goalDollars}
                    onChange={(e) => setGoalDollars(e.target.value)}
                    className="border-trust-200"
                  />
                </div>
                {teams.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="team">Team (optional)</Label>
                    <select
                      id="team"
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-trust-200 bg-white px-3 text-sm text-trust-950"
                    >
                      <option value="">No team</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-action-500 to-action-600 text-white hover:from-action-600 hover:to-action-700"
                  size="lg"
                >
                  <Heart className="mr-2 h-5 w-5" aria-hidden />
                  {submitting ? "Saving…" : isEdit ? "Save changes" : "Publish my page"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
