"use client";

import { Button } from "@/components/ui/button";

export type LotBidFormLot = {
  title: string;
  starting_bid_cents: number;
  current_high_bid_cents: number;
  min_increment_cents: number;
  closes_at: string;
  extension_count?: number;
  status: string;
};

export interface LotBidFormProps {
  lot: LotBidFormLot;
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  authLoading: boolean;
  formId?: string;
}

function bidDisabled(lot: LotBidFormLot, submitting: boolean): boolean {
  return submitting || lot.status !== "open" || new Date(lot.closes_at) <= new Date();
}

function submitLabel(authLoading: boolean, submitting: boolean): string {
  if (authLoading) return "Checking session…";
  if (submitting) return "Placing bid…";
  return "Place bid";
}

export function LotBidForm({
  lot,
  amount,
  onAmountChange,
  onSubmit,
  submitting,
  authLoading,
  formId = "lot-bid-form",
}: LotBidFormProps) {
  const disabled = bidDisabled(lot, submitting);
  const label = submitLabel(authLoading, submitting);

  const submitButton = (
    <Button
      type="submit"
      disabled={disabled}
      aria-busy={submitting}
      className="w-full bg-gradient-to-r from-action-500 to-action-600 py-6 text-lg font-semibold text-white hover:from-action-600 hover:to-action-700 sm:py-6"
    >
      {label}
    </Button>
  );

  return (
    <>
      <form id={formId} onSubmit={onSubmit} className="space-y-4" aria-labelledby="bid-form-heading">
        <h2 id="bid-form-heading" className="sr-only">
          Place your bid
        </h2>
        <div>
          <label htmlFor="bid-amt" className="mb-1 block text-sm font-medium text-trust-900">
            Your bid (USD)
          </label>
          <input
            id="bid-amt"
            type="number"
            min={0.01}
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            aria-describedby="lot-current-high bid-amt-hint"
            inputMode="decimal"
            autoComplete="off"
            className="w-full rounded-lg border border-trust-200 px-3 py-3 text-lg text-trust-950 shadow-sm focus:border-trust-500 focus:outline-none focus:ring-2 focus:ring-trust-500/30"
          />
          <p id="bid-amt-hint" className="mt-1 text-xs text-trust-600">
            Enter an amount at or above the minimum next bid shown after you submit.
          </p>
        </div>
        <div className="hidden sm:block">{submitButton}</div>
        {lot.status !== "open" && (
          <p className="text-center text-sm text-trust-700">This lot is not accepting bids ({lot.status}).</p>
        )}
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-trust-100 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur sm:hidden">
        <Button
          type="submit"
          form={formId}
          disabled={disabled}
          aria-busy={submitting}
          className="w-full bg-gradient-to-r from-action-500 to-action-600 py-5 text-lg font-semibold text-white hover:from-action-600 hover:to-action-700"
        >
          {label}
        </Button>
      </div>
    </>
  );
}
