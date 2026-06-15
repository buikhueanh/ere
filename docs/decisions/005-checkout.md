# 005 — Payment & Checkout

**Status:** Active
**Date:** 2026-06-12

## Decision (v1): Shopify-hosted checkout

We build **no payment UI at all**. The flow:

1. Cart is created/updated via Storefront API cart mutations (`cartCreate`, `cartLinesAdd`, ...).
2. Shopify returns `cart.checkoutUrl` on every cart response.
3. The "Checkout" button in the CartDrawer is a plain redirect to that URL.
4. Shopify hosts the entire checkout: shipping address, payment, taxes, order confirmation, receipts, fraud screening, PCI compliance.

This matches the project principle: *inventory, orders, payment — everything backend is delegated to Shopify.*

## What this buys us

- Zero PCI/compliance burden; no card data ever touches our code.
- Apple Pay / Google Pay / Shop Pay work out of the box.
- Testing is trivial: Shopify Bogus Gateway (test card numbers) in development.

## Known trade-off

The checkout page looks like Shopify's checkout, not fully like our site. Branding is limited to what Shopify Admin → Settings → Checkout allows (logo, colors, fonts). The URL is on the myshopify/checkout domain unless a custom domain is configured in Shopify.

## Later version

- **Checkout branding pass:** configure logo/typography/colors in Shopify Admin to match the storefront. Cheap, do this before launch.
- **Custom domain:** point checkout at the store's own domain via Shopify domain settings.
- **Fully custom checkout** is effectively a non-option: it requires Shopify Plus (significant cost) and rebuilding payment/tax/shipping logic we explicitly chose not to own. Only revisit if the business outgrows standard Shopify.

**Trigger to revisit:** never for v1/v2 — only a deliberate platform-tier upgrade.
