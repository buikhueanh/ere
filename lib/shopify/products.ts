import { shopifyFetch } from './client';
import { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY } from '@/lib/queries/product.queries';
import type {
  ShopifyImage,
  ShopifyProduct,
  ShopifyProductCard,
  ShopifyProductMetafields,
} from '@/types/shopify.types';

// Raw metafield node as returned by the Storefront API — an array entry per
// requested identifier, null when the product has no value for it.
export interface RawMetafield {
  key: string;
  value: string;
  reference: { image: ShopifyImage } | null;
}

type RawProduct = Omit<ShopifyProduct, 'metafields'> & {
  metafields: Array<RawMetafield | null>;
};

export function normalizeMetafields(raw: Array<RawMetafield | null>): ShopifyProductMetafields {
  const byKey = new Map(raw.filter((m): m is RawMetafield => m !== null).map((m) => [m.key, m]));
  return {
    fabric: byKey.get('fabric')?.value ?? null,
    origin: byKey.get('origin')?.value ?? null,
    careInstructions: byKey.get('care_instructions')?.value ?? null,
    fitNotes: byKey.get('fit_notes')?.value ?? null,
    measurements: byKey.get('measurements')?.value ?? null,
    sizeGuide: byKey.get('size_guide')?.reference?.image ?? null,
  };
}

// Shared cache tag for all product reads. A Shopify product webhook calls
// revalidateTag(PRODUCTS_TAG) to bust these instantly; the 60s revalidate
// stays as a fallback in case a webhook is ever missed.
export const PRODUCTS_TAG = 'products';

export async function getProducts(first = 24): Promise<ShopifyProductCard[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProductCard[] } }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first },
    revalidate: 60,
    tags: [PRODUCTS_TAG],
  });
  return data.products.nodes;
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ productByHandle: RawProduct | null }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: 60,
    tags: [PRODUCTS_TAG],
  });
  if (!data.productByHandle) return null;
  const { metafields, ...product } = data.productByHandle;
  return { ...product, metafields: normalizeMetafields(metafields) };
}
