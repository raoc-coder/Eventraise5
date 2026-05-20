/**
 * E.164 phone normalization (US-first; accepts +1 / 10-digit domestic).
 */

const E164_US = /^\+1\d{10}$/;
const E164_GENERIC = /^\+\d{8,15}$/;

/** Synthetic auth email so Supabase can issue sessions for phone-only users. */
export function phoneToSyntheticEmail(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  return `p${digits}@phone.eventraisehub.internal`;
}

/**
 * Normalize user input to E.164. Defaults US (+1) when no country code given.
 * Returns null if the number cannot be represented safely.
 */
export function normalizePhoneE164(raw: string, defaultCountry = "US"): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    digits = "+" + digits.slice(1).replace(/\D/g, "");
  } else {
    const only = trimmed.replace(/\D/g, "");
    if (defaultCountry === "US") {
      if (only.length === 10) digits = `+1${only}`;
      else if (only.length === 11 && only.startsWith("1")) digits = `+${only}`;
      else return null;
    } else {
      return null;
    }
  }

  if (!digits.startsWith("+")) return null;
  if (E164_US.test(digits)) return digits;
  if (E164_GENERIC.test(digits)) return digits;
  return null;
}

export function maskPhone(e164: string): string {
  if (e164.length < 6) return "••••";
  return `${e164.slice(0, 2)}••••${e164.slice(-4)}`;
}
