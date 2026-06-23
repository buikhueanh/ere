# 009 — Webhook-Based Cache Revalidation

**Status:** Active
**Date:** 2026-06-23
**Files:** `app/api/webhooks/shopify/route.ts`, `lib/shopify/client.ts`, `lib/shopify/products.ts`

## Problem

Product reads (`getProducts`, `getProductByHandle`) used `revalidate: 60` — Next.js
re-fetches from Shopify at most once every 60 seconds. A new or edited product could
take up to a minute to appear on the storefront after being saved in Shopify Admin.

## Decision (v1): Shopify webhooks + Next.js cache tags, with the 60s timer kept as a fallback

1. Every product fetch in `lib/shopify/products.ts` is tagged `PRODUCTS_TAG` (`'products'`)
   via `shopifyFetch({ tags: [...] })`.
2. `app/api/webhooks/shopify/route.ts` receives `POST` requests from Shopify on
   `products/create`, `products/update`, `products/delete`.
3. Each request's `X-Shopify-Hmac-Sha256` header is verified against an HMAC-SHA256
   digest of the raw body, signed with `SHOPIFY_WEBHOOK_SECRET`. Unsigned or
   mismatched requests get `401` — nobody but Shopify can trigger a revalidation.
4. On a valid request, `revalidateTag(PRODUCTS_TAG, 'max')` purges every cached
   product fetch immediately. (Next.js 16.2 requires this second "cache profile"
   argument.)
5. `revalidate: 60` is **not removed** — it stays as a safety net in case a webhook
   is ever missed (delivery failure, dev server down, tunnel dropped). Belt and
   suspenders, not an either/or.

## Why webhooks over shortening the revalidate window

Polling more frequently (e.g. `revalidate: 5`) would mean hitting Shopify's API
constantly regardless of whether anything changed — wasteful, and still has a
window where staleness is possible. A webhook is push-based: Shopify tells us
the instant something changes, so there's no polling cost and effectively no
staleness window for the common case.

## Local development caveat

Shopify cannot call `localhost`. Local testing requires a public tunnel:

```
cloudflared tunnel --url http://localhost:3000
```

This prints a random `https://*.trycloudflare.com` URL, which is registered as
the webhook target in Shopify Admin (Settings → Notifications → Webhooks). The
URL changes every time `cloudflared` restarts — the webhook URLs in Shopify Admin
must be updated to match each new session. The dev server is browsed at
`localhost:3000` directly (not the tunnel URL) for normal development; the tunnel
exists only so Shopify's servers can reach the webhook endpoint.

Verified live end-to-end on 2026-06-23: editing/creating/deleting a product in
Shopify Admin produced a `200` webhook hit and an instant cache bust, confirmed
in dev server logs for all three topics.

## Later version

- **Production:** the tunnel goes away entirely — webhooks point at the real
  deployed domain (e.g. `https://ere.com/api/webhooks/shopify`), which is stable
  and doesn't need re-registering.
- **Webhook registration via Admin API** instead of the Admin UI, so the three
  webhook subscriptions are created/versioned in code rather than manually
  clicked through per environment.
- Consider also tagging cart reads if cart-side data (e.g. variant prices) needs
  the same instant-invalidation treatment — not needed for v1 since cart is
  fetched live (`cache: 'no-store'`) already.

**Trigger to revisit:** if Shopify deprecates API version 2026-04 (re-check the
webhook version dropdown), or when deploying to production (swap tunnel URL for
real domain).
