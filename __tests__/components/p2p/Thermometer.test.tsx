import { render, screen, within } from "@testing-library/react";
import { Thermometer } from "@/components/p2p/Thermometer";

describe("components/p2p/Thermometer", () => {
  it("renders a progressbar with proper ARIA values", () => {
    render(<Thermometer raisedCents={2500} goalCents={10000} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "25");
    expect(bar).toHaveAttribute(
      "aria-valuetext",
      "$25.00 raised of $100.00 goal (25%)",
    );
  });

  it("fills with Action Orange (ADR-0013 brand rule)", () => {
    render(<Thermometer raisedCents={5000} goalCents={10000} />);
    const fill = screen.getByTestId("p2p-thermometer-fill");
    // The fill class must reference the brand's Action Orange progress token.
    expect(fill.className).toMatch(/bg-action-500/);
    expect(fill).toHaveStyle({ width: "50%" });
  });

  it("clamps to 100% when raised exceeds goal", () => {
    render(<Thermometer raisedCents={15000} goalCents={10000} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    const fill = screen.getByTestId("p2p-thermometer-fill");
    expect(fill).toHaveStyle({ width: "100%" });
  });

  it("handles a missing or zero goal gracefully (renders empty fill)", () => {
    render(<Thermometer raisedCents={1000} goalCents={0} />);
    const fill = screen.getByTestId("p2p-thermometer-fill");
    expect(fill).toHaveStyle({ width: "0%" });
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuetext", "$10.00 raised");
  });

  it("shows the raised and goal summary by default", () => {
    render(<Thermometer raisedCents={1234} goalCents={10000} />);
    expect(screen.getByTestId("p2p-thermometer-raised")).toHaveTextContent(
      "$12.34",
    );
    expect(screen.getByTestId("p2p-thermometer-goal")).toHaveTextContent(
      "$100.00",
    );
  });

  it("hides the summary when showSummary is false", () => {
    render(
      <Thermometer raisedCents={500} goalCents={1000} showSummary={false} />,
    );
    expect(screen.queryByTestId("p2p-thermometer-raised")).toBeNull();
  });

  it("uses a custom ariaLabel when provided", () => {
    render(
      <Thermometer
        raisedCents={500}
        goalCents={1000}
        ariaLabel="Custom label"
      />,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-label", "Custom label");
  });

  it("treats negative or non-finite inputs as zero", () => {
    render(
      <Thermometer
        raisedCents={Number.NaN as unknown as number}
        goalCents={-5}
      />,
    );
    const wrapper = screen.getByTestId("p2p-thermometer");
    const bar = within(wrapper).getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });
});
