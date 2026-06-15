# 007 — Shop Page & PDP Layout

**Status:** Active
**Date:** 2026-06-12
**Files:** `components/product/*`, `app/shop/page.tsx`, `app/products/[handle]/page.tsx`, `styles/globals.css`

## Design token rule

All colors, fonts, and spacing used in product components must be defined as CSS variables in `styles/globals.css` under `:root` and mapped via `@theme inline`. No inline styles, no per-component style decisions. To change any visual later, change `globals.css` only.

### New tokens added for product UI

| CSS variable | Tailwind class | Value | Used for |
|---|---|---|---|
| `--color-card-bg` | `bg-card` | `#f5f3f0` | Product image card background |
| `--color-border` | `border-border` | `#e8e6e3` | Card borders, input borders, dividers |
| `--color-muted` | `text-muted` | `#a8a29e` | Sold Out text, placeholder, disabled labels |
| `--color-muted-bg` | `bg-muted` | `#f0ede9` | Sold-out size button background |

### Existing tokens (do not redefine)

| CSS variable | Tailwind class | Value |
|---|---|---|
| `--background` | `bg-background` | `#ffffff` |
| `--foreground` | `text-foreground` | `#0a0a0a` |
| `--font-sans` | `font-sans` | Inter |
| `--font-serif` | `font-serif` | Cormorant Garamond (300–600) |

---

## Shop page grid

| Breakpoint | Columns | Name/price |
|---|---|---|
| Mobile (< md) | 2 | Stack vertically: name above price |
| Desktop (≥ md) | 4 | Same row: name left, price right |

### Product card

- Square-ish image with `bg-card` background
- Product name: bottom-left, `text-xs tracking-widest uppercase font-sans`
- Price: bottom-right (desktop), below name (mobile)
- "Sold Out" label: top-left corner of image, shown when `product.availableForSale === false`
- Hover second image: optional — `ProductCard` accepts `hoverImageUrl?: string`. If provided, swaps image src on hover. If null/undefined, no swap, image stays still. Activates automatically when a second image exists; no code change needed.

---

## Product Detail Page (PDP)

### Desktop layout (≥ md)

Three-column: thumbnail strip | large image | info panel

### Mobile layout (< md)

Single column stack:
1. Full-width image — scroll/swipe vertically to see more images (no thumbnail strip)
2. Info stacks below: breadcrumb → title → price → color → sizes → description → accordion
3. "Add to Shopping Bag" button fixed/sticky at bottom of screen

### Info panel — element order (both breakpoints)

| Element | Data source | Notes |
|---|---|---|
| Breadcrumb | `product.collections.nodes` | See 008 for hierarchy logic |
| Title | `product.title` | `font-serif` |
| Price | `priceRange.minVariantPrice` until variant resolved, then `variant.price` | |
| Color label | `variant.selectedOptions[name="Color"].value` | `"Color : White"` |
| Color swatches | Unique color values from all variants | Grey out if ALL sizes for that color are sold out |
| Size Guide link | Opens modal with `metafields.sizeGuide` image | Does not render if `sizeGuide` is null |
| Size buttons | Inline buttons, one per size option | `variant.availableForSale: false` → greyed bg + strikethrough text |
| Add to bag | `variant.id` → cart | Disabled until both color AND size are selected |
| Description | `product.descriptionHtml` | Rendered as HTML |
| More information + | Accordion (same on desktop and mobile) | Rows with null metafields are skipped silently |

### More information accordion rows

```
Fabric          → metafields.fabric
Origin          → metafields.origin
Care            → metafields.careInstructions
Fit notes       → metafields.fitNotes
Measurements    → metafields.measurements
Designer        → product.vendor
```

### Size selector

Custom dropdown ("Select Size" trigger + option list) on both desktop and mobile — matches the reference design. Built as a styled component, NOT a native `<select>`, so sold-out sizes can render greyed + strikethrough inside the list and styling stays on design tokens. Closes on outside click.

> Superseded earlier choice: inline size buttons (changed 2026-06-12 after visual review against the reference).

### Fabric placement

Fabric is only inside the "More information" accordion. Not surfaced above the price as a separate line (kept clean, less cluttered on first load).

### Accordion

Single "More information +" accordion on both desktop and mobile. No tab pattern. Consistent behavior across breakpoints.

## Later version

- Thumbnail strip on mobile if product has many images and UX testing shows users miss them
- Swipeable image carousel with dot indicators on mobile
- Size guide as a per-designer metaobject (see 003)
