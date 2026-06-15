# 008 — Breadcrumb & Collection Hierarchy

**Status:** Active
**Date:** 2026-06-12
**Files:** `config/collections.ts`, `components/product/Breadcrumb.tsx`

## Problem

Shopify has no native parent-child collections. A product can belong to both "Women" (broad) and "Skirts" (specific), returned as a flat array. To render `Women · Skirts` the frontend must know which is the parent.

## Decision (v1): ordered config array

`config/collections.ts` exports a top-level collection list in display order:

```ts
export const topLevelCollections = ['Women', 'Men', 'New In']
```

Breadcrumb logic:
1. From `product.collections.nodes`, find the one whose title matches an entry in `topLevelCollections` — this is the parent.
2. The remaining collection(s) become the child segment.
3. Result: `Women · Skirts`

If a product is only in one collection, show just that one. If no collection matches the top-level list, show the first collection returned.

## To add a new top-level category

Edit `config/collections.ts` — add one string to `topLevelCollections`. No other code changes needed.

## Later version

If the store grows to many categories with 3+ levels of hierarchy, consider Shopify Metaobjects to model a real category tree and query parent/child relationships directly.
