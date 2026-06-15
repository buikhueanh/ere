# ére — Architecture

> Design decisions (data model, color swatches, size guide, checkout, required Shopify Admin setup) are recorded in [docs/decisions/](docs/decisions/README.md). Read those before changing the data model.

## Overview

Luxury fashion Shopify storefront. Next.js App Router frontend that talks directly to the Shopify Storefront API via GraphQL. No backend — all data fetching happens in React Server Components or client-side via context.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Data | Shopify Storefront API 2024-01 (GraphQL) |
| Fonts | Cormorant Garamond (serif) + Inter (sans) |
| Icons | lucide-react |
| Utilities | clsx + tailwind-merge |

## Directory Map

```
app/                        Next.js App Router pages
  layout.tsx                Root layout — fonts, CartProvider, Navbar, Footer
  page.tsx                  Homepage
  shop/page.tsx             Product listing
  products/[handle]/        Product detail (dynamic route)
  designers/page.tsx        Designers index
  about/page.tsx            Brand page
  cart/page.tsx             Cart page (fallback for no-JS)
  search/page.tsx           Search results
  (support)/                Route group — no layout segment in URL
    contact/page.tsx
    faq/page.tsx
    privacy/page.tsx
    shipping/page.tsx
    terms/page.tsx

components/
  layout/
    Navbar.tsx              Sticky header, responsive, mobile hamburger
    Footer.tsx              Support links + copyright
    NotificationBar.tsx     Announcement banner (above Navbar)
  product/
    ProductCard.tsx         Image, title, vendor, price — links to /products/[handle]
    ProductGrid.tsx         Responsive grid of ProductCards
    ProductGallery.tsx      Image carousel/grid for product detail
    SizeSelector.tsx        Size option picker
    AddToCartButton.tsx     Calls CartContext addItem
  filters/
    FilterSidebar.tsx       Size, color, sort controls
    ActiveFilters.tsx       Removable active filter chips
  ui/
    CartDrawer.tsx          Slide-in cart panel from the right
    Accordion.tsx           Expand/collapse — used on FAQ + product detail
    Badge.tsx               Pill labels
    Button.tsx              Base button component

lib/
  shopify/
    client.ts               shopifyFetch() — all API calls go through here
    products.ts             getProducts(), getProductByHandle()
    cart.ts                 createCart(), addToCart(), getCart()
    collections.ts          getCollection()
    search.ts               searchProducts()
  queries/
    product.queries.ts      GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, SEARCH_PRODUCTS_QUERY
    cart.queries.ts         CREATE_CART_MUTATION, ADD_TO_CART_MUTATION, REMOVE_FROM_CART_MUTATION, UPDATE_CART_MUTATION, GET_CART_QUERY
    collection.queries.ts   GET_COLLECTION_QUERY

context/
  CartProvider.tsx          Global cart state — cartId persisted in localStorage

hooks/
  useCart.ts                Re-exports CartContext for convenience

types/
  shopify.types.ts          ShopifyProduct, ShopifyVariant, ShopifyImage, ShopifyCollection
  cart.types.ts             Cart, CartLine
  global.types.ts           NavLink, SortOption, FilterState

config/
  navigation.ts             navLinks (Shop, Designers, About), supportLinks
  site.ts                   siteConfig — name, description, currency, locale, url
  filters.ts                sortOptions, sizeOptions, colorOptions

utils/
  cn.ts                     clsx + twMerge helper
  formatPrice.ts            Intl.NumberFormat wrapper
  truncate.ts               String truncation

styles/
  globals.css               Tailwind v4 import, CSS vars (--background, --foreground), @theme inline

public/
  images/logo.png
  images/hero/homepage.jpeg
```

## Data Flow

```
Shopify Storefront API (GraphQL)
        │
        ▼
lib/shopify/client.ts  ← shopifyFetch()
        │
        ├── lib/shopify/products.ts
        ├── lib/shopify/collections.ts
        ├── lib/shopify/search.ts
        └── lib/shopify/cart.ts
                │
                ├── Server Components (app/**/page.tsx)
                │     └── fetch at render, pass props to components
                │
                └── context/CartProvider.tsx  (client-side)
                      └── hooks/useCart.ts
                            └── components/product/AddToCartButton.tsx
                            └── components/ui/CartDrawer.tsx
```

**Rule:** Pages fetch data. Components render it. Cart mutations go through CartContext.

## Shopify Integration

`shopifyFetch()` in `lib/shopify/client.ts` is the single entry point. It reads:
- `SHOPIFY_STORE_DOMAIN` — e.g. `your-store.myshopify.com`
- `SHOPIFY_STOREFRONT_TOKEN` — Storefront API access token

Endpoint: `https://{domain}/api/2024-01/graphql.json`

Default cache strategy is `force-cache` (ISR-friendly). Cart mutations override to `cache: 'no-store'`.

## Cart Architecture

Cart ID is created on first add-to-cart and stored in `localStorage`. On subsequent visits, `CartProvider` reads the ID and calls `getCart()` to rehydrate. The Shopify-hosted checkout URL (`cart.checkoutUrl`) is used directly — no custom checkout.

Cart state shape (from `types/cart.types.ts`):
```ts
Cart {
  id, checkoutUrl, totalQuantity,
  lines: { nodes: CartLine[] },
  cost: { subtotalAmount, totalAmount }
}
```

## Styling Conventions

- Tailwind v4 syntax: `@import "tailwindcss"` + `@theme inline` in globals.css. Do NOT use v3 `@tailwind base/components/utilities`.
- CSS vars: `--background`, `--foreground` defined in `:root`, mapped via `@theme inline` to `bg-background`, `text-foreground`.
- Font vars: `--font-sans` (Inter), `--font-serif` (Cormorant Garamond) set via Next.js `next/font`, consumed as `font-sans` / `font-serif` Tailwind classes.
- No inline styles. No CSS modules.

### Design Tokens

| Token | Usage |
|---|---|
| `text-xs tracking-widest uppercase` | All nav labels, UI labels, buttons |
| `font-serif` | Page headings, product titles |
| `text-foreground/70` | Muted state (icons, secondary links) |
| `transition-colors` | All interactive hover states |
| `after:` underline pattern | Nav link hover underline animation |

## Server vs Client Components

Default to Server Components. Add `"use client"` only for:
- State or effects (`useState`, `useEffect`)
- Browser APIs (`localStorage`, `window`)
- Event handlers
- Context consumers

Current client components: `Navbar`, `CartProvider`, `CartDrawer`, `FilterSidebar`, `SizeSelector`, `AddToCartButton`.

## Environment Variables

```
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

`NEXT_PUBLIC_SITE_URL` is optional — falls back to `http://localhost:3000` in `config/site.ts`.
