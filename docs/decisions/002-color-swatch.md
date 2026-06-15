# 002 — Color Swatch Rendering

**Status:** Active
**Date:** 2026-06-12

## Problem

The PDP shows a small color chip next to "Color : White". Shopify has **no native hex-color storage** — a variant option is just the string `"White"`.

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

## Later version: variant/option metafield

Move the hex (or a swatch image) into Shopify — a metafield on the variant or on the option value (`custom.color_swatch`). Then any color works without a deploy. The PDP component already receives a hex string either way, so the migration only touches the query + a small mapping function, not the UI.

**Trigger to migrate:** first time a product upload needs a color that isn't in the map.
