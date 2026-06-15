# 003 — Size Guide Source

**Status:** Active
**Date:** 2026-06-12

## Problem

Different designers have different size guides, so a single global size-guide modal won't work. Shopify's `vendor` field is plain text — there is no native "designer" entity to attach a guide to.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Per-product file metafield** (`custom.size_guide`) ✅ chosen | One query; per-product flexibility (tops vs. trousers charts differ); fits the upload-in-Admin workflow | Must attach guide on every product; forget = no guide on that PDP |
| B. Frontend map vendor → guide image | No Shopify setup | Code change per new designer; typo in vendor breaks lookup |
| C. Shopify Metaobject "Designer" (name, bio, size guide), referenced from products | Proper architecture; edit once; free content for Designers page | Most Admin setup; nested GraphQL reference query |

## Decision (v1): Option A

- Metafield `custom.size_guide`, type **File** (image), on Product.
- Typed as `metafields.sizeGuide: ShopifyImage | null` in `types/shopify.types.ts`.
- `null` → the "Size Guide" link does not render (never an empty modal).
- Workflow mitigation: upload each designer's guide image **once** to Shopify's file library, then select it from the library on each product — no re-uploading.

## Later version: Option C (Metaobjects)

When the store has many designers or the Designers page needs bios/imagery, create a `designer` metaobject (name, bio, hero image, size guide) and reference it from products. The PDP modal component consumes an image URL either way, so migration touches the query layer only.

**Trigger to migrate:** building out the Designers page with per-designer content, or guide-attachment mistakes becoming frequent.
