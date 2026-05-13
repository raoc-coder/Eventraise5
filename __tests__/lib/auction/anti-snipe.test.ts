import { isInsideAntiSnipeWindow } from "@/lib/auction/anti-snipe";

describe("isInsideAntiSnipeWindow", () => {
  it("is false when now is past close", () => {
    const close = Date.now() + 30_000;
    expect(isInsideAntiSnipeWindow(close, close + 1)).toBe(false);
  });

  it("is false when more than 60s remain", () => {
    const close = Date.now() + 120_000;
    expect(isInsideAntiSnipeWindow(close, Date.now())).toBe(false);
  });

  it("is true in the final 60 seconds", () => {
    const now = Date.now();
    const close = now + 30_000;
    expect(isInsideAntiSnipeWindow(close, now)).toBe(true);
  });
});
