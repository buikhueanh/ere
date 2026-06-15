# 004 — No Sale Prices, No Stock Counts

**Status:** Active
**Date:** 2026-06-12

## Decision (v1)

Two Storefront API fields are **deliberately excluded** from types and queries:

| Field | What it enables | Why excluded |
|---|---|---|
| `variant.compareAtPrice` / `product.compareAtPriceRange` | "Was $480, now $320" strikethrough pricing | Sale styling reads as discount-retail; off-brand for a luxury positioning |
| `variant.quantityAvailable` | "Only 2 left" urgency messaging | Scarcity tactics undermine the quiet-luxury tone. If something sells out, it is simply unavailable — no countdown, no pressure |

Sold-out handling instead: `variant.availableForSale` (greyed-out size) and `product.availableForSale` (sold-out state on the card). Binary, no numbers.

This is a **brand decision, not a technical one**. The fields are cheap to add — they were left out on purpose.

## Later version

If strategy changes (seasonal archive sale, outlet section, end-of-season markdowns):

1. Add `compareAtPrice` to `ShopifyVariant` and the product queries.
2. Decide presentation deliberately — luxury houses that discount usually do it in a separate, visually distinct "archive" section rather than strikethroughs on the main grid.
3. `quantityAvailable` should likely stay excluded regardless.

**Trigger to revisit:** an explicit merchandising decision by the brand owner — never as a side effect of a technical change.
