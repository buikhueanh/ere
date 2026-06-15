# 006 — Required Shopify Admin Setup

**Status:** Active
**Date:** 2026-06-12

## Decision (v1)

The storefront expects this Shopify Admin configuration to exist **before the first product is uploaded**. Doing it after means going back and editing every product by hand.

### 1. Storefront API access

Admin → Settings → Apps and sales channels → Develop apps → create app → enable Storefront API with scopes:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_checkouts`
- `unauthenticated_write_checkouts`

Put the resulting values in `.env.local`:

```
SHOPIFY_STORE_DOMAIN=<store>.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=<storefront access token>
```

(Currently placeholders — nothing works until these are real.)

### 2. Metafield definitions (Settings → Custom data → Products)

| Namespace.key | Admin type | Shown in |
|---|---|---|
| `custom.fabric` | Single line text | accordion — e.g. "Crepe Silk — 18% Cupro, 38% Tencel, 44% Nylon" |
| `custom.origin` | Single line text | accordion — e.g. "Made in Italy" |
| `custom.care_instructions` | Multi-line text | accordion — e.g. "Dry clean only" |
| `custom.fit_notes` | Multi-line text | accordion — e.g. "Model is 5'9", wears size S" |
| `custom.measurements` | Multi-line text | accordion — one size per line: `S: Waist 67cm · Hip 98cm · Length 84cm` |
| `custom.size_guide` | File (image) | Size Guide modal (see 003) |

Tip: upload each designer's size-guide image to the file library **once**, then select it from the library per product.

### 3. Product upload conventions

| Field | Convention |
|---|---|
| Vendor | Designer name, spelled consistently — drives Designers page & cart display |
| Product type | Category label ("Shirts & Tops") — drives breadcrumb & filters |
| Tags | `new-in` on new arrivals — the ONLY tag the storefront reads (v1) |
| Options | Use option names exactly `Size` and `Color` — the PDP filters `selectedOptions` by these names |
| Variant images | Assign the colorway image to each variant so the PDP gallery swaps on color select |
| Collections | Assign each product to its collection(s) — drives the breadcrumb |

### 4. Test data for the first end-to-end run

- ≥1 product satisfying every convention above, with all 5 metafields filled.
- Payments: enable **Bogus Gateway** (test mode) to test checkout without real charges.

## Later version

- New PDP content (video, lookbook imagery, editorial text) → new metafield definitions, added here first.
- If option names ever need to differ from `Size`/`Color`, the PDP option-matching logic must change with them.
