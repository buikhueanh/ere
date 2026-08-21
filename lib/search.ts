import Fuse from 'fuse.js';
import type { ShopifyProductCard } from '@/types/shopify.types';

// Typo-tolerant, ranked matching over title/vendor/type/tags — Shopify's
// own `products(query:)` search only does exact-ish substring/keyword
// matching, so a plain search box would return nothing for "jaket" or
// partial words. threshold 0.4 is Fuse's own "fairly loose" recommendation;
// ignoreLocation means a match counts regardless of where in the string it
// falls (titles vary a lot in length/word order).
const FUSE_OPTIONS = {
  keys: ['title', 'vendor', 'productType', 'tags'],
  threshold: 0.8,
  ignoreLocation: true,
};

export function fuzzySearchProducts(
  products: ShopifyProductCard[],
  query: string
): ShopifyProductCard[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const fuse = new Fuse(products, FUSE_OPTIONS);
  return fuse.search(trimmed).map((result) => result.item);
}
