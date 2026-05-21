"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Heart, DollarSign } from "lucide-react";
import Image from "next/image";
import { PayPalDonationButton } from "@/lib/paypal-client";
import { trackMetaPixelDonation } from "@/lib/meta-pixel";
import { FundraiserAttributionBanner } from "@/components/p2p/FundraiserAttributionBanner";
import { MatchingGiftBanner } from "@/components/p2p/MatchingGiftBanner";
import { MatchingAmplifiedNote } from "@/components/p2p/MatchingAmplifiedNote";
import { isUuid } from "@/lib/p2p/personal-campaigns";
import { supabase } from "@/lib/supabase";

interface AttributedCampaign {
  id: string;
  display_name: string;
  event_id: string;
}

export interface DonationAmountFormProps {
  eventIdParam?: string;
  personalCampaignIdParam?: string;
}

export function DonationAmountForm({
  eventIdParam,
  personalCampaignIdParam,
}: DonationAmountFormProps) {
  const [amount, setAmount] = useState(25);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading] = useState(false);
  const [attribution, setAttribution] = useState<AttributedCampaign | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadAttribution() {
      if (!personalCampaignIdParam || !isUuid(personalCampaignIdParam)) {
        setAttribution(null);
        return;
      }
      if (!supabase) return;
      const { data, error } = await supabase
        .from("personal_campaigns")
        .select("id, display_name, event_id, status")
        .eq("id", personalCampaignIdParam)
        .eq("status", "active")
        .maybeSingle();
      if (cancelled || error || !data) {
        if (!cancelled) setAttribution(null);
        return;
      }
      if (eventIdParam && data.event_id !== eventIdParam) {
        setAttribution(null);
        return;
      }
      setAttribution({
        id: data.id,
        display_name: data.display_name,
        event_id: data.event_id,
      });
    }
    void loadAttribution();
    return () => {
      cancelled = true;
    };
  }, [personalCampaignIdParam, eventIdParam]);

  const eventId = eventIdParam || attribution?.event_id || "";
  const personalCampaignId = attribution?.id;

  const handlePaymentSuccess = (transactionId: string) => {
    setPaymentComplete(true);
    toast.success("Thank you for your donation!");
    trackMetaPixelDonation(amount, "USD", eventId || undefined);
    window.location.href = `/payment/success?transaction_id=${transactionId}&amount=${amount}`;
  };

  if (paymentComplete) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-trust-100">
          <Heart className="h-8 w-8 text-trust-700" aria-hidden />
        </div>
        <p className="mb-3 text-xl font-bold text-trust-800">Payment successful</p>
        <p className="text-base leading-relaxed text-trust-700">
          Thank you for your generous donation. You will receive a confirmation shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1" role="form" aria-labelledby="donate-form-title">
      <h2 id="donate-form-title" className="sr-only">
        Donation form
      </h2>
      {attribution && <FundraiserAttributionBanner displayName={attribution.display_name} />}

      {eventId && <MatchingGiftBanner eventId={eventId} />}
      {eventId && amount >= 1 && (
        <MatchingAmplifiedNote eventId={eventId} donationDollars={amount} />
      )}

      <div className="space-y-4">
        <div className="text-center">
          <Label className="mb-2 block text-lg font-semibold text-trust-950">Choose your donation amount</Label>
          <p className="text-sm text-trust-700">Select a preset amount or enter a custom amount</p>
        </div>

        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Preset donation amounts">
          {[1, 5, 10, 25, 50, 100].map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amount === preset ? "secondary" : "outline"}
              onClick={() => setAmount(preset)}
              aria-pressed={amount === preset}
              className="h-14 text-lg font-semibold"
            >
              <DollarSign className="mr-1 h-5 w-5" aria-hidden />
              {preset}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <Label htmlFor="donation-custom-amount" className="text-base font-medium text-trust-800">
              Or enter a custom amount
            </Label>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="font-medium text-trust-700" aria-hidden>
              $
            </span>
            <Input
              id="donation-custom-amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              type="number"
              min="1"
              step="1"
              aria-label="Custom donation amount in US dollars"
              inputMode="numeric"
              className="h-12 w-32 border-2 border-trust-200 text-center text-lg font-semibold focus:border-trust-500"
              placeholder="0"
            />
            <span className="font-medium text-trust-700">USD</span>
          </div>
        </div>
      </div>

      {amount > 0 && (
        <div
          className="space-y-3 rounded-xl border border-trust-200 bg-trust-50 p-4"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <h3 className="text-center font-semibold text-trust-950">Payment summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-trust-800">Donation amount</span>
              <span className="font-semibold text-trust-950">${amount.toFixed(2)}</span>
            </div>
            <div className="border-t border-trust-300 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-trust-950">You&apos;ll be charged</span>
                <span className="text-xl font-bold text-trust-800">${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs leading-relaxed text-trust-600">
            Fees are deducted from your donation so the organizer receives the net amount.
          </p>
        </div>
      )}

      {amount > 0 && (
        <div className="space-y-4" aria-label="Complete your donation with PayPal">
          <p className="text-center text-sm text-trust-600">Secure payment powered by PayPal</p>
          <div className="flex justify-center">
            <Image
              src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
              alt="PayPal accepted"
              width={111}
              height={69}
              className="h-8 w-auto"
              priority
            />
          </div>
          <PayPalDonationButton
            amount={amount}
            eventId={eventId || ""}
            personalCampaignId={personalCampaignId}
            onSuccess={() => handlePaymentSuccess("paypal")}
            onError={(err) => toast.error(err)}
            disabled={loading || amount < 1}
          />
        </div>
      )}
    </div>
  );
}
