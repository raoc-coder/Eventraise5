"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminRow = {
  id: string;
  email: string;
  phoneMasked: string;
  role: string;
  displayName: string | null;
  isActive: boolean;
};

export default function PlatformAdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-admins");
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Could not load admins");
        return;
      }
      setAdmins(body.admins ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, displayName, role: "admin" }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message || body.error || "Could not create admin");
        return;
      }
      toast.success("Admin invited — they can sign in at /admin/login");
      setEmail("");
      setPhone("");
      setDisplayName("");
      void load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: AdminRow) {
    const res = await fetch("/api/admin/platform-admins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, isActive: !row.isActive }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.message || "Update failed");
      return;
    }
    toast.success(row.isActive ? "Admin deactivated" : "Admin reactivated");
    void load();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform admins</h1>
          <p className="mt-1 text-gray-600">
            Super admins can add admins who sign in at{" "}
            <code className="rounded bg-gray-100 px-1 text-sm">/admin/login</code> with their email, phone, and
            the same email, phone, and shared admin password (no Twilio for now).
          </p>
        </header>

        <Card className="mb-8 border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <UserPlus className="h-5 w-5" aria-hidden />
              Add admin
            </CardTitle>
            <CardDescription>No OTP — they must use the email and phone you enter here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAdmin} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-email">Email</Label>
                <Input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="new-phone">Phone (US)</Label>
                <Input id="new-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="new-name">Display name (optional)</Label>
                <Input id="new-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Create admin"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Active roster</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Loading…</p>
            ) : admins.length === 0 ? (
              <p className="text-gray-600">No admins yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {admins.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {a.displayName || a.email}
                        {a.role === "super_admin" && (
                          <span className="ml-2 rounded bg-trust-100 px-2 py-0.5 text-xs text-trust-800">
                            super admin
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {a.email} · {a.phoneMasked}
                      </p>
                    </div>
                    {a.role !== "super_admin" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void toggleActive(a)}
                      >
                        {a.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
