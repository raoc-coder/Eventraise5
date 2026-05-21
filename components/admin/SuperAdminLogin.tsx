"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Phone, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

import { supabase as sharedSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const applySession = async (session: { access_token: string; refresh_token: string }) => {
    if (!sharedSupabase) throw new Error("Authentication service unavailable");
    const { error } = await sharedSupabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (error) throw error;
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Sign-in failed");
        return;
      }
      await applySession(json.session);
      toast.success("Signed in to Admin Console");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-950 via-trust-900 to-trust-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-trust-700 bg-white shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-trust-900 text-white">
            <Shield className="h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="text-trust-950">Platform Admin Sign-In</CardTitle>
          <CardDescription className="text-trust-700">
            Separate from organizer login. Use your registered <strong>email</strong>,{" "}
            <strong>mobile</strong>, and platform admin <strong>password</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={signIn} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="flex items-center gap-1 text-trust-900">
                <Mail className="h-4 w-4" aria-hidden />
                Admin email
              </Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="admin-phone" className="flex items-center gap-1 text-trust-900">
                <Phone className="h-4 w-4" aria-hidden />
                Admin mobile (US)
              </Label>
              <Input
                id="admin-phone"
                type="tel"
                autoComplete="tel"
                placeholder="(507) 993-1292"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="flex items-center gap-1 text-trust-900">
                <KeyRound className="h-4 w-4" aria-hidden />
                Admin password
              </Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-trust-800 hover:bg-trust-900">
              {loading ? "Signing in…" : "Sign in to Admin Console"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-trust-600">
            Organizer / fundraiser?{" "}
            <Link href="/auth/login" className="font-medium text-trust-800 underline">
              User sign-in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
