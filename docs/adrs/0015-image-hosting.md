# ADR-0015: Supabase Storage for auction lot imagery

- **Status:** Accepted
- **Date:** 2026-05-12
- **Owners:** Engineering
- **Related:** ADR-0001, ADR-0002

## Context

Auction lots typically have one to six images per lot. The current Next.js image domains include `images.unsplash.com`, `via.placeholder.com`, and `www.paypalobjects.com`, plus Supabase storage hostnames already allowed via `remotePatterns`. Adding a separate object store (S3 or R2) would introduce another account, IAM model, and bill.

## Decision

Use **Supabase Storage** for auction lot imagery.

- A `public-lots` bucket with read-only access for published lots and write access scoped to the organizer.
- Signed URLs for any non-public asset.
- `next/image` with `remotePatterns` already allowing `*.supabase.co`; sizes and `blurDataURL` placeholders generated at upload time.

## Alternatives considered

- **AWS S3 or Cloudflare R2.** Rejected. Adds vendor, IAM, and lifecycle management.
- **External image CDN like Cloudinary.** Rejected. Adds vendor cost; we do not need transform-heavy features for lot photography.

## Consequences

- Positive: one fewer external account; uses existing Supabase project; same auth model as other tables.
- Negative: large files count against the Supabase Storage quota — must be monitored.
- Operational: an upload helper enforces a maximum dimension and file size; an admin script can re-encode any historical oversize uploads.

## Compliance / acceptance criteria

- A documented bucket layout exists before Sprint 3 (auctions).
- Uploads enforce a server-side max size and an allowlist of MIME types (`image/jpeg`, `image/png`, `image/webp`).
- All `next/image` usage for lot images includes `sizes` and either `priority` (above-the-fold) or `loading="lazy"`.
