# Admin QA Runbook (while Twilio A2P 10DLC is pending)

**Purpose:** Validate the **Platform Admin Console** and related ops surfaces without relying on organizer phone OTP (`/auth/login`), which may be unreliable until 10DLC is verified.

**Primary URL:** `https://www.eventraisehub.com` (always use **www** — apex redirects and can drop auth headers on API calls).

**Admin entry:** `/admin/login` — email + phone (roster) + `PLATFORM_ADMIN_PASSWORD` — **not** Twilio, **not** organizer sign-in.

**Related:** [`docs/phase-ga-go-live.md`](../phase-ga-go-live.md), [`phase-ga-engineering-sprint-2026-05-21.md`](./phase-ga-engineering-sprint-2026-05-21.md), [`../adrs/operational-readiness.md`](../adrs/operational-readiness.md) §5–§6

---

## 1. Scope

| In scope | Out of scope (defer until 10DLC / separate run) |
|----------|--------------------------------------------------|
| Admin login, session, nav, RBAC | Organizer register/login via SMS (`/auth/register`, `/auth/login`) |
| Overview, Reports, Event Payouts, Donation Payouts | Outbid **SMS** delivery to US numbers at scale |
| Platform Admins (super admin only) | Full auction bid E2E as a bidder (unless you have a non-SMS test account) |
| Preflight / env sanity | PayPal live money movement (use sandbox judgment) |
| Public read-only pages (pSEO, sitemap) | k6 load tests |

---

## 2. Prerequisites

### 2.1 Access you need

- [ ] Roster row in `platform_admins` (migration `032` bootstrap: email `raoc@onthemarc.net`, phone `+15079931292`, role `super_admin`) **or** your own invited admin row.
- [ ] `PLATFORM_ADMIN_PASSWORD` — same value in `.env.local` and **Vercel Production** (per `docs/phase-ga-go-live.md`).
- [ ] Browser: Chrome or Safari, one normal window (avoid mixing organizer + admin sessions in the same profile without signing out).

### 2.2 Optional (recommended before UI testing)

From repo root:

```bash
npm run ga:status
```

**Pass when:** Supabase keys set, `active platform_admins` ≥ 1, prod cron shows **OK** (if you have `CRON_SECRET` locally).

**Browser preflight** (no secrets returned):

Open: `https://www.eventraisehub.com/api/admin/auth/preflight`

Expect JSON like `{ "ok": true, "ready": true }` when service role, admin password, Supabase URL, and an active platform admin roster row are configured. `ready: false` means ops config is incomplete (details are intentionally not exposed publicly).

**Pass when JSON shows:**

- `ok`: true
- `ready`: true

### 2.3 Test log template

Copy this table and fill as you go:

| ID | Area | Steps | Expected | Result (P/F/N/A) | Notes / ticket |
|----|------|-------|----------|------------------|----------------|
| ADM-001 | … | … | … | | |

---

## 3. Authentication & session

### ADM-001 — Admin login (happy path)

1. Open `https://www.eventraisehub.com/admin/login` in a **private/incognito** window.
2. Enter roster **email**, **phone** (10-digit US or E.164), and **admin password**.
3. Submit.

**Expected:**

- Toast: “Signed in to Admin Console”
- Redirect to `/admin`
- Top nav shows **Admin Console** strip with your email on the right

**Fail signals:** “Invalid email, phone, or password”, “misconfigured”, “session setup failed”, or stuck on login with no redirect.

---

### ADM-002 — Wrong credentials

1. Wrong password (correct email/phone).
2. Wrong phone (correct email/password).

**Expected:** Clear error; no access to `/admin`.

---

### ADM-003 — Session persistence

1. After ADM-001, refresh `/admin`.
2. Open `/admin/reports` in a new tab.
3. Close browser, reopen, go to `/admin` (same profile).

**Expected:** Still authenticated until cookie expires or you sign out from main site nav.

---

### ADM-004 — Already logged in shortcut

1. While signed in as admin, visit `/admin/login` again.

**Expected:** Redirect to `/admin` (no duplicate login form).

---

### ADM-005 — Non-admin user blocked (if you can test)

1. Sign in as a normal organizer (only if you have a working non-SMS path or an old session).
2. Manually open `/admin`.

**Expected:** Redirect to `/access-denied?scope=admin` (not console content).

**N/A** if organizer login is blocked by 10DLC — skip.

---

### ADM-006 — Organizer vs admin separation (documentation)

1. On `/admin/login`, confirm footer link **“User sign-in”** → `/auth/login`.
2. Read `/faqs` for admin vs organizer wording.

**Expected:** Copy states admin uses `/admin/login`; organizers use phone OTP at `/auth/login`.

---

## 4. Admin Console — Overview (`/admin`)

### ADM-010 — Overview cards

1. From `/admin`, confirm four areas (super admin sees **Platform Admins**).
2. Click each CTA.

**Expected:**

| Card | Route | Loads |
|------|-------|-------|
| Reports | `/admin/reports` | Yes |
| Event Payouts | `/admin/payouts/events` | Yes |
| Donation Payouts | `/admin/payouts` | Yes |
| Platform Admins | `/admin/admins` | Super admin only |

---

### ADM-011 — Console nav

1. Use nav: Overview → Reports → Event Payouts → Donation Payouts → Admins (if visible).
2. Confirm active page title matches nav label.

**Expected:** No 404s; nav persists on all console pages; site header (`Navigation`) still visible above admin strip.

---

## 5. Reports (`/admin/reports`)

Static **pSEO ops** page (no live Search Console API).

### ADM-020 — pSEO snapshot

**Expected:**

- Total pSEO pages count displays (thousands).
- Links work: `/sitemap.xml`, `/fundraising`.

### ADM-021 — Cohort tables

**Expected:** Tables for organization type, top topics, sample states; URL patterns shown; page scrolls on mobile width.

### ADM-022 — External validation (manual, 5 min)

1. Google Search Console → Pages → filter URL contains `/fundraising/`.
2. Compare rough indexed count vs on-page “total pages” (order-of-magnitude sanity, not exact).

**Record:** Indexed / crawled-not-indexed / discovered counts in notes.

---

## 6. Donation Payouts (`/admin/payouts`)

Uses APIs `/api/payouts/donations` and `/api/payouts/summary` with your admin Bearer session.

### ADM-030 — Initial load

1. Open `/admin/payouts` after admin login.
2. Wait for data (no alert).

**Expected:**

- Summary cards: Gross, Fees (8.99%), Net (+ Settled line).
- Donations table populated **or** empty state “No donations found…” (not an error alert).

**Fail:** Alert “No active session”, “Failed to load donations”, infinite “Loading…”.

---

### ADM-031 — Filters

1. If you know a real **event UUID** from Supabase or a prior event, paste into first “Event ID” field → Apply Filters.
2. Set Settlement = `pending`, then `settled`.
3. Set a date range covering a known donation week.

**Expected:** Table and totals change consistently; no 500 errors in Network tab.

**N/A** if no donation data in prod — note “empty DB” and skip filter assertions.

---

### ADM-032 — Export CSV

1. With any rows visible, click **Export CSV**.

**Expected:** File `payouts.csv` downloads; opens in Excel/Numbers; columns: Date, Donor, Email, Gross, Fee, Net, Status, Settlement, TxnId, EventId, CampaignId.

---

### ADM-033 — Copy totals

1. Click **Copy Totals** → paste into Notes.

**Expected:** Four lines: Gross, Fees, Net, Settled with dollar amounts matching on-screen cards.

---

### ADM-034 — UI note (non-blocking)

Second filter field is labeled “Event ID” but binds **campaign** ID — log as **cosmetic** if confusing; do not fail GA on this alone.

---

## 7. Event Payouts (`/admin/payouts/events`)

Uses `/api/admin/payouts/events` and status updates via `POST /api/admin/payouts/events/[id]`.

### ADM-040 — List and summary

**Expected:**

- Four summary tiles: Total Gross, Total Fees, Net to Organizers, Pending Payouts.
- Table columns: Event, Organizer, Gross, Fees, Net, Status, Method, Date, Actions.
- Empty state: “No payouts found” if none.

---

### ADM-041 — Status workflow (sandbox / test row only)

**Only on a non-production-critical payout** (or staging). Do **not** mark a real gala completed without finance approval.

1. Find row with status `pending` → click **Process**.
2. On `processing` → click **Complete**.

**Expected:**

- Status badge updates after each click without full page reload failure.
- Completed row shows method/reference (PayPal-style ref generated).

**Refresh page:** Status persists.

---

### ADM-042 — External link button

Click **ExternalLink** on a row.

**Expected:** Button is focusable/clickable (may be placeholder — note behavior if nothing happens).

---

## 8. Platform Admins (`/admin/admins`) — super admin only

### ADM-050 — Roster load

**Expected:** “Active roster” lists bootstrap super admin (+ any others); phones masked (e.g. `+1••••••••••92`).

---

### ADM-051 — Invite test admin (optional)

Create a **dedicated QA admin** (your secondary email + phone you control):

1. Fill email, US phone, display name → **Create admin**.
2. Confirm toast: invited to sign in at `/admin/login`.
3. Sign out / incognito → log in as new admin.

**Expected:** New admin reaches `/admin` but **does not** see **Admins** nav item (role `admin`, not `super_admin`).

---

### ADM-052 — Deactivate / reactivate

1. Deactivate the QA admin.
2. Try login as that admin.

**Expected:** Login fails or access denied after login.

3. Reactivate → login works again.

---

### ADM-053 — Non–super-admin blocked from API

As **non–super** admin, open DevTools → Console:

```javascript
fetch("/api/admin/platform-admins").then(r => r.json()).then(console.log)
```

**Expected:** HTTP 403, error like “Super admin required”.

---

## 9. Security & regression checks

### ADM-060 — Direct URL without auth

Incognito, no login:

- `/admin`
- `/admin/payouts`
- `/admin/admins`

**Expected:** Redirect to `/admin/login` (console layout gate).

---

### ADM-061 — API without token

Incognito:

```javascript
fetch("/api/payouts/donations").then(r => console.log(r.status))
```

**Expected:** 401 (or auth error), not donation JSON.

---

### ADM-062 — Cron endpoint (ops)

With `CRON_SECRET` from secure store (not in screenshots):

```bash
curl -sS -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://www.eventraisehub.com/api/cron/process-notification-deliveries"
```

**Expected:** `200` (confirms notification drain path; does **not** prove SMS delivery).

---

## 10. Public site spot checks (no login)

Admin QA should confirm the **marketing/SEO shell** still works while you cannot test organizer flows.

| ID | URL | Expected |
|----|-----|----------|
| ADM-070 | `/` | Home loads; no console errors |
| ADM-071 | `/fundraising` | Hub loads |
| ADM-072 | One deep pSEO URL from Reports table | 200, readable content |
| ADM-073 | `/sitemap.xml` | Valid XML, fundraising URLs present |
| ADM-074 | `/faqs` | Admin vs organizer login explained correctly |
| ADM-075 | `/donations/new?eventId=…` (real UUID if known) | Donate form loads; PayPal button present (do not complete live charge unless approved) |
| ADM-076 | Public auction lot URL (if you have one) | Lot page loads; bid UI visible (bidding may require organizer/bidder auth) |

---

## 11. What to defer (link to Phase GA backlog)

Track separately; do **not** block this admin run on them:

| Item | Why deferred |
|------|----------------|
| Organizer phone OTP sign-in | A2P 10DLC not verified |
| Outbid SMS to handset | Same |
| `npm run p0:smoke` full path | Needs real bid + deliveries |
| OR §5 Realtime / anti-snipe manual | Needs live auction session |
| PayPal Vault live capture | Finance / sandbox policy |

Reference: `docs/phase-ga-go-live.md`, `docs/internal/phase-ga-engineering-sprint-2026-05-21.md`.

---

## 12. Sign-off criteria

**Admin QA PASS** when:

- [ ] ADM-001 through ADM-004 **Pass**
- [ ] All console routes (ADM-010, ADM-011) **Pass**
- [ ] Donation Payouts load without auth errors (ADM-030; 031–033 Pass or N/A with reason)
- [ ] Event Payouts load (ADM-040; 041 Pass or N/A)
- [ ] Super-admin roster tests Pass or N/A if not super admin
- [ ] ADM-060, ADM-061 **Pass**
- [ ] Preflight JSON green (section 2.2)
- [ ] No **P0** defects open against admin login or payout data access

**Recommended follow-up after 10DLC:** second runbook pass for `/auth/login` organizer journey + outbid SMS + `p0:smoke`.

---

## 13. Defect severity guide

| Severity | Examples |
|----------|----------|
| **P0** | Cannot log in as admin; payout APIs 500; any user can see `/admin` without roster |
| **P1** | Filters wrong data; status update doesn’t persist; CSV export broken |
| **P2** | Mislabeled “Event ID” on campaign field; External link noop |
| **P3** | Copy/spacing on Reports |

---

## Quick reference

| Task | Path / command |
|------|----------------|
| Admin login | `/admin/login` |
| Preflight | `/api/admin/auth/preflight` |
| Readiness script | `npm run ga:status` |
| GA checklist | `docs/phase-ga-go-live.md` |
| OR gates | `docs/adrs/operational-readiness.md` §5–§6 |
