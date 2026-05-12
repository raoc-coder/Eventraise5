import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders the "you're supporting [fundraiser]" affordance on the donation
 * page when a P2P attribution is present (Sprint 1.5).
 *
 * Brand contract (ADR-0013): chrome in `trust-*`, the heart accent is the
 * only `action-*` element so it reads as a small celebration without
 * competing with the donate CTA below it.
 */
export interface FundraiserAttributionBannerProps {
  /** Display name of the personal-campaign owner. */
  displayName: string;
  className?: string;
}

export function FundraiserAttributionBanner({
  displayName,
  className,
}: FundraiserAttributionBannerProps) {
  return (
    <div
      data-testid="fundraiser-attribution-banner"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-trust-200 bg-trust-50/80 p-3 sm:p-4",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-trust-100 text-action-600">
        <Heart className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-trust-700">
          You&apos;re supporting a fundraiser
        </p>
        <p className="mt-0.5 truncate text-base font-semibold text-trust-950">
          {displayName}
        </p>
      </div>
    </div>
  );
}

export default FundraiserAttributionBanner;
