/**
 * VAPID keypair generation helpers (ADR-0003).
 *
 * VAPID (Voluntary Application Server Identification) is the standard the
 * Web Push protocol uses to identify the application server pushing to a
 * browser. The keypair is a P-256 ECDSA keypair, encoded as base64url
 * strings:
 *   - public key: 65-byte uncompressed EC point (0x04 || X(32) || Y(32))
 *   - private key: 32-byte big-endian scalar `d`
 *
 * Zero dependencies — uses only Node's built-in `node:crypto`. This module
 * is the single source of truth for VAPID byte handling so the CLI script
 * (`scripts/generate-vapid.ts`) and any future runtime usage (rotation,
 * Edge Function signing) agree on the format.
 *
 * Pure functions so the helpers can be unit-tested without spinning up
 * cryptography under Jest.
 */

import { createECDH } from "node:crypto";

/** Length of a P-256 public key (uncompressed) in bytes. */
export const P256_PUBLIC_KEY_BYTES = 65;
/** Length of a P-256 private key in bytes. */
export const P256_PRIVATE_KEY_BYTES = 32;

/** A VAPID keypair as the strings you paste into env / Vercel secrets. */
export interface VapidKeypair {
  publicKey: string;
  privateKey: string;
}

/**
 * Encode a Buffer to base64url (RFC 4648 §5) — the encoding required by the
 * Web Push protocol's VAPID and `aes128gcm` schemes.
 *
 *   - `+` becomes `-`
 *   - `/` becomes `_`
 *   - trailing `=` padding is stripped
 */
export function toBase64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Normalize a private-key Buffer to exactly 32 bytes. Some Node versions
 * emit a leading-zero-padded big-endian scalar (33 bytes) or strip leading
 * zeros (< 32 bytes). VAPID requires exactly 32.
 */
export function normalizePrivateKey(buf: Buffer): Buffer {
  if (buf.length === P256_PRIVATE_KEY_BYTES) return buf;
  if (buf.length > P256_PRIVATE_KEY_BYTES) {
    return buf.subarray(buf.length - P256_PRIVATE_KEY_BYTES);
  }
  const padded = Buffer.alloc(P256_PRIVATE_KEY_BYTES);
  buf.copy(padded, P256_PRIVATE_KEY_BYTES - buf.length);
  return padded;
}

/**
 * Generate a fresh VAPID keypair.
 *
 * The returned strings are ready to paste into `.env` / Vercel secrets.
 * Never persist the private key in source control (ADR-0003 §Security).
 */
export function generateVapidKeypair(): VapidKeypair {
  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();

  const publicBuf = ecdh.getPublicKey();
  if (publicBuf.length !== P256_PUBLIC_KEY_BYTES) {
    throw new Error(
      `Unexpected public key length: ${publicBuf.length} (expected ${P256_PUBLIC_KEY_BYTES})`,
    );
  }
  const privateBuf = normalizePrivateKey(ecdh.getPrivateKey());

  return {
    publicKey: toBase64Url(publicBuf),
    privateKey: toBase64Url(privateBuf),
  };
}
