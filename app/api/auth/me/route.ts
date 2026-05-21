import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-utils";
import { resolvePlatformAdminAccess } from "@/lib/platform-admin";

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (!auth.user) {
    return NextResponse.json({
      authenticated: false,
      isOwnerAdmin: false,
      isPlatformAdmin: false,
      isSuperAdmin: false,
    });
  }

  const access = await resolvePlatformAdminAccess(auth.user);

  return NextResponse.json({
    authenticated: true,
    isOwnerAdmin: access.isPlatformAdmin,
    isPlatformAdmin: access.isPlatformAdmin,
    isSuperAdmin: access.isSuperAdmin,
    platformAdminRole: access.role,
    user: {
      id: auth.user.id,
      email: auth.user.email,
    },
  });
}
