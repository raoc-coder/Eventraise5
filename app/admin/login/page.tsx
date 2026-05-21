import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { SuperAdminLogin } from "@/components/admin/SuperAdminLogin";
import { resolvePlatformAdminAccess } from "@/lib/platform-admin";

export const metadata = {
  title: "Admin Sign-In — EventraiseHub",
};

export default async function AdminLoginPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await resolvePlatformAdminAccess(user);
    if (access.isPlatformAdmin) {
      redirect("/admin");
    }
  }

  return <SuperAdminLogin />;
}
