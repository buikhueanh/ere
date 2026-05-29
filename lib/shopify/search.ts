import { shopifyFetch } from './client';
import { SEARCH_PRODUCTS_QUERY } from '@/lib/queries/product.queries';
import type { ShopifyProduct } from '@/types/shopify.types';

export async function searchProducts(query: string, first = 24): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { query, first },
    cache: 'no-store',
  });
  return data.products.nodes;
}
