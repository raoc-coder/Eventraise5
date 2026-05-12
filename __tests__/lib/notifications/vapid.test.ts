import {
  P256_PRIVATE_KEY_BYTES,
  P256_PUBLIC_KEY_BYTES,
  generateVapidKeypair,
  normalizePrivateKey,
  toBase64Url,
} from "@/lib/notifications/vapid";

describe("lib/notifications/vapid", () => {
  describe("toBase64Url", () => {
    it("encodes bytes without `=` padding", () => {
      expect(toBase64Url(Buffer.from([0xff]))).toBe("_w");
      expect(toBase64Url(Buffer.from([0xff, 0xff]))).toBe("__8");
    });

    it("substitutes URL-unsafe characters", () => {
      // 0xfb 0xff -> base64 "+/8=" -> base64url "-_8"
      expect(toBase64Url(Buffer.from([0xfb, 0xff]))).toBe("-_8");
    });

    it("never contains `+`, `/`, or `=`", () => {
      // Cover the whole byte space so substitution is exercised broadly.
      const buf = Buffer.alloc(256);
      for (let i = 0; i < 256; i += 1) buf[i] = i;
      const out = toBase64Url(buf);
      expect(out).not.toMatch(/[+/=]/);
    });

    it("round-trips through Buffer.from(_, 'base64url') on Node", () => {
      const buf = Buffer.from([1, 2, 3, 4, 0xff, 0xab]);
      const enc = toBase64Url(buf);
      // Node 16+ accepts 'base64url'.
      expect(Buffer.from(enc, "base64url").equals(buf)).toBe(true);
    });
  });

  describe("normalizePrivateKey", () => {
    it("returns a 32-byte buffer unchanged", () => {
      const buf = Buffer.alloc(P256_PRIVATE_KEY_BYTES, 0xab);
      expect(normalizePrivateKey(buf).length).toBe(P256_PRIVATE_KEY_BYTES);
      expect(normalizePrivateKey(buf).equals(buf)).toBe(true);
    });

    it("strips a leading-zero pad when the buffer is too long", () => {
      const padded = Buffer.concat([
        Buffer.from([0x00]),
        Buffer.alloc(P256_PRIVATE_KEY_BYTES, 0xcd),
      ]);
      const out = normalizePrivateKey(padded);
      expect(out.length).toBe(P256_PRIVATE_KEY_BYTES);
      expect(out[0]).toBe(0xcd);
    });

    it("left-pads when the buffer is too short", () => {
      const short = Buffer.alloc(P256_PRIVATE_KEY_BYTES - 3, 0xef);
      const out = normalizePrivateKey(short);
      expect(out.length).toBe(P256_PRIVATE_KEY_BYTES);
      expect(out[0]).toBe(0x00);
      expect(out[1]).toBe(0x00);
      expect(out[2]).toBe(0x00);
      expect(out[3]).toBe(0xef);
    });
  });

  describe("generateVapidKeypair", () => {
    it("returns base64url-encoded strings of the expected length", () => {
      const { publicKey, privateKey } = generateVapidKeypair();
      // 65 raw bytes → 87 base64url chars (no padding).
      expect(publicKey.length).toBe(87);
      // 32 raw bytes → 43 base64url chars (no padding).
      expect(privateKey.length).toBe(43);
      expect(publicKey).not.toMatch(/[+/=]/);
      expect(privateKey).not.toMatch(/[+/=]/);
    });

    it("public key decodes to the canonical 65-byte uncompressed point (0x04 prefix)", () => {
      const { publicKey } = generateVapidKeypair();
      const raw = Buffer.from(publicKey, "base64url");
      expect(raw.length).toBe(P256_PUBLIC_KEY_BYTES);
      expect(raw[0]).toBe(0x04);
    });

    it("private key decodes to 32 bytes", () => {
      const { privateKey } = generateVapidKeypair();
      const raw = Buffer.from(privateKey, "base64url");
      expect(raw.length).toBe(P256_PRIVATE_KEY_BYTES);
    });

    it("produces a different keypair on each call", () => {
      const a = generateVapidKeypair();
      const b = generateVapidKeypair();
      expect(a.publicKey).not.toBe(b.publicKey);
      expect(a.privateKey).not.toBe(b.privateKey);
    });
  });
});
