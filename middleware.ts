import { NextResponse, type NextRequest } from "next/server";
import { getClientKeyFromHeaders, rateLimit } from "@/lib/rate-limit";

/**
 * Edge middleware — security headers + abuse controls on sensitive API paths.
 * Public donate/bid/checkout routes are intentionally not matched.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate-limit auth, admin auth, and SMS share (Sprint 6 / H6+H8).
  const sensitive =
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/admin/auth/") ||
    pathname === "/api/donations/share";

  if (sensitive && req.method !== "OPTIONS" && req.method !== "GET") {
    const key = `mw:${pathname}:${getClientKeyFromHeaders(req.headers)}`;
    const allowed = await rateLimit(key, 30);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "rate_limited", message: "Too many requests" },
        { status: 429 },
      );
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/admin/auth/:path*",
    "/api/donations/share",
  ],
};
