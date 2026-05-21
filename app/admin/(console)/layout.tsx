import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { resolvePlatformAdminAccess } from "@/lib/platform-admin";
import { AdminConsoleNav } from "@/components/admin/AdminConsoleNav";
import { Navigation } from "@/components/layout/navigation";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const access = await resolvePlatformAdminAccess(user);
  if (!access.isPlatformAdmin) {
    redirect("/access-denied?scope=admin");
  }

  return (
    <>
      <Navigation />
      <AdminConsoleNav isSuperAdmin={access.isSuperAdmin} adminEmail={access.row?.email ?? user.email} />
      {children}
    </>
  );
}
