# 014 — Brands index with product previews

**Status:** Active (2026-09-11)

## Context

`/brands` listed vendor names only. Each brand should also show a one-row
preview of its products, brands alphabetized, name linking to the full
`/brands/[vendor]` listing (unchanged).

## Decision

- **One fetch, grouped in memory.** `getVendors()` already pulls every
  product (`getProducts(250)`, cached 60s + `PRODUCTS_TAG`) and discards all
  but the vendor names. `getVendorGroups()` reuses that same call and groups
  by vendor (`groupProductsByVendor`, pure, tested) — so the index costs no
  additional Shopify requests regardless of brand count. The alternative,
  `getProductsByVendor()` per brand, would be N round-trips per render.
- **Newest per brand.** `GET_PRODUCTS_QUERY` sorts `CREATED_AT, reverse:
  true`; the grouping preserves input order and keeps the first 4, so each
  preview is that brand's four newest products. No query change.
- **Preview is `ProductGrid`** (`grid-cols-2 md:grid-cols-4`), the same grid
  as the shop pages: four products is one desktop row, two mobile rows. No
  new component.

## Revisit when

- **Catalogue exceeds 250 products.** `getProducts(250)` is a single
  Storefront API page. Beyond it, a brand whose products are all older than
  the newest 250 silently drops off the index (and the navbar dropdown,
  which shares `getVendors()`). Fix at that point: paginate `getProducts`
  with `pageInfo.hasNextPage` / `endCursor`, or switch the index to a
  vendor-first query.
- Marketing wants a brand image/bio above the preview → that is decision
  003's "Designers page gets bios" trigger; it needs a vendor metaobject.
