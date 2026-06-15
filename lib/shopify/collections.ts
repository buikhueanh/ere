import { shopifyFetch } from './client';
import { GET_COLLECTION_QUERY } from '@/lib/queries/collection.queries';
import type { ShopifyCollection } from '@/types/shopify.types';

export async function getCollection(handle: string, first = 24): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>({
    query: GET_COLLECTION_QUERY,
    variables: { handle, first },
    revalidate: 60,
  });
  return data.collection;
}
