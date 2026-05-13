"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Users } from "lucide-react";

import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers";

type TeamRow = {
  id: string;
  name: string;
  slug: string;
  total_raised_cents: number;
  member_count: number;
};

export default function EventTeamsPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const eventId = params?.id ?? "";

  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}/teams`);
        const body = await res.json();
        if (!cancelled && res.ok && body.teams) {
          setTeams(body.teams);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function joinTeam(teamId: string) {
    if (!user) {
      try {
        localStorage.setItem("redirectAfterLogin", `/events/${eventId}/teams`);
      } catch {
        /* ignore */
      }
      router.push("/auth/login");
      return;
    }
    setJoining(teamId);
    try {
      const res = await fetch(`/api/teams/${teamId}/join`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Could not join team.");
        return;
      }
      toast.success(body.alreadyMember ? "You are already on this team." : "You joined the team.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setJoining(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/30 to-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <Button asChild variant="ghost" className="mb-6 text-trust-800 hover:text-trust-950">
          <Link href={eventId ? `/events/${eventId}` : "/events"}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to event
          </Link>
        </Button>

        <header className="mb-8 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-trust-600 text-white shadow-md">
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-trust-950 sm:text-3xl">Teams</h1>
            <p className="mt-1 text-sm text-trust-800">Leaderboard order by amount raised toward this event.</p>
          </div>
        </header>

        {loading ? (
          <p className="text-trust-700">Loading teams…</p>
        ) : teams.length === 0 ? (
          <Card className="border-trust-100">
            <CardHeader>
              <CardTitle className="text-trust-950">No teams yet</CardTitle>
              <CardDescription className="text-trust-700">
                Teams appear here once created. Ask your organizer to set one up, or use the API to create a team.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="space-y-3">
            {teams.map((t, idx) => (
              <li key={t.id}>
                <Card className="border-trust-100 shadow-sm">
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-action-600">Rank {idx + 1}</p>
                      <p className="text-lg font-semibold text-trust-950">{t.name}</p>
                      <p className="text-sm text-trust-700">
                        {(t.total_raised_cents / 100).toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                        })}{" "}
                        raised · {t.member_count} members
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-trust-400 text-trust-900 hover:bg-trust-50"
                      disabled={joining === t.id || authLoading}
                      onClick={() => joinTeam(t.id)}
                    >
                      {joining === t.id ? "Joining…" : "Join team"}
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
