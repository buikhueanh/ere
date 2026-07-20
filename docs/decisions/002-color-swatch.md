# 002 — Color Swatch Rendering

**Status:** Superseded — see "Migrated" section below
**Date:** 2026-06-12 (migrated 2026-07-11)

## Problem

The PDP shows a small color chip next to "Color : White". At the time this
was written, our product option values (`variant.selectedOptions`) only
carried a plain string like `"White"` — no hex, no swatch.

**Correction (2026-07-11):** the original problem statement was wrong.
Shopify's newer product-options model *does* store a real swatch per option
value (`ProductOptionValue.swatch.color`), in both the Admin and Storefront
APIs, and it turns out this store's products already had it set (confirmed
live via the Storefront API). We just weren't querying for it — `selectedOptions`
(per-variant) and `options`/`optionValues` (per-product, where swatch lives)
are two different fields, and only the former was ever in our query.

## Decision (v1): frontend color-name → hex map

A config map in the frontend, e.g. `config/colors.ts`:

```ts
export const colorHexMap: Record<string, string> = {
  White: '#F5F5F0',
  Black: '#1A1A1A',
  Navy: '#1F2A44',
  // ...
};
```

Lookup by `variant.selectedOptions[name="Color"].value`. Unknown color name → render no swatch (fail quietly, never a broken chip).

**Why:** zero Shopify setup, fastest to a testable PDP. Acceptable while the catalog is small and color names are controlled by us.

## Known weaknesses (accepted for v1)

- A designer using an unmapped color name ("Écru", "Greige") silently gets no swatch.
- Adding a color requires a code change + redeploy — violates the "everything managed from Shopify" principle.

## Migrated (2026-07-11): Shopify's native option-value swatch

Trigger hit exactly as predicted: a "Red" tank top variant had no swatch,
because `colorHexMap` had no `Red` entry.

Rather than just adding `Red` to the map (treating the symptom), migrated to
Shopify's native swatch feature:

- `lib/queries/product.queries.ts` — added `options { name optionValues { name swatch { color } } }` to `GET_PRODUCT_BY_HANDLE_QUERY`.
- `types/shopify.types.ts` — `ShopifyProduct.options` carries this through.
- `components/product/ProductDetail.tsx` — new `resolveColorHex(options, color)` reads the native swatch first, falling back to `colorHexMap` only for a color that predates having a swatch set.
- `config/colors.ts` — kept as the fallback only; no longer the primary source.

**Result:** any color set in Shopify Admin (Product → Color option → per-value
swatch) works immediately, no code change, no redeploy — the thing this
record originally flagged as a v1 weakness.

**Trigger to revisit:** if a product predates swatches and its color still
renders no chip, that specific color name needs adding to `colorHexMap` as a
stopgap — but the real fix is setting its swatch in Shopify Admin.
