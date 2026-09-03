# Decision Records

Each file documents one decision: what we chose for **v1**, why, and what should change in a later, more stable version. Read these before changing the data model or rebuilding a feature — the trade-offs were deliberate.

| # | Decision | v1 choice | Revisit when |
|---|---|---|---|
| [001](001-product-data-model.md) | Product data model | Trimmed Storefront API fields + 5 metafields | Adding sale/scarcity features or richer PDP content |
| [002](002-color-swatch.md) | Color swatch rendering | Frontend color-name → hex map | A designer uses a color name not in the map |
| [003](003-size-guide.md) | Size guide source | Per-product file metafield | Many designers / Designers page gets bios |
| [004](004-no-scarcity-no-sale.md) | No sale prices, no stock counts | Fields excluded from queries & types | Brand strategy changes (outlet, archive sale) |
| [005](005-checkout.md) | Payment & checkout | Shopify-hosted checkout, redirect via `cart.checkoutUrl` | Need custom checkout UX (unlikely; requires Shopify Plus) |
| [006](006-shopify-admin-setup.md) | Required Shopify Admin setup | 6 metafield definitions before first product upload | New PDP content needs (e.g. video, lookbook) |
| [007](007-shop-and-pdp-layout.md) | Shop page & PDP layout | Design tokens, grid, card, PDP responsive layout | UX testing reveals gaps |
| [008](008-breadcrumb-collection-hierarchy.md) | Breadcrumb hierarchy | Frontend config array maps flat Shopify collections to parent › child | Store grows to 3+ category levels |
| [009](009-webhook-revalidation.md) | Webhook cache revalidation | Shopify webhooks + Next.js cache tags, 60s fallback | Production deploy (swap tunnel URL), API version deprecation |
| [010](010-rebrand-renovation.md) | Rebrand renovation (teaser, IA, layout) | Gated teaser + new nav/IA (§8 superseded by 011) | UX testing post-launch; see `docs/RENOVATION_PLAN.md` for build status |
| [011](011-shop-categories-placeholders.md) | Shop categories, placeholders, dropdowns | Collections as categories + product-free placeholder images + 16-card pages | Search UX decision; placeholder links; collection list growth |
| [012](012-customer-accounts-and-database.md) | Customer accounts & supplementary database | Shopify Customer Account API for auth/identity/orders + separate DB (cached email/name + custom fields + recommendation events) | Onboarding forced-vs-skippable decision; GDPR delete handling; DB provider pick |

## Conventions

- Status is one of: **Active** (current behavior), **Superseded** (replaced — link to the new record).
- When a decision changes, do not edit history — mark it Superseded and add a new numbered record.
