# PayPal Vault rehearsal runbook

**Platform:** Vercel production (`https://www.eventraisehub.com`) — Twilio Verify and **live PayPal** on Vercel. **Local `.env.local` stays sandbox** for CLI rehearsal; browser traffic on www uses Vercel live env.  
**ADR:** [0006 — vault + capture-on-win](../adrs/0006-auction-vault-capture.md)  
**Living log:** [LEDGER.md](../../LEDGER.md)

## Required Vercel env (Production)

| Variable | Sandbox rehearsal | Live go-live |
|----------|-------------------|--------------|
| `PAYPAL_CLIENT_ID` | Sandbox REST client ID | Live client ID |
| `PAYPAL_CLIENT_SECRET` | Sandbox secret | Live secret |
| `PAYPAL_ENVIRONMENT` | `sandbox` | `production` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Same as client ID | Live client ID |
| `NEXT_PUBLIC_PAYPAL_ENVIRONMENT` | `sandbox` | `production` |
| `CRON_SECRET` | Set (matches local for CLI sweep) | Set |
| `NEXT_PUBLIC_APP_URL` | `https://www.eventraisehub.com` | Same |

Enable **Vault** on the PayPal app (sandbox or live) in the Developer Dashboard.

## CLI commands

```bash
npm run paypal:rehearsal -- --check    # OAuth + vault setup-token
npm run paypal:seed                      # seed open rehearsal lot on linked Supabase
npm run paypal:rehearsal -- --close-lot <lot-uuid>
npm run paypal:rehearsal -- --cleanup    # remove ga-vault-rehearsal rows
npm run ga:status
```

## Option A — Real PayPal vault (sandbox buyer)

1. `npm run paypal:seed` — note `auction_id` and `lot_id`.
2. Sign in: `https://www.eventraisehub.com/auth/login` (Twilio OTP).
3. Register: `/auctions/{auction_id}/register` → **Link PayPal payment method**.
4. Log in with a **Sandbox Personal (buyer)** account from PayPal Developer → Testing Tools → Sandbox accounts — **not** the Business/admin REST app account.
5. Bid on `/auctions/{auction_id}/lots/{lot_id}`.
6. `npm run paypal:rehearsal -- --close-lot {lot_id}`.
7. Confirm `paypal_capture_id` is set (real ID, not `practice_capture`).
8. `npm run paypal:rehearsal -- --cleanup`.

## Option B — Practice vault (no PayPal login) — **verified 2026-06-07**

Use when sandbox buyer login is blocked; exercises register → bid → cron sweep → capture with `practice_vault` token.

1. `npm run paypal:seed`
2. Sign in on Vercel.
3. Open `/auctions/{auction_id}/register`.
4. Click **Practice register (no PayPal vault)** — requires `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox` on Vercel and redeploy.

   **Or** DevTools console while signed in on that page:

   ```javascript
   fetch('/api/auctions/{auction_id}/register', {
     method: 'POST',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json',
       'Idempotency-Key': crypto.randomUUID()
     },
     body: JSON.stringify({ practiceVault: true })
   }).then(r => r.json()).then(console.log)
   ```

5. Place bid on the lot page.
6. `npm run paypal:rehearsal -- --close-lot {lot_id}` — expect `outcome: settled`, `paypal_capture_id: practice_capture`.
7. `npm run paypal:rehearsal -- --cleanup`.

## Done when

- [x] Practice path on Vercel (Option B) — 2026-06-07
- [ ] Real sandbox vault capture (Option A) — `paypal_capture_id` from PayPal API
- [ ] Live credentials + `PAYPAL_ENVIRONMENT=production` before first paid gala

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| PayPal login fails on vault popup | Use Sandbox **Personal** buyer credentials, not Business/admin |
| No practice button on register page | Set `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox` on Vercel; redeploy |
| `practice_not_allowed` | `PAYPAL_ENVIRONMENT=production` on server — practice disabled by design |
| `--close-lot` says no bids | Complete bid step on Vercel first |
| Cron 401 | Use `www` host; `CRON_SECRET` must match Vercel |
