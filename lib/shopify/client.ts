// NEXT_PUBLIC_ vars are inlined into the browser bundle so cart mutations can
// run client-side. The Storefront public token is designed to be exposed —
// it only grants the unauthenticated scopes configured in the Headless channel.
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? process.env.SHOPIFY_STORE_DOMAIN!;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? process.env.SHOPIFY_STOREFRONT_TOKEN!;

const endpoint = `https://${domain}/api/2024-01/graphql.json`;

const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': token,
};

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  revalidate?: number;
}): Promise<T> {
  // Next.js rejects requests that set both `cache` and `next.revalidate` —
  // when a revalidate window is given, it alone controls caching.
  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    ...(revalidate !== undefined ? { next: { revalidate } } : { cache }),
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
