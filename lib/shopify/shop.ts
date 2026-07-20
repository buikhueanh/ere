import { shopifyFetch } from './client';
import { getProducts, PRODUCTS_TAG } from './products';
import { GET_COLLECTION_QUERY } from '@/lib/queries/collection.queries';
import { GET_SHOP_PLACEHOLDERS_QUERY } from '@/lib/queries/shop-placeholder.queries';
import { interleavePlaceholders, type ShopCard, type ShopPlaceholder } from '@/lib/shop-interleave';
import type { ShopifyProductCard } from '@/types/shopify.types';

// The 6 valid `page` values on a shop_placeholder entry (decision 011 §4) —
// matches the choices validation set on the metaobject definition in Shopify.
export type ShopPageKey = 'all-items' | 'tops' | 'bottoms' | 'accessories' | 'homeware' | 'self-care';

export const SHOP_PLACEHOLDERS_TAG = 'shop-placeholders';

// Raw shape of one shop_placeholder metaobject node as the Storefront API
// returns it — every field is nullable (definition missing, entry
// incomplete, or field left blank in Admin).
export interface RawPlaceholderNode {
  id: string;
  image: { reference: { image: { url: string; altText: string | null } | null } | null } | null;
  position: { value: string | null } | null;
  page: { value: string | null } | null;
}

// Drops any entry missing an image, position, or page — an incomplete
// Admin entry shouldn't crash the page or silently occupy a slot with
// nothing to show.
export function normalizePlaceholder(node: RawPlaceholderNode): (ShopPlaceholder & { page: string }) | null {
  const imageUrl = node.image?.reference?.image?.url;
  const positionRaw = node.position?.value;
  const page = node.page?.value;
  if (!imageUrl || !positionRaw || !page) return null;

  const position = Number(positionRaw);
  if (!Number.isFinite(position)) return null;

  return {
    id: node.id,
    imageUrl,
    imageAlt: node.image?.reference?.image?.altText ?? null,
    position,
    page,
  };
}

async function getPlaceholdersForPage(page: ShopPageKey): Promise<ShopPlaceholder[]> {
  try {
    const data = await shopifyFetch<{ metaobjects: { nodes: RawPlaceholderNode[] } }>({
      query: GET_SHOP_PLACEHOLDERS_QUERY,
      variables: { first: 100 },
      revalidate: 60,
      tags: [SHOP_PLACEHOLDERS_TAG],
    });
    return data.metaobjects.nodes
      .map(normalizePlaceholder)
      .filter((p): p is ShopPlaceholder & { page: string } => p !== null && p.page === page);
  } catch {
    // Metaobject type not set up yet, or Storefront access off — the page
    // still renders as a plain product grid rather than erroring.
    return [];
  }
}

async function getProductsForPage(page: ShopPageKey): Promise<ShopifyProductCard[]> {
  if (page === 'all-items') {
    return getProducts(96);
  }
  const data = await shopifyFetch<{ collection: { products: { nodes: ShopifyProductCard[] } } | null }>({
    query: GET_COLLECTION_QUERY,
    variables: { handle: page, first: 96 },
    revalidate: 60,
    tags: [PRODUCTS_TAG],
  });
  return data.collection?.products.nodes ?? [];
}

// Combines a page's products with its placeholders into one interleaved
// card sequence, ready for pagination (lib/pagination.ts cuts it into
// 16-card pages). See docs/decisions/011-shop-categories-placeholders.md.
export async function getShopPageCards(page: ShopPageKey): Promise<ShopCard[]> {
  const [products, placeholders] = await Promise.all([
    getProductsForPage(page),
    getPlaceholdersForPage(page),
  ]);
  return interleavePlaceholders(products, placeholders);
}
