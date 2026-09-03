// NEXT_PUBLIC_ vars are inlined into the browser bundle so cart mutations can
// run client-side. The Storefront *public* token is designed to be exposed —
// but only as far as the scopes attached to it, so it must be limited to
// read/checkout scopes. Anything that writes customer data uses the separate
// *private* token below, which must never reach the browser.
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? process.env.SHOPIFY_STORE_DOMAIN!;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? process.env.SHOPIFY_STOREFRONT_TOKEN!;

// Server-only: deliberately NOT prefixed NEXT_PUBLIC_, so it is `undefined`
// in the browser. A client-side caller passing `privileged: true` therefore
// fails loudly rather than silently leaking anything.
// Provided by the Headless channel alongside the public token.
//
// CAVEAT (2026-08-08): this was added to hold the customer-write scope while
// the public token dropped it. That turned out not to be possible — the
// Headless channel has ONE permission list shared by every storefront and by
// both token types, so the private token cannot hold a scope the public one
// lacks. Using it here is therefore currently no more privileged than the
// public token; it is kept because the plumbing is correct and is what a
// custom-app or Admin-API split would reuse. See docs/decisions/012.
const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;

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
  tags,
  privileged = false,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  /**
   * Route this call through the server-only private token, which carries the
   * write-customer scope the public token must not have. Server-side callers
   * only — see `lib/shopify/customer.ts`.
   *
   * Until SHOPIFY_STOREFRONT_PRIVATE_TOKEN is set in the environment this
   * falls back to the public token, i.e. today's behaviour, so nothing
   * breaks before the Shopify Admin side is configured. The fallback is what
   * still leaves the scope exposed — see docs/decisions/012 §3.
   */
  privileged?: boolean;
}): Promise<T> {
  const requestHeaders = privileged && privateToken
    ? {
        'Content-Type': 'application/json',
        // Private tokens use their own header, NOT X-Shopify-Storefront-Access-Token.
        'Shopify-Storefront-Private-Token': privateToken,
      }
    : headers;

  // Next.js rejects requests that set both `cache` and `next.revalidate` —
  // when a revalidate window is given, it alone controls caching.
  // `tags` let a webhook bust this cache on demand via revalidateTag().
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({ query, variables }),
    ...(revalidate !== undefined ? { next: { revalidate, tags } } : { cache }),
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
