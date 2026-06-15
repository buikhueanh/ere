# 001 — Product Data Model

**Status:** Active
**Date:** 2026-06-12
**Files:** `types/shopify.types.ts`, `types/cart.types.ts`, `lib/queries/*`

## Decision (v1)

Query only the fields the UI actually renders. The reference design is a Toteme/The Row-style PDP: gallery strip, breadcrumb, title, price, color label + swatch, size guide link, size dropdown, add-to-bag, short description, "More information +" accordion.

### Kept (native Shopify fields)

| Field | Used for |
|---|---|
| `product.id, handle, title` | Keys, URL, display name |
| `product.descriptionHtml` | Short description on PDP (rich text) |
| `product.vendor` | Designer name — accordion, cart line, Designers page |
| `product.productType` | "Shirts & Tops" — breadcrumb, filters |
| `product.tags` | Only job: `new-in` tag drives the New In page |
| `product.availableForSale` | "Sold out" state on shop-grid card |
| `product.featuredImage` | Single image for shop-grid card (avoids loading full gallery per card) |
| `product.priceRange.minVariantPrice` | Price on shop-grid card |
| `product.images.nodes` | PDP gallery strip (url + altText only) |
| `product.collections.nodes` | Breadcrumb ("Women · Shirts & Tops") |
| `product.seo` | Meta tags (deferred wiring — post-MVP) |
| `variant.id` | `merchandiseId` sent to Shopify cart |
| `variant.availableForSale` | Grey out sold-out sizes |
| `variant.price` | PDP price (selected variant) |
| `variant.image` | Colorway image swap on PDP |
| `variant.selectedOptions` | Size dropdown + color label (filter by option name) |

### Removed (was in the original types)

| Field | Why removed |
|---|---|
| `product.description` (plain text) | Replaced by `descriptionHtml` |
| `variant.title` | Auto-generated "S / White" — never displayed; labels are built from `selectedOptions` |
| `image.width, image.height` | Next.js `<Image>` sets dimensions in the component |
| `cartLine.merchandise.title` | Same as variant.title |
| `cartLine.merchandise.product.images.nodes` | Cart line needs ONE image → replaced by `merchandise.image` (variant image) |

### Added metafields (see 006 for Admin setup)

`custom.fabric`, `custom.origin`, `custom.care`, `custom.fit_notes` (accordion content), `custom.size_guide` (file — see 003).

## What changes in a later version

- **`compareAtPrice` / `quantityAvailable`** — deliberately excluded (see 004). Re-add to `ShopifyVariant` + queries if strategy changes.
- **`product.seo`** — typed but not wired to `generateMetadata()` yet. Wire it when SEO becomes a priority.
- **`Money` type** — extracted once in `shopify.types.ts`; keep reusing it, don't inline `{amount, currencyCode}` again.
- **Pagination** — `getProducts(first = 24)` has no cursor handling. Needed once catalog exceeds one page.
