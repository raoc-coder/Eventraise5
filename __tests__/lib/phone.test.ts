import { normalizePhoneE164, phoneToSyntheticEmail } from "@/lib/phone";

describe("normalizePhoneE164", () => {
  it("normalizes 10-digit US numbers", () => {
    expect(normalizePhoneE164("5551234567")).toBe("+15551234567");
    expect(normalizePhoneE164("(555) 123-4567")).toBe("+15551234567");
  });

  it("accepts +1 prefix", () => {
    expect(normalizePhoneE164("+1 555 123 4567")).toBe("+15551234567");
  });

  it("rejects invalid input", () => {
    expect(normalizePhoneE164("123")).toBeNull();
    expect(normalizePhoneE164("")).toBeNull();
  });
});

describe("phoneToSyntheticEmail", () => {
  it("maps E.164 to stable internal email", () => {
    expect(phoneToSyntheticEmail("+15551234567")).toBe(
      "p15551234567@phone.eventraisehub.internal",
    );
  });
});
