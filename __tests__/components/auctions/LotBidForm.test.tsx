import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LotBidForm, type LotBidFormLot } from "@/components/auctions/LotBidForm";

const openLot: LotBidFormLot = {
  title: "Test lot",
  starting_bid_cents: 1000,
  current_high_bid_cents: 2000,
  min_increment_cents: 100,
  closes_at: new Date(Date.now() + 86_400_000).toISOString(),
  status: "open",
};

describe("components/auctions/LotBidForm", () => {
  it("renders bid input and place-bid controls", () => {
    render(
      <LotBidForm
        lot={openLot}
        amount="25"
        onAmountChange={() => {}}
        onSubmit={(e) => e.preventDefault()}
        submitting={false}
        authLoading={false}
      />,
    );

    expect(screen.getByRole("spinbutton", { name: /your bid/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /place bid/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("submits via form on desktop control", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());

    render(
      <LotBidForm
        lot={openLot}
        amount="30"
        onAmountChange={() => {}}
        onSubmit={onSubmit}
        submitting={false}
        authLoading={false}
      />,
    );

    const desktopSubmit = screen.getAllByRole("button", { name: /place bid/i })[0];
    await user.click(desktopSubmit);
    expect(onSubmit).toHaveBeenCalled();
  });
});
