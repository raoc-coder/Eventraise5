import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolvePlatformAdminAccess } from "@/lib/platform-admin";

const sections = [
  {
    title: "Reports",
    description: "Monitor pSEO cohorts, indexing signals, and traffic diagnostics.",
    href: "/admin/reports",
    cta: "Open reports",
  },
  {
    title: "Event Payouts",
    description: "Review and update event-level payout processing lifecycle.",
    href: "/admin/payouts/events",
    cta: "Manage event payouts",
  },
  {
    title: "Donation Payouts",
    description: "Inspect donation-level settlement metrics, filters, and exports.",
    href: "/admin/payouts",
    cta: "Manage donation payouts",
  },
  {
    title: "Platform Admins",
    description: "Invite admins and manage who can sign in at /admin/login.",
    href: "/admin/admins",
    cta: "Manage admins",
    superAdminOnly: true,
  },
];

export default async function AdminHomePage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = user ? await resolvePlatformAdminAccess(user) : null;

  const visible = sections.filter((s) => !s.superAdminOnly || access?.isSuperAdmin);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
          <p className="mt-1 text-gray-600">Platform admin controls and operational reporting.</p>
          <p className="mt-2 text-sm text-gray-500">
            Sign in for admins:{" "}
            <Link href="/admin/login" className="font-medium text-trust-800 underline">
              /admin/login
            </Link>{" "}
            (email + phone + password — not Twilio, not organizer phone login).
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visible.map((item) => (
            <Card key={item.href} className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">{item.title}</CardTitle>
                <CardDescription className="text-gray-600">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={item.href}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {item.cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
