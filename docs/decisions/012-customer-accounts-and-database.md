# 012 — Customer Accounts & Supplementary Database

**Status:** Active
**Date:** 2026-08-08

## Decision (v1)

Hybrid architecture: Shopify stays the authority for identity, auth, and orders;
a separate database (provider/ORM TBD — Neon or Supabase, Drizzle or Prisma)
holds everything Shopify has no field for.

### Delegated to Shopify

- Login / signup — Shopify's Customer Account API (OAuth 2.0 + PKCE,
  passwordless one-time email code). Shopify deprecated *classic customer
  accounts* as a login feature on 2026-02-19 (final sunset TBA), so the
  Customer Account API is the forward-compatible choice for login.

  **Correction (verified 2026-08-08):** an earlier draft of this record
  claimed the Storefront mutations `customerCreate` /
  `customerAccessTokenCreate` / `customerUpdate` were themselves deprecated.
  They are not. Introspecting the live Storefront schema at API versions
  2024-01, 2025-07, 2026-01 and 2026-07 shows `isDeprecated: false` for all
  three. The deprecation is of the classic-accounts *feature*, not these
  mutations. Practical consequence: the existing `joinNewsletter`
  (`customerCreate`) path is **not** on borrowed time and does not need
  replacing — it only needs the DB upsert described below.
- The core customer identity — email, name.
- Orders, checkout, payment, saved addresses.

The hosted auth screen (email + code entry) cannot be reskinned or embedded —
this is an OAuth/PKCE security property, not a Shopify limitation, and applies
to every OAuth provider (same reason "Sign in with Google" always bounces to
accounts.google.com). Everything before that redirect (the sign-in trigger)
and everything after it (the entire account UI, order history rendering,
custom onboarding) is ours to build.

### Why not classic accounts + a fully custom login form (the pre-2026-02-19 option)

Moot — deprecated. Even if it weren't, a fully separate custom auth system
would leave two disconnected identities (ours vs. Shopify's checkout-time
customer record), reconciled only by matching email addresses — fragile
(guest checkouts, email changes, typos).

### Own database — supplementary customer data

```
customers (
  id                    uuid, primary key
  shopify_customer_id   text, unique, indexed   -- gid://shopify/Customer/...
  email                 text                     -- cached copy, see below
  first_name            text, nullable
  last_name             text, nullable
  gender                text, nullable
  date_of_birth         date, nullable
  created_at            timestamp
  updated_at            timestamp
)
```

Two entry points populate this table, both upserting on `shopify_customer_id`:

1. **Newsletter signup** (`joinNewsletter` in `lib/shopify/customer.ts`) — the
   `customerCreate` mutation response already returns `{ id, email }`; this
   just needs to be upserted instead of discarded. No name/gender/DOB yet.
2. **Full account login** (`/api/auth/callback`, OAuth flow) — query the
   Customer Account API for name, then upsert. First-ever login (no existing
   row with matching `shopify_customer_id`) redirects to a custom
   `/account/complete-profile` onboarding step (forced-vs-skippable: TBD)
   before `/account`, since gender/DOB have no Shopify equivalent and can
   only be collected in our own UI.

**Email/name are a deliberate cache, not the source of truth** — kept in sync
via a `customers/update` webhook (same pattern as the existing
`products/*` cache-revalidation webhook in
`app/api/webhooks/shopify/route.ts`). Accepted trade-off: avoids an extra
Shopify API call on every render that shows a name, at the cost of possible
brief staleness if a webhook delivery is ever missed. Everything else in the
table (gender, DOB, and any future field) has no Shopify equivalent at all,
so is additively new, not redundant.

`customers/delete` (GDPR erasure) handling: not yet decided — needs a
decision before real customer data accumulates.

### Recommendation-system data (separate table, same database)

```
product_events (
  id
  shopify_customer_id     nullable  -- logged-in
  anonymous_session_id    nullable  -- pre-login browsing
  product_id              -- Shopify product/variant GID
  event_type               view | add_to_cart | wishlist | purchase
  created_at
)
```

On login, merge that browser's anonymous session's prior events onto the
now-known `shopify_customer_id`. Start logging `view`/`add_to_cart` now, even
before any recommendation UI exists, so real signal exists by the time it's
needed. No queue/analytics platform (PostHog, Segment) until actual volume
justifies one — direct DB writes are fine at this stage.

Rejected: storing this in Shopify customer metafields. Metafields suit a
handful of static per-product/customer fields (this is exactly what
`custom.fabric`/`custom.origin`/etc. already are, per decision 006) but not a
high-volume, ever-growing event log — no relational querying, and every
read/write counts against Shopify's API rate limits.

### Product cache table — needed, not just "later"

Both the recommendation system and future personalized-marketing/newsletter
segmentation need the same thing: joining customer behavior
(`product_events`) against product attributes (style/category) in a single
query — e.g. "customers who viewed boho-style tops but haven't purchased in
30 days." Shopify's API has no equivalent of an ad-hoc relational/segment
query; a real database does. So this is promoted from the "later version"
maybe below to an actual part of v1:

```
products (
  id             -- Shopify product GID
  title
  product_type
  style          -- or whatever classification fields end up mattering
  price
  updated_at
)
```

Synced via the existing `products/*` webhook in
`app/api/webhooks/shopify/route.ts` (already revalidates on product
changes — extend it to also upsert this row). Source of truth for
style/category itself stays Shopify metafields/tags (extending decision
006's pattern) — this table is a cache for fast local queries, not a second
place to *edit* product data.

Sending an actual personalized campaign is a separate, not-yet-decided piece
from storing the data — either syncing segments back into Shopify Email as
customer tags, or a dedicated ESP (e.g. Klaviyo) reading segments directly
from this database.

## Why (security framing)

Shopify's hosted auth is only modestly more secure than a carefully-built
custom passwordless flow would be — that's not the deciding factor. The
deciding factor is **identity continuity with checkout**: using the same
Customer Account API for login as Shopify uses for checkout means order
history, addresses, etc. are automatically the same person, with no
reconciliation logic to build or maintain.

## Build status

**Phase 1 — auth + account page, no database.** Login, the account page and
order history need no own-database rows at all; the DB is only required for
gender/DOB/wishlist/events. Phase 1 was therefore built first and the DB
provider decision deferred rather than blocking on it.

Built:

- `lib/auth/pkce.ts` — PKCE verifier/challenge, `state`/`nonce`, and
  `safeReturnPath` (open-redirect guard). Web Crypto, not `node:crypto`, so
  it runs in Edge middleware and Node routes alike.
- `lib/auth/session.ts` — HMAC-signed app session cookie, independent of
  Shopify's token lifetime so middleware never needs a Shopify round-trip
  just to answer "logged in?".
- `lib/auth/currentCustomer.ts` — server-side session / access-token readers.
- `lib/shopify/customerAccount.ts` — OAuth endpoints derived from
  `SHOPIFY_SHOP_ID` (verified against the shop's live OpenID discovery
  document), authorization URL builder, token exchange, customer-scoped
  GraphQL client.
- `app/api/auth/{login,callback,logout}/route.ts`
- `app/account/page.tsx` (profile + order history), `app/account/error/page.tsx`
- `tests/auth.test.ts` — 13 tests.

Deviation from the plan above: `/account` is gated by a `redirect()` in the
page rather than in `middleware.ts`. Same effect, verified working, and it
avoids duplicating the check in two places. Revisit if `/account/*` grows
enough routes that a single middleware guard becomes cheaper.

Verified end to end against the running app: logged-out `/account` → 307 to
login; a validly-signed forged session → 200 with the account page; a
one-character-tampered signature → 307 back to login; unknown `?reason=`
values are not echoed into the error page (no reflected XSS); missing client
ID fails loudly instead of building a malformed authorization URL.

**Not verified:** the actual OAuth round trip, which needs the Client ID and
a non-localhost callback host (see blockers below).

### Blockers before this can be tested

1. **Client ID** — Shopify Admin → Headless channel → storefront → Customer
   Account API. Set `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`, and register the
   callback URL `https://<host>/api/auth/callback` there.
2. **No localhost.** Shopify rejects `http://` and `localhost` callback URLs
   outright, so the flow cannot be exercised on `localhost:3000` — it needs a
   tunnel (cloudflared, as already used for webhooks) or a Vercel preview URL.
3. `SESSION_SECRET` and `SHOPIFY_SHOP_ID` are set locally but must also be
   added in Vercel for Production and Preview.

### Deferred to Phase 2 (needs the database)

`/account/complete-profile` onboarding (gender/DOB), wishlist, the
`customers` upsert on first login, `product_events`, and the
anonymous→customer merge.

## Security review (2026-08-08) — requirements, not suggestions

### Already fixed in this pass

1. **Newsletter signup ran client-side.** `lib/shopify/customer.ts` had no
   `'use server'` and was imported by two `'use client'` components, so
   `customerCreate` executed in the browser. Verified by calling the mutation
   with only the browser-exposed `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`: it
   reached field validation (`"Email is invalid"`), proving the public token
   carries `unauthenticated_write_customers`. Anyone could lift it from the
   bundle and mass-create customer records — which under this design would
   flow straight into `customers` and poison every segment and
   recommendation built on it. Fixed by adding `'use server'`; confirmed the
   mutation no longer appears in any client chunk.
2. **The gate would have broken OAuth.** `lib/gate.ts` allowed
   `/api/webhooks` but not `/api/auth`, so with `LAUNCHED=false` Shopify's
   redirect to `/api/auth/callback` would bounce to `/coming-soon` and the
   authorization code would never be exchanged. Added `/api/auth` to
   `ALWAYS_ALLOWED` + regression tests in `tests/gate.test.ts`.

### Still open — must be done before this ships

3. **The write scope is still exposed — and the planned fix does not work.**
   The `'use server'` fix moved *our* call server-side, but the public token
   remains in the browser bundle for cart mutations and still carries
   `unauthenticated_write_customers`.

   The original plan was "put the write scope on a server-only private token,
   remove it from the public one." **Verified 2026-08-08: that is not
   possible in the Headless channel.** Its Storefront API permissions card
   shows a single checkbox list with the banner *"Storefront API permissions
   are shared across all Headless channel storefronts."* There is no
   per-token section — public and private tokens both draw from that one
   list, so the private token cannot hold a scope the public one lacks.
   (`lib/shopify/client.ts`'s `privileged` flag is therefore currently no
   more privileged than the default path; the plumbing is kept because a
   custom-app or Admin-API split would reuse it.)

   **Revised fix — move customer creation to the Admin API.** Creating a
   customer record is an admin action, not a storefront one. An Admin API
   token is server-only by nature and can never appear in a browser bundle,
   so the exposure disappears rather than being mitigated. Requires a custom
   app (Admin → Apps → Develop apps) with the Admin `write_customers` scope,
   and rewriting `joinNewsletter` to call the Admin API's `customerCreate`
   with `emailMarketingConsent` instead of the Storefront mutation.

   **Sequencing matters — do not reorder:** the site is live and both the
   newsletter form and the discount popup depend on this path. Leave
   `unauthenticated_write_customers` **checked** until the Admin API path is
   built and verified, *then* uncheck it. Unchecking first breaks signup
   immediately, with no fallback, because the private token loses the scope
   at the same moment.

   Also: decision 006's documented scope list never included
   `unauthenticated_write_customers` even though it is enabled — docs drift
   worth correcting there.

3b. **`unauthenticated_read_customers` is also enabled.** Lower risk than the
   write scope — it only reads the customer whose access token the caller
   already holds, not the customer list — and it is a classic-accounts scope.
   Once Customer Account API login is live, check whether anything still
   needs it and remove it if not.
4. **Rate limiting + bot protection** on `/api/auth/*` and newsletter
   signup. Nothing exists today. In-memory counters are useless on
   serverless (per-instance) — needs a shared store.
5. **PKCE cookie must be `sameSite: 'lax'`.** With `strict` the browser will
   not send it on the cross-site redirect back from Shopify and *every*
   login fails. Also `httpOnly`, `secure`, ~10 min TTL, deleted after
   exchange. Validate `state` on return.
6. **No open redirect.** If `/api/auth/login` accepts a `returnTo`, allowlist
   it to same-origin paths.
7. **Reconsider storing refresh tokens at all.** Passwordless re-auth is
   low-friction, so the convenience may not justify the blast radius of a
   stored-credential table. If stored: encrypted, key in env (not the DB),
   never sent to the client.
8. **Webhook ordering.** Shopify does not guarantee delivery order, so a
   delayed old `customers/update` can clobber newer data. Compare Shopify's
   `updated_at` before writing. Upserts are naturally idempotent so
   `X-Shopify-Webhook-Id` dedupe is optional, but ordering is not.
9. **Privacy policy is out of date before it ships.** The copy written into
   `config/customerCareSections.tsx` does not mention gender, date of birth,
   or behavioral tracking for recommendations — and it promises a
   "cookie-preference tool" that does not exist. `anonymous_session_id` is a
   tracking cookie (consent territory). DOB collection also interacts with
   the 18+ requirement in the ToS. Update the policy *with* the feature, not
   after.
10. **Erasure must cascade to `product_events`**, not just `customers` — it
    is personal data. And `product_events` needs a retention policy;
    unbounded growth is both a cost and a data-minimization problem.

### Redundancy notes

- `customers.id` UUID is unnecessary — `shopify_customer_id` is already
  unique and stable, use it as the PK.
- The `products` table is a *third* copy of product data (Shopify → Next.js
  fetch cache → this DB). Justified for relational joins, but cache only the
  fields actually filtered/joined on and **never render from it** — always
  render from Shopify, or the PDP and a recommendation card will eventually
  disagree on price.

### Convention to follow

This repo keeps pure logic in `lib/` with unit tests (`gate.ts`,
`cart-helpers.ts`, `pagination.ts` …). PKCE, session encode/decode, and the
anonymous→customer merge should follow that pattern rather than living
inline in route handlers.

### Unrelated but noticed

`lib/shopify/client.ts` is pinned to Storefront API `2024-01`, roughly 2.5
years old. It still returns 200, but plan an upgrade rather than discovering
the cutoff in production.

## Later version

- Decide forced vs. skippable profile-completion onboarding.
- Decide `customers/delete` (GDPR) handling before it's needed for real.
- Decide which product metafields/tags to add for style/category
  classification (extending decision 006), and the exact `products` cache
  table columns beyond the starting set above.
- Actual campaign-sending mechanism (Shopify Email tag-sync vs. a dedicated
  ESP like Klaviyo) — not decided, not needed until segmentation data exists
  to act on.
- DB provider/ORM (Neon vs. Supabase, Drizzle vs. Prisma) still open.
