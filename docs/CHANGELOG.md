# Changelog

A running, append-only log of bugs encountered and how they were fixed — for
tracing back later when something looks broken again. This is *not* a record
of design decisions (see `docs/decisions/` for those) and not a record of
planning discussions — only things that were broken, why, and the fix/status.

Format per entry: **what broke** → **root cause** → **fix**.

---

## 2026-06-12

- **Size selector didn't match the reference design.** Built initially as
  inline buttons. → Visual review against the reference screenshot showed it
  should be a dropdown. → Rebuilt as a custom dropdown component (not a native
  `<select>`, so sold-out sizes can render greyed + strikethrough). See
  [decision 007](decisions/007-shop-and-pdp-layout.md).

- **PDP showed "Failed to fetch."** → PDP was a single `'use client'` component
  calling `getProductByHandle` directly in the browser, but `SHOPIFY_STORE_DOMAIN`
  is a server-only env var — the fetch URL became `https://undefined/...`. →
  Split into a server component (`page.tsx`, does the fetch) + client component
  (`ProductDetail.tsx`, handles interactivity), and added `NEXT_PUBLIC_` copies
  of the Shopify credentials for the cases where client-side fetches are needed
  (e.g. cart mutations).

- **Shopify product images failed to load.** → `cdn.shopify.com` wasn't in
  Next.js's allowed image hosts. → Added it to `images.remotePatterns` in
  `next.config.ts`.

- **New products in Shopify didn't appear on the site.** → `cache: 'force-cache'`
  cached product fetches indefinitely. → Switched to `revalidate: 60`, and fixed
  `shopifyFetch` to never set both `cache` and `next.revalidate` together
  (Next.js rejects that combination).

## 2026-06-23

- **PDP large image cropped the garment on shorter screens.** → The image
  container used `aspect-[3/4]` (width-driven sizing) with `object-cover`
  (crops overflow) — on narrower screens the box got short enough to cut off
  the bottom of the dress. → Changed to `h-screen max-h-[900px]` (height-driven)
  with `object-contain` (no cropping, letterboxed instead). Thumbnails changed
  from `aspect-square` to `aspect-[2/3]` to match the actual 1703×2560 source
  image ratio.

- **Mobile hamburger menu showed a gap with the hero image bleeding through
  at the top.** → The overlay used `fixed inset-0 top-28`, but `top-28` (112px)
  didn't match the navbar's actual height (`h-16` = 64px), leaving a 48px gap
  uncovered. → Changed to `top-16 md:top-28` (the `md:top-28` half is inert
  since the element is `md:hidden`, kept per user request for clarity/future-proofing).
  Also reduced mobile side padding `px-10` → `px-6 md:px-10` for better breathing
  room on narrow screens.

- **React hydration mismatch error after editing `Navbar.tsx` mid-session**
  (`<a>` vs `<button>` for the cart icon). → Stale Hot Module Reload state — the
  server had the old render cached while the client picked up the new component
  via HMR. → Not a code bug; resolved by restarting the dev server and hard-
  refreshing the browser. Confirmed it does not occur in a clean build.

- **Cart quantity stepper: hitting "−" at quantity 1 did nothing** (button was
  disabled). → Original spec disabled decrement below 1. → Changed per updated
  spec: hitting "−" at quantity 1 now removes the line entirely (same effect as
  the "×" remove button), and the "−" button is never disabled.

- **`brew install cloudflared` failed** with `Refusing to load formula
  mongodb/brew/mongodb-database-tools from untrusted tap`. → An unrelated,
  previously-added Homebrew tap (`mongodb/brew`) is untrusted, and Homebrew
  refuses to load *any* formula while an untrusted tap is present during
  auto-update. → Reinstalled with
  `HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_REQUIRE_TAP_TRUST=1 brew install cloudflared`.

- **`revalidateTag(PRODUCTS_TAG)` failed `tsc` with "Expected 2 arguments, but
  got 1."** → Next.js 16.2 changed `revalidateTag`'s signature to require a
  second "cache profile" argument. → Added `'max'` as the second argument:
  `revalidateTag(PRODUCTS_TAG, 'max')`.

- **cloudflared tunnel logs showed repeated `malformed HTTP response
  "Unauthorized"` errors.** → These were all `type=ws` requests to
  `/_next/webpack-hmr` — Turbopack's dev server rejects the HMR WebSocket
  upgrade when it arrives via the tunnel's domain instead of `localhost`
  (origin check). The actual app and the webhook endpoint (plain HTTP POST,
  not WebSocket) were unaffected — confirmed working via direct curl tests. →
  Not a bug requiring a fix: browse the site at `localhost:3000` directly
  during development; the tunnel URL is only for Shopify to reach the webhook
  endpoint. See [decision 009](decisions/009-webhook-revalidation.md).

## What's still open

- Navbar HMR-origin warning (`allowedDevOrigins`) appears if the site is loaded
  through the cloudflare tunnel domain — cosmetic, only happens if browsing via
  the tunnel instead of `localhost`.
- `/cart`, `/search`, `/collections/[handle]` routes are still empty stubs.

## 2026-07-08

- **Waitlist signup failed with "Password is too long (maximum is 40
  characters)."** → Shopify's `customerCreate` requires a password, and the
  generated throwaway password was 48 hex chars — over Shopify's undocumented
  40-char cap. → Reduced to 16 random bytes (32 hex chars) in
  `lib/newsletter.ts`; added a `<= 40` length assertion to the unit test.
  Caught by live form testing on `/coming-soon`; end-to-end verified — customer
  created in Shopify with `marketingState: SUBSCRIBED`.

- **`robots.txt` redirected to `/coming-soon` instead of being served.** →
  The pre-launch gate middleware matched every route except `_next/static`
  and `_next/image`, so the dynamically-generated `/robots.txt` route got
  swept into the gate along with real pages — meaning crawlers couldn't even
  read the "stay away" instruction while the site was gated. → Added
  `/robots.txt` and `/sitemap.xml` to the always-allowed path list in
  `lib/gate.ts`, verified with a live curl test (`200` instead of `307`).
  See [decision 010](decisions/010-rebrand-renovation.md).

## 2026-07-11

- **A Tank Top's Red color variant showed no swatch chip on the PDP.** →
  `colorHexMap` (frontend fallback map) had no `Red` entry — but the deeper
  cause was that Shopify's real swatch data was never queried at all. The
  PDP only ever read `variant.selectedOptions` (plain name/value strings);
  the actual hex lives on the separate product-level `options.optionValues.swatch`
  field, which was confirmed live (via both Admin and Storefront API) to
  already be set correctly for every product, including Red at `#f61f1f`. →
  Added `options { optionValues { swatch { color } } }` to
  `GET_PRODUCT_BY_HANDLE_QUERY`, threaded the type through
  `ShopifyProduct.options`, and added `resolveColorHex()` in
  `ProductDetail.tsx` to prefer the native swatch, falling back to
  `colorHexMap` only for products that predate having one set. Verified live
  — PDP now renders `#f61f1f` for Red directly from Shopify, no code change
  needed for future colors. See [decision 002](decisions/002-color-swatch.md)
  (migration from the original v1 plan).

- **The 5 Shop collections returned `null` via the Storefront API** (`collectionByHandle`/`collection(handle:)` both gave nothing) despite existing in Admin. → Collections were published only to the "Online Store" sales channel, not "Eré Headless" — the channel the Storefront API token actually reads from. Same class of gotcha as earlier webhook/metaobject Storefront-access issues. → Published all 5 collections to the Headless channel via an Admin API `publishablePublish` mutation; verified live via Storefront API (`collection(handle: "tops")` now returns real products).

- **`/brands/ère` 404'd even though the vendor "ère" has 6 real products** — `/brands/repos` worked fine. → Added debug logging and found `params.vendor` arrived as the literal string `"%C3%A8re"` (percent signs included) — Next.js's App Router does **not** auto-decode dynamic route segments containing percent-encoded UTF-8, contrary to assumption. The vendor query then searched for a vendor literally named `%C3%A8re`, which doesn't exist. → Added an explicit `decodeURIComponent()` call on the route param in `app/brands/[vendor]/page.tsx` before using it. `/shop/[collection]` was never affected since its segments (tops, bottoms, etc.) are plain ASCII and never get percent-encoded in the first place.
