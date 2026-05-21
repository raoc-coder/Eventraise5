import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { LotBidForm, type LotBidFormLot } from "@/components/auctions/LotBidForm";
import { DonationAmountForm } from "@/components/donations/DonationAmountForm";

expect.extend(toHaveNoViolations);

jest.mock("@/lib/supabase", () => ({ supabase: null }));

jest.mock("@/lib/paypal-client", () => ({
  PayPalDonationButton: () => <div data-testid="paypal-donate-mock">PayPal</div>,
}));

jest.mock("@/components/p2p/MatchingGiftBanner", () => ({
  MatchingGiftBanner: () => null,
}));

jest.mock("@/components/p2p/MatchingAmplifiedNote", () => ({
  MatchingAmplifiedNote: () => null,
}));

jest.mock("@/lib/meta-pixel", () => ({
  trackMetaPixelDonation: jest.fn(),
}));

const openLot: LotBidFormLot = {
  title: "Weekend getaway",
  starting_bid_cents: 5000,
  current_high_bid_cents: 7500,
  min_increment_cents: 500,
  closes_at: new Date(Date.now() + 3600_000).toISOString(),
  extension_count: 0,
  status: "open",
};

describe("GA critical flows — axe (OR §5.5)", () => {
  it("bid sheet has no serious or critical axe violations", async () => {
    const { container } = render(
      <main>
        <p id="lot-current-high" aria-live="polite">
          Current high: $75.00
        </p>
        <LotBidForm
          lot={openLot}
          amount="80"
          onAmountChange={() => {}}
          onSubmit={(e) => e.preventDefault()}
          submitting={false}
          authLoading={false}
        />
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("donate flow has no serious or critical axe violations", async () => {
    const { container } = render(<DonationAmountForm />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("preset amount buttons use trust tokens, not action (CTA scarcity)", () => {
    const { container } = render(<DonationAmountForm />);
    const pressed = container.querySelector('[aria-pressed="true"]');
    expect(pressed?.className ?? "").not.toMatch(/bg-action-/);
  });
});
