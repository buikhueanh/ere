# Renovation Plan — Build Status

Tracks progress on the rebrand renovation. Full spec/rationale lives in
[decisions/010-rebrand-renovation.md](decisions/010-rebrand-renovation.md) —
read that first if anything here is unclear. This file is just the checklist:
what's done, what's next. Update status as work lands; don't duplicate the
reasoning that belongs in the decision record.

Status legend: ⬜ not started · 🟨 in progress · ✅ done

---

## Phase 0 — Gating infrastructure ✅

- ✅ Env flag (`LAUNCHED`) that redirects all routes to `/coming-soon` when "not launched" — `middleware.ts` + `lib/gate.ts`
- ✅ Preview bypass via secret URL query param (`?preview=<token>`), persisted via cookie
- ✅ `noindex` header on gated redirects + dynamic `robots.txt` (`Disallow: /` while gated)
- ✅ Verified live: gate redirect, bypass, webhook always-reachable, robots.txt always-reachable — 25/25 unit tests passing

## Phase 1 — Teaser / waitlist page

- ✅ Shared signup module component (`components/ui/NewsletterSignup.tsx`) — built once, reused on teaser + Shop + New In (wired into those pages in their own phases)
- ✅ "Coming soon" gate page: signup module (teaser copy) + footer, no navbar
- ✅ Signup form → `customerCreate` with `acceptsMarketing: true` — verified end-to-end (customer created, `marketingState: SUBSCRIBED`). Note: Storefront API can't set tags; segment in Shopify Email by email-subscribed state + created date instead of a `waitlist-2026` tag.
- ⬜ Confirm Shopify Email is set up to target the subscribed segment (user, in Admin)
- ⬜ Teaser hero image is currently the placeholder `/images/hero/homepage.png` — swap for the real pinned-ribbon teaser image when ready

## Phase 2 — Shared layout pieces

- ✅ Font system swap: Libre Baskerville (all text, replaces Inter + Cormorant) + Monsieur La Doulaise as `font-script` (wordmark/nav, applied when those components are rebuilt)
- ✅ New site-wide footer: about us / customer care left, © 2026 ere center, script `ère` bottom-right (links home). "customer care" lands on a new `/customer-care` hub page listing the support links.
- ✅ Homepage navbar variant: script "newsletter" link (→ new `/newsletter` page reusing the signup module) + search/cart icons
- ✅ In-site navbar variant: script shop / new in / designer / journal + search/cart icons. PNG logo removed from navbar — the script `ère` in the footer is the home link now.
- ✅ Mobile hamburger updated: script-font main links + support links, both variants verified in browser
- ✅ Stub pages created so the new nav doesn't 404: `/new-in` (Phase 4 builds it), `/journal` (Phase 7), `/customer-care`, `/newsletter`
- ⬜ Nav dropdown (Shop → category sub-menu with active-dot indicator) — **data model TBD, see decision 010 deferred section**

## Phase 3 — Homepage

- ✅ Homepage layout rebuilt: centered hero (portrait or landscape via `object-contain`), click → New In, optional season label below. Falls back to the bundled image until the metaobject is configured.
- ✅ `getHomepageSettings()` + normalizer (`lib/shopify/homepage.ts`), 60s revalidate under a `homepage` cache tag, unit-tested
- 🟨 `homepage_settings` metaobject — **needs one-time setup in Shopify Admin** (definition + entry + Storefront access), steps given in session 2026-07-09

## Phase 4 — New In page

- ⬜ Plain grid, 4-up desktop / 2-up mobile
- ⬜ Pagination: 4 rows/page, numbered page selector
- ⬜ Newsletter signup module (after pagination, before footer)

## Phase 5 — Shop page (hybrid curated layout)

- ⬜ `shop_look` metaobject schema (styling_image, product_1/2/3, row_position)
- ⬜ Row-rendering logic (claimed rows vs. plain catalog fill-in)
- ⬜ Sold-out-in-look handling (keep + tag)
- ⬜ Deleted-in-look handling (drop card silently)
- ⬜ Row-position collision handling (first wins, second bumps)
- ⬜ Mobile reflow: styling image full-width, 3 products in 2-up grid below
- ⬜ Pagination: 4 content-blocks/page (look-group or 3-product batch), numbered page selector
- ⬜ Newsletter signup module (after pagination, before footer) — shared component with New In's

## Phase 6 — Designer page

- ⬜ Vendor list view (distinct `vendor` values)
- ⬜ Filtered product grid by vendor

## Phase 7 — Journal page

- ⬜ Storefront API blog/article queries
- ⬜ Journal list + article detail page templates

## Phase 8 — PDP changes

- ⬜ Remove thumbnail column
- ⬜ Left half: scrollable full-image stack
- ⬜ Right half: info panel (carry over unchanged)
- ⬜ "Similar products" section (same-collection query)

## Carried over unchanged — no action needed

- ✅ Shopify data layer (products, cart, checkout, webhook revalidation)
- ✅ CartDrawer
- ✅ No-scarcity/no-sale-price philosophy
- ✅ Shopify-hosted checkout

## Explicitly deferred

- Search page (`/search`) — stays a stub; real build (with autocomplete/suggestions) comes later, not part of this renovation pass
