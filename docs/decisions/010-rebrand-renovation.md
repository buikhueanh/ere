# 010 — Rebrand Renovation: Teaser, IA, and Layout Overhaul

**Status:** Active
**Date:** 2026-06-28
**Files:** affects nearly every route — see scope below. Implementation not yet started; see `docs/RENOVATION_PLAN.md` for build status.

## Why

New brand direction (concept in Figma: `OsEQqP6mQDr8oDlJZHMUDn`). The visual language, information architecture, and several page layouts change. The Shopify data layer (products, cart, checkout, webhook) is **not** affected — this is a UI/IA renovation, not a backend rewrite.

## Decision (v1)

### 1. Rollout strategy — teaser gates the public site

- Production domain shows **only** a waitlist teaser page until real launch. No nav, no shop access for the public.
- Gating mechanism: an env flag. When the public-facing flag is "not launched," every route except the teaser redirects to it.
- **Preview bypass:** a secret token passed as a URL query param (e.g. `?preview=<token>`) lets the team view the real in-progress site on the production domain without exposing it publicly. Not a visible password field — purely a hidden backdoor in the URL.
- **SEO:** while gated, non-teaser pages get `noindex` (and likely `robots.txt` disallow) so search engines don't crawl an unlaunched site.
- Locally / in dev, the flag stays "launched" so building and testing continue normally without the gate.

### 2. Teaser / waitlist page

**One page:** the "coming soon" gate — the only thing the public sees at the production domain pre-launch. It reuses the **same signup module component** built for section 12 (image left, headline + subtext + email input + submit button + legal consent text, right) — same visual component, **no navbar** (nothing to navigate to yet), and **new copy** written for a pre-launch waitlist context (e.g. "Be the first to know" style headline/subtext — the section-12 module's own copy is written fresh per placement, styled after the *layout* of editorial "shop the look" pages, not quoting or referencing any publication by name anywhere in the actual content).

Footer on the gate page: about us / customer care / © 2026 ere / `ère` logo bottom-right — same footer used site-wide (section 3).

The **homepage** (section 6) is a separate, later thing — the minimal post-launch landing page (newsletter/search/cart nav + swappable hero image), not shown until the gate comes down.

Signup form (shared by the gate page and the section-11 module) → Shopify `customerCreate` mutation (Storefront API).
- Capture marketing consent at signup (`acceptsMarketing: true`) — required for CAN-SPAM/GDPR compliance and for Shopify Email to be allowed to send to them. Verified working: customers land with `marketingState: SUBSCRIBED`.
- ~~Tag new customers (e.g. `waitlist-2026`)~~ — **not possible from the Storefront API** (tags are Admin-API-only). Segment in Shopify Email by email-subscribed state + customer creation date instead; same outcome, no extra plumbing.

**Sending tool: Shopify Email** (native, free, lives in Admin). Chosen over Klaviyo/Mailchimp because the only current need is a single launch-announcement blast, not automated flows. Switching later is low-friction: any major email tool's Shopify integration auto-syncs existing customers + consent + tags, no migration needed, because the data already lives as native Shopify customer records — not a custom database.

### 3. Site-wide footer (post-launch)

About Us · Customer Care (parent link; nests FAQ / Shipping / Contact) · copyright centered · `ère` logo bottom-right.

### 4. Typography

Four Google Fonts, each mapped to a CSS variable in `app/layout.tsx` (all `--font-*` variables consumed by `styles/globals.css` / Tailwind, so components just use `font-serif` / `font-script` / etc.):

| Variable | Font | Weights | Used for |
|---|---|---|---|
| `--font-serif` (aliased to `--font-sans` too) | Amiri | 400, 700 | Default body/heading/UI text everywhere — every existing `font-sans`/`font-serif` class site-wide. Replaced Inter + Cormorant Garamond, then Libre Baskerville, in successive rebrand passes. |
| `--font-script` | Monsieur La Doulaise | 400 | Wordmark and in-site nav links (`shop`, `new in`, etc.) |
| `--font-handwriting` | Nothing You Could Do | 400 | Newsletter signup module headline (current). Combined with the `italic` utility in JSX even though only a normal style is loaded — the slant currently seen is browser-synthesized, not a true italic face. |
| `--font-display` | Cormorant Infant | 500 (normal + true italic) | Defined and font-loaded, but **not currently used by any component** — was the headline font in an earlier iteration before `font-handwriting` replaced it. Either wire it back in somewhere or drop it to stop loading an unused font file. |

**Trigger to revisit:** decide whether the headline should use `font-display`'s real italic instead of `font-handwriting`'s synthesized slant, and remove whichever font ends up unused.

### 5. Two navbar variants

| Variant | Where | Links |
|---|---|---|
| Homepage nav | `/` only | Newsletter · Search · Cart — **deliberately** no Shop/Brands. Confirmed intentional: the homepage hero image is the only path deeper into the site (→ New In). |
| In-site nav | Shop, New In, Brands, PDP, etc. | Shop · New In · Brands · Search · Cart |

**Naming:** "Designer" was renamed to **"Brands"** in the actual nav (`config/navigation.ts`) — this doc's older sections still say "Designer"; treat "Brands" as the current name for that page/link wherever "Designer" appears elsewhere in this document.

**Journal is not currently in the nav.** The page and its boilerplate stay in the codebase (see section 10) so the route exists and can be built out, but it's intentionally left out of both navbar variants for now — add it back to the in-site nav link list when Journal is ready to go live.

Mobile: same hamburger menu pattern as today, just with the updated link list per variant above — no new mobile nav pattern needed.

**Nav dropdown on hover/click:** hovering or clicking "Shop" reveals a dropdown beneath it listing sub-categories (e.g. wardrobe, bottoms, top), with a dot marking whichever one is currently hovered/active. Clicking a sub-item filters the Shop grid (e.g. `/shop?category=bottoms`) — same Shop page, pre-filtered. **Data model TBD:** requires products to be categorizable by this dimension (likely Shopify's `productType` field, or a tag) — needs a follow-up decision on which field drives it and what the exact category list is before building.

### 6. Homepage

- One large hero image, click → navigates to New In.
- `ère` wordmark + season label text (e.g. "summer/spring 2026 collection").
- **Hero image swap mechanism:** a singleton Shopify metaobject `homepage_settings` with one `image` field. Non-technical person replaces it in Shopify Admin — same place they already manage products, no code, no file access needed.

### 7. New In page

Plain grid. 4 columns desktop, 2 columns mobile/small tablet — same responsive breakpoint logic as the existing shop grid.

**Pagination:** 4 rows per page, numbered page selector at the bottom (`/new-in?page=2`, bookmarkable). Page boundary is the same on mobile — same products per page — mobile just reflows each row into its normal 2-up grid (more vertical lines, same content).

### 8. Shop page — hybrid curated + catalog layout

> **Superseded by [011](011-shop-categories-placeholders.md)** (2026-07-11):
> the `shop_look` metaobject below was replaced by product-free placeholder
> images, and categories/pagination were re-spec'd. Kept for history.

**Problem this solves:** a pure editorial/curated layout (borrowed from magazine-style "shop the look" pages, e.g. Vogue) is never required to be exhaustive — but an ecommerce catalog page implicitly is. Forcing every active product into groups of exactly 3 creates a recurring "what about the leftovers" problem as inventory changes. Resolution: make curated rows an *overlay* on top of the full catalog, not a replacement for it.

**Data model — new metaobject `shop_look`:**
| Field | Purpose |
|---|---|
| `styling_image` | the editorial/outfit photo |
| `product_1`, `product_2`, `product_3` | product references — the items shown together |
| `row_position` | integer; which row of the Shop page this look occupies |

**Render logic:**
1. Fetch all active products (Shopify default order) + all `shop_look` entries.
2. Walk row by row. If a `shop_look` claims that `row_position`, render it: 3 referenced products + the styling image card (position alternates per Figma reference — image left on some rows, right/first on others).
3. Otherwise, fill the row with the next batch of products *not* claimed by any look, in normal catalog order. A partial last row (e.g. 1–2 cards instead of 3) is normal and expected — not a bug, same as any left-aligned ecommerce grid.
4. A product referenced by a look is removed from the plain-catalog pool so it never renders twice.

**Edge cases:**
- Product inside a look **sells out** → kept, rendered with the existing Sold Out treatment (matches [004](004-no-scarcity-no-sale.md) — show it, don't hide it).
- Product inside a look is **deleted** → that card is silently dropped; the row continues with whatever's left (e.g. 2 products + image instead of 3 + image). No alert needed — deletion is a deliberate, rare admin action.
- Two looks claim the same `row_position` → first-created look wins the slot; the second is automatically bumped to the next open position. No error state.

**Responsive:**
- Plain catalog rows: 2-up mobile/small tablet (matches New In).
- Curated look rows: the styling image becomes **full-width**, with its 3 products stacked in the normal 2-up grid beneath it — preserves the image's visual weight from desktop instead of squeezing it into a column alongside product cards.

**Pagination:** the unit being counted is a **content block**, not a literal visual row — a block is either one `shop_look` group (3 products + image) or one batch of 3 plain products. A page = 4 blocks, numbered page selector at the bottom (`/shop?page=2`). Desktop and mobile show the *identical 4 blocks* per page — mobile only changes how tall each block renders (image full-width + 2-up products beneath, per the responsive rule above), never which blocks belong to which page.

### 9. Brands page (formerly "Designer")

List distinct `vendor` values across active products. Clicking a brand navigates to a product grid filtered by that vendor. No new data model — reuses the `vendor` field already on every product.

### 10. Journal page (new — a blog; not yet in nav)

Boilerplate/route exists in the codebase now, but is intentionally excluded from both navbar variants until the page is ready to launch (see section 5).

Use **Shopify's native Blog feature** (Online Store → Blog Posts in Admin), exposed via Storefront API blog/article queries. Non-technical person writes and publishes directly in Shopify Admin — same workflow they already use for products, no new tool or login.

Trade-off accepted: Shopify's blog editor is basic rich text + images, not a heavy magazine-layout tool (no custom layout blocks). Acceptable for styling write-ups; revisit if a more visual format is needed later.

### 11. PDP changes (reference: therow.com/products/edrisca-shirt-white)

| Element | Old | New |
|---|---|---|
| Thumbnail column | Present, leftmost | **Removed entirely** |
| Image area | Thumbnail strip + large image | Left half of page: scrollable stack of full images, no thumbnails |
| Info panel | Right side | **Unchanged** — same content (color, size, price, accordion), same position |
| After info panel | Nothing | **New:** "Similar products" section, sourced from the same Shopify collection the product belongs to |
| Overall split | ~60/40 gallery/info | Clean 50/50 left/right |

### 12. Newsletter signup module (Shop & New In, and reused on the teaser)

Confirmed from Figma layout (the Figma mockup text itself was placeholder styled after editorial "shop the look" pages — **final copy will not reference any outside publication by name**): image left (editorial/collage photo), right side has a headline, one-line subtext, email input + black "SIGN UP"-style button on the same row, and small legal consent text below linking to user agreement / arbitration provisions / privacy policy.

Appears after the page selector, before the footer, on both Shop and New In pages. **This exact component is reused on the "coming soon" gate page** (section 2) with different copy and no navbar around it.

**Backend: identical mechanism to the teaser signup** — same `customerCreate` mutation, same consent capture, same Shopify customer list/segment. This is just another entry point into the same waitlist/newsletter list, not a separate audience or purpose.

## What stays exactly as-is

- Shopify data layer: product/cart/checkout queries, webhook revalidation ([009](009-webhook-revalidation.md))
- CartDrawer — built and verified working; kept functionally and visually unchanged
- No-scarcity/no-sale-price philosophy ([004](004-no-scarcity-no-sale.md))
- Shopify-hosted checkout ([005](005-checkout.md))

## Deferred — explicitly out of scope for this pass

- **Search page** (`/search`): stays a stub for now. When built, should behave like standard commercial-site product search with expanded/autocomplete suggestions — not urgent.
- **Nav dropdown category data model** (section 5): confirmed the *behavior* (hover/click "Shop" → sub-category dropdown → filters Shop grid), not yet confirmed the *data source* (`productType` vs. tags) or the exact category list. Resolve before building the dropdown.

## Later version

- Klaviyo/Mailchimp if automated email flows (welcome series, etc.) become needed beyond the single launch blast.
- Heavier Journal layout tooling if Shopify's native blog editor proves too limited.
- Revisit the homepage's "no direct nav to Shop/Brands" choice if analytics show it's actually hurting discovery rather than being a deliberate minimalist funnel.
- Add Journal back into the in-site nav once the page is ready to launch (section 5).

**Trigger to revisit:** UX testing post-launch, or if Brands/Journal scope grows beyond what vendor-filtering and native blog posts can support.
