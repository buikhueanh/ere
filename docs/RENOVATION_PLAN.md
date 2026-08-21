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
- ~~Nav dropdown — data model TBD~~ → resolved by decision 011 (collections); build tracked in Phase 5

## Phase 3 — Homepage

- ✅ Homepage layout rebuilt: centered hero (portrait or landscape via `object-contain`), click → New In, optional season label below. Falls back to the bundled image until the metaobject is configured.
- ✅ `getHomepageSettings()` + normalizer (`lib/shopify/homepage.ts`), 60s revalidate under a `homepage` cache tag, unit-tested
- 🟨 `homepage_settings` metaobject — **needs one-time setup in Shopify Admin** (definition + entry + Storefront access), steps given in session 2026-07-09

## Phase 4 — New In page ✅

- ✅ Plain grid, 4-up desktop / 2-up mobile (reused existing `ProductGrid`/`ProductCard`)
- ✅ Sort newest-first (`CREATED_AT` reverse) — already built into `getProducts()`, confirmed wired
- ✅ Pagination: `lib/pagination.ts` (generic, reusable — 8 unit tests) + `components/ui/PageSelector.tsx`, 4 rows/page, numbered, bookmarkable `?page=N`
- ✅ Newsletter signup module (after pagination, before footer)
- Verified live: real products rendering, `200` on `/new-in` and `/new-in?page=2` (clamps gracefully rather than erroring)

## Phase 5 — Shop page (categories + placeholders, decision 011)

*(Old `shop_look` items removed — superseded by 011's product-free placeholders.)*

- ✅ Shopify Admin: 5 collections created (tops/bottoms/accessories/homeware/self-care) — empty, user assigns products at their own pace
- ✅ Shopify Admin: `shop_placeholder` metaobject definition created (image, position, page with a `choices` validation) + Storefront access enabled
- ✅ **Publishing gotcha caught:** all 5 collections were published only to "Online Store," not the "Eré Headless" channel the Storefront token actually reads from — same class of issue as earlier webhook/metaobject setup. Published all 5 via Admin API mutation; verified live via Storefront API.
- ✅ Interleave builder (`lib/shop-interleave.ts`): 3 products → next placeholder, plain-4 when exhausted — 8 unit tests
- ✅ Pagination reuses `lib/pagination.ts` from Phase 4 (generic, works on any array — no shop-specific pagination code needed)
- ✅ `getShopPageCards()` (`lib/shopify/shop.ts`): fetches products (all or by collection) + scoped placeholders in parallel, normalizes, interleaves — 6 unit tests on the normalizer
- ✅ `/shop` and `/shop/[collection]` routes, sharing one `ShopPageContent` component; invalid collection segments 404 (not a silent fallback)
- ✅ `ShopGrid` / `ShopPlaceholderCard` components — placeholders render as plain decorative image cards, no special full-width treatment (011 simplified this away from the old `shop_look` design)
- ✅ Verified live: `/shop` (all products), `/shop/tops` (filtered correctly), `/shop/homeware` (empty collection → "No products found", not an error), `/shop/not-a-real-category` (404), pagination clamps gracefully
- ✅ Nav hover-dropdowns: `NavDropdown` component, shown via CSS `group-hover`, dot indicator marks the hovered sub-item (or falls back to whichever matches the current page). Shop → all items + 5 categories. Brands → alphabetized vendors, fetched server-side in `layout.tsx` and passed into the client `Navbar`.
- Mobile hamburger menu does **not** get expandable category/brand submenus in this pass — mobile "shop"/"brands" links just navigate directly, same as before. Scoped down deliberately to avoid a second interaction pattern; revisit if mobile category browsing turns out to matter.
- 🟨 Placeholder cache staleness: no webhook wired for `shop_placeholder` metaobject changes yet — relies on the 60s revalidate fallback only

## Phase 6 — Brands page ✅

- ✅ Pulled forward while building the nav dropdown, since a working destination was needed anyway
- ✅ `lib/shopify/vendors.ts`: `getVendors()` (alphabetized, dedupe'd) + `getProductsByVendor()` (reuses existing `SEARCH_PRODUCTS_QUERY`'s vendor search syntax, with cached revalidation instead of search's no-store)
- ✅ `/brands` — real index, alphabetized vendor list
- ✅ `/brands/[vendor]` — filtered product grid; zero products = not found (no fixed vendor list to validate against, unlike collections)
- ✅ Verified live, including a real bug caught and fixed: `/brands/ère` 404'd because Next.js doesn't auto-decode percent-encoded route segments — see changelog

## Phase 7 — Journal page

- ⬜ Storefront API blog/article queries
- ⬜ Journal list + article detail page templates

## Phase 8 — PDP changes

- ⬜ Remove thumbnail column
- ⬜ Left half: scrollable full-image stack
- ⬜ Right half: info panel (carry over unchanged)
- ⬜ "Similar products" section (same-collection query)

## Discount popup (`components/ui/DiscountPopup.tsx`, `customer-care` branch)

- ✅ Modal built: fixed 600×400 box on desktop (image half + copy half), collapsible side tab, per-page one-time auto-open (`/shop` + `/new-in`), "already subscribed" state persisted across page nav via sessionStorage
- ✅ Submits to real Shopify Storefront API `customerCreate` (`acceptsMarketing: true`) — verified customers land in Shopify Admin
- ⬜ **Discount code is never actually sent.** The modal says "check your inbox for your code" but nothing emails one — needs a Shopify Flow / Shopify Email automation (or Klaviyo, if that's in use) triggered on customer creation to send an actual code
- ⬜ A real discount code/rule needs to exist in Shopify Admin → Discounts for that automation to send
- ⬜ Swap `/images/discount/discount-placeholder.png` for the real campaign image (box is fixed-size, drop-in replace)
- Note: Storefront API can't set customer tags, so there's no way to segment "signed up via this popup" vs. other signup sources (footer, `/newsletter` page, teaser) — same limitation as the Phase 1 waitlist signup

## Carried over unchanged — no action needed

- ✅ Shopify data layer (products, cart, checkout, webhook revalidation)
- ✅ CartDrawer
- ✅ No-scarcity/no-sale-price philosophy
- ✅ Shopify-hosted checkout

## Search ✅

- ✅ Built as an inline navbar takeover instead of a separate `/search` page (the old stub route is deleted) — clicking the search icon expands the nav row into a search input in place, no navigation/page load
- ✅ Results render directly below the nav as a `ProductGrid`, no dedicated results page
- ✅ Fuzzy, typo-tolerant matching via Fuse.js (`lib/search.ts`) over title/vendor/productType/tags — plain Shopify `products(query:)` search only does near-exact keyword matching, which was too strict for a search-as-you-go box
- ✅ `GET /api/search?q=` (`app/api/search/route.ts`) fetches the full catalog (up to 250, the Storefront API's max page size) and fuzzy-filters server-side
- Closes on Escape, on navigating to a result, or via the X — no autocomplete/suggestions yet (submit-to-search only)

## Explicitly deferred

*(nothing currently deferred)*
