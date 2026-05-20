"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCents, progressPercent } from "@/lib/money/cents";

/**
 * P2P fundraising thermometer.
 *
 * Brand contract (ADR-0013):
 *  - Track uses neutral surfaces.
 *  - The fill uses `bg-action-500` — the platform's "Action Orange"
 *    progress fill. The fundraising thermometer is the canonical example
 *    of the "color in with Action Orange as goals are met" rule.
 *  - Surrounding chrome stays in `trust-*` tones.
 *
 * Accessibility:
 *  - The track is `role="progressbar"` with `aria-valuemin/max/now`.
 *  - A visually hidden label gives screen readers the human-readable
 *    "$X raised of $Y goal (Z%)" statement.
 */
export interface ThermometerProps {
  /** Amount raised so far, in integer cents (ADR-0011). */
  raisedCents: number;
  /** Fundraising goal, in integer cents. Zero/negative renders an empty bar. */
  goalCents: number;
  /** Optional override for the accessible label. */
  ariaLabel?: string;
  /** Optional className passed to the outer wrapper. */
  className?: string;
  /** Visual size; default `md`. */
  size?: "sm" | "md" | "lg";
  /** When true, renders the numeric summary under the bar. Default true. */
  showSummary?: boolean;
  /** Brief pulse on the fill when `raisedCents` increases (Sprint 5.2). */
  celebrateOnIncrease?: boolean;
}

const HEIGHTS: Record<NonNullable<ThermometerProps["size"]>, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function Thermometer({
  raisedCents,
  goalCents,
  ariaLabel,
  className,
  size = "md",
  showSummary = true,
  celebrateOnIncrease = false,
}: ThermometerProps) {
  const safeRaised = Math.max(0, Math.trunc(raisedCents) || 0);
  const safeGoal = Math.max(0, Math.trunc(goalCents) || 0);
  const percent = progressPercent(safeRaised, safeGoal);
  const percentRounded = Math.round(percent);
  const prevRaised = React.useRef(safeRaised);
  const [celebrate, setCelebrate] = React.useState(false);

  React.useEffect(() => {
    if (!celebrateOnIncrease) return;
    if (safeRaised > prevRaised.current) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 700);
      prevRaised.current = safeRaised;
      return () => window.clearTimeout(t);
    }
    prevRaised.current = safeRaised;
  }, [safeRaised, celebrateOnIncrease]);

  const raisedLabel = formatCents(safeRaised);
  const goalLabel = formatCents(safeGoal);
  const summary =
    safeGoal > 0
      ? `${raisedLabel} raised of ${goalLabel} goal (${percentRounded}%)`
      : `${raisedLabel} raised`;

  return (
    <div className={cn("w-full", className)} data-testid="p2p-thermometer">
      <div
        role="progressbar"
        aria-label={ariaLabel ?? summary}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentRounded}
        aria-valuetext={summary}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-trust-100",
          HEIGHTS[size],
        )}
      >
        <div
          data-testid="p2p-thermometer-fill"
          className={cn(
            "h-full rounded-full bg-action-500 transition-[width] duration-500 ease-out",
            "shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]",
            celebrate &&
              "motion-safe:animate-pulse motion-safe:ring-2 motion-safe:ring-action-400/60",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showSummary && (
        <div className="mt-2 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-trust-950" data-testid="p2p-thermometer-raised">
            {raisedLabel}
          </span>
          <span className="text-trust-700" data-testid="p2p-thermometer-goal">
            {safeGoal > 0 ? `of ${goalLabel} goal` : "raised so far"}
          </span>
        </div>
      )}

      <span className="sr-only">{summary}</span>
    </div>
  );
}

export default Thermometer;
