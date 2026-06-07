import {
  isPayPalSandboxClient,
  isPayPalSandboxServer,
} from "@/lib/paypal-env";

describe("isPayPalSandboxServer", () => {
  const orig = process.env.PAYPAL_ENVIRONMENT;

  afterEach(() => {
    if (orig === undefined) delete process.env.PAYPAL_ENVIRONMENT;
    else process.env.PAYPAL_ENVIRONMENT = orig;
  });

  it("defaults to sandbox when unset", () => {
    delete process.env.PAYPAL_ENVIRONMENT;
    expect(isPayPalSandboxServer()).toBe(true);
  });

  it("is false only for production", () => {
    process.env.PAYPAL_ENVIRONMENT = "production";
    expect(isPayPalSandboxServer()).toBe(false);
  });
});

describe("isPayPalSandboxClient", () => {
  const orig = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT;

  afterEach(() => {
    if (orig === undefined) delete process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT;
    else process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT = orig;
  });

  it("defaults to sandbox when unset", () => {
    delete process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT;
    expect(isPayPalSandboxClient()).toBe(true);
  });

  it("is false only for production", () => {
    process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT = "production";
    expect(isPayPalSandboxClient()).toBe(false);
  });
});
