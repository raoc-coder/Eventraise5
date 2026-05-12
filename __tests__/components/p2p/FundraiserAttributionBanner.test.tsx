import { render, screen } from "@testing-library/react";
import { FundraiserAttributionBanner } from "@/components/p2p/FundraiserAttributionBanner";

describe("components/p2p/FundraiserAttributionBanner", () => {
  it("renders the display name", () => {
    render(<FundraiserAttributionBanner displayName="Avery R." />);
    const banner = screen.getByTestId("fundraiser-attribution-banner");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent("Avery R.");
    expect(banner).toHaveTextContent(/You'?re supporting a fundraiser/i);
  });

  it("uses role=status with aria-live=polite for screen readers", () => {
    render(<FundraiserAttributionBanner displayName="Casey M." />);
    const banner = screen.getByTestId("fundraiser-attribution-banner");
    expect(banner).toHaveAttribute("role", "status");
    expect(banner).toHaveAttribute("aria-live", "polite");
  });

  it("uses trust-* chrome and an action-* accent (ADR-0013)", () => {
    render(<FundraiserAttributionBanner displayName="Casey M." />);
    const banner = screen.getByTestId("fundraiser-attribution-banner");
    expect(banner.className).toMatch(/border-trust-200/);
    expect(banner.className).toMatch(/bg-trust-50/);
    // The action-orange accent lives on the heart-icon wrapper inside the banner.
    expect(banner.innerHTML).toMatch(/text-action-600/);
  });

  it("accepts an extra className without dropping defaults", () => {
    render(
      <FundraiserAttributionBanner displayName="Casey M." className="mb-9" />,
    );
    const banner = screen.getByTestId("fundraiser-attribution-banner");
    expect(banner.className).toMatch(/mb-9/);
    expect(banner.className).toMatch(/border-trust-200/);
  });
});
