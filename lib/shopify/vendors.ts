import { shopifyFetch } from './client';
import { SEARCH_PRODUCTS_QUERY } from '@/lib/queries/product.queries';
import { getProducts, PRODUCTS_TAG } from './products';
import type { ShopifyProductCard } from '@/types/shopify.types';

// Pure — dedupes + alphabetizes vendor names. Exported for unit testing
// without a live Shopify call. Sorted at render/fetch time, nothing stored
// (decision 011 §2) — a new vendor just appears correctly sorted on the
// next revalidation.
export function normalizeVendors(products: ShopifyProductCard[]): string[] {
  const unique = new Set(products.map((p) => p.vendor).filter((v) => v.length > 0));
  return [...unique].sort((a, b) => a.localeCompare(b));
}

export async function getVendors(): Promise<string[]> {
  const products = await getProducts(250);
  return normalizeVendors(products);
}

// Reuses the existing SEARCH_PRODUCTS_QUERY (Shopify's `vendor:'X'` search
// syntax) rather than a dedicated query — but with cached revalidation
// instead of search.ts's no-store, since this is a listing page, not
// live-as-you-type search.
export async function getProductsByVendor(vendor: string): Promise<ShopifyProductCard[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProductCard[] } }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { query: `vendor:'${vendor}'`, first: 96 },
    revalidate: 60,
    tags: [PRODUCTS_TAG],
  });
  return data.products.nodes;
}
