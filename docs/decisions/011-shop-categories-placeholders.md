# 011 — Shop Categories, Placeholder Images & Nav Dropdowns

**Status:** Active — supersedes the `shop_look` model in [010 §8](010-rebrand-renovation.md)
**Date:** 2026-07-11
**Files:** `app/shop/*`, `components/layout/Navbar.tsx`, `lib/shopify/*` (planned; see `docs/RENOVATION_PLAN.md` for build status)

## Why

Planning the nav hover-dropdowns surfaced two things: (1) products need a real
category dimension, which the data model never had; (2) the original
`shop_look` metaobject (3 product references + styling image + row position)
was more machinery than needed — the editorial image doesn't actually need to
reference products at all. This record replaces that model with something a
non-technical person can run alone.

## Decisions

### 1. Categories = Shopify Collections

`tops / bottoms / accessories / homeware / self-care` are Shopify
**Collections** (Admin → Products → Collections; assign products there, no
code). "all items" is not a collection — it's the unfiltered `/shop`.

Chosen over `productType` (free text, typo-prone, no admin bulk UI) and a
category metafield (more setup, same weakness). Collections are Shopify's
native answer, bulk-manageable, and already queryable via the Storefront API.

### 2. Nav hover-dropdowns

- **shop** → all items · tops · bottoms · accessories · homeware · self-care.
  Clicking navigates to `/shop` or `/shop/[collection]` — a real, bookmarkable
  page reusing the same Shop layout, pre-filtered to that collection.
- **brands** → distinct `vendor` values, **alphabetized at render time**
  (sorted server-side per cached render — nothing stored; a new brand appears
  correctly sorted at the next revalidation).
- Dot indicator marks the hovered/active item (per Figma).

### 3. New In ordering

`sortKey: CREATED_AT, reverse: true` — newest upload always stacks on top.
Pure sort-order change, no data model impact.

### 4. Placeholder images — replaces `shop_look` entirely

The editorial 4th card is now **just an image**, no product references.

**Metaobject `shop_placeholder`:**
| Field | Purpose |
|---|---|
| `image` | the editorial photo |
| `position` | integer; order within its page (1, 2, 3…) |
| `page` | which page it appears on: all-items / tops / bottoms / accessories / homeware / self-care |

**Render rule (identical on `/shop` and every `/shop/[collection]`):**
1. Walk the page's products in order; after every 3 products, insert that
   page's next unused placeholder (by `position`) as the 4th card.
2. When placeholders run out, rows silently become 4 products — plain grid,
   no gap.

**Non-technical workflow:** entries are named to mirror position
("Placeholder 02"). To change the 2nd placeholder on the homeware page: open
the homeware entry with position 2, swap the image, save. Order is explicit
data, so inserting between 1 and 2 is just renumbering.

**What this deletes from 010 §8:** sold-out-in-look handling, deleted-product
handling, row-position collision handling — all gone, because placeholders
reference no products.

### 5. Pagination

Two independent steps, so the placeholder rhythm and page size never
interact:
1. Build the full interleaved card sequence (step 4 above).
2. Cut into pages of **4 rows × 4 cards = 16 cards**. Overflow placeholders
   land on later pages naturally.

Mobile reflows the same 16 cards 2-up (8 rows); page boundaries identical to
desktop. Rows-per-page is one constant. The sequence/pagination builder is a
pure function → unit-tested like the cart and gate logic.

## Still open

- **Search UX** — inline overlay vs. dedicated page: TBD, deliberately parked
  (also deferred in 010).

## Later version

- Placeholder images could optionally link somewhere (a look, a journal
  post) — add a `link` field then; not now.
- If collections multiply, the dropdown list could come from the Storefront
  API instead of a hardcoded array.
