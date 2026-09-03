// Shopify Customer Account API — OAuth 2.0 + PKCE client.
//
// Separate from lib/shopify/client.ts on purpose: that one talks to the
// Storefront API with a shop-wide token, this one talks to the Customer
// Account API with a per-customer bearer token. Different endpoint,
// different auth model, different lifetime.
//
// Endpoints are derived from the shop ID rather than hardcoded. They match
// what the shop's own OpenID discovery document reports at
// https://shopify.com/authentication/<shopId>/.well-known/openid-configuration

const SHOP_ID = process.env.SHOPIFY_SHOP_ID;
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
// Only set for confidential clients. Public clients (the usual headless
// storefront case) authenticate with PKCE alone and leave this unset.
const CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;

/** Throws with an actionable message rather than producing a broken URL. */
function requireConfig(): { shopId: string; clientId: string } {
  if (!SHOP_ID || !CLIENT_ID) {
    throw new Error(
      'Customer Account API is not configured. Set SHOPIFY_SHOP_ID and ' +
        'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID (Shopify Admin → Headless channel → ' +
        'your storefront → Customer Account API).',
    );
  }
  return { shopId: SHOP_ID, clientId: CLIENT_ID };
}

export function authEndpoints() {
  const { shopId } = requireConfig();
  const base = `https://shopify.com/authentication/${shopId}`;
  return {
    authorization: `${base}/oauth/authorize`,
    token: `${base}/oauth/token`,
    logout: `${base}/logout`,
  };
}

/** The GraphQL endpoint for customer-scoped queries. */
export function customerApiEndpoint(version = '2025-10'): string {
  const { shopId } = requireConfig();
  return `https://shopify.com/${shopId}/account/customer/api/${version}/graphql`;
}

export function buildAuthorizationUrl({
  redirectUri,
  state,
  nonce,
  codeChallenge,
}: {
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const { clientId } = requireConfig();
  const url = new URL(authEndpoints().authorization);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  // `customer-account-api:full` is what grants access to the customer's own
  // orders/profile; openid+email are needed for the id_token.
  url.searchParams.set('scope', 'openid email customer-account-api:full');
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
}

export async function exchangeCodeForToken({
  code,
  codeVerifier,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const { clientId } = requireConfig();

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  // Confidential clients must authenticate; public ones must not send this.
  if (CLIENT_SECRET) {
    headers.Authorization = `Basic ${btoa(`${clientId}:${CLIENT_SECRET}`)}`;
  }

  const res = await fetch(authEndpoints().token, { method: 'POST', headers, body });

  if (!res.ok) {
    const detail = await res.text();
    // `invalid_grant` here almost always means the code_challenge was encoded
    // as standard base64 rather than base64url — see lib/auth/pkce.ts.
    throw new Error(`Token exchange failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  return (await res.json()) as TokenResponse;
}

/**
 * The customer's own ID, read from the token's `sub` claim.
 *
 * NOTE: this decodes without verifying the signature. That is acceptable
 * only because the token came directly from Shopify's token endpoint over
 * TLS in the call above — it is never read from user input. If an id_token
 * ever arrives from anywhere else, verify it against the shop's JWKS first.
 */
export function customerIdFromIdToken(idToken: string): string | null {
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    // Shopify sends `sub` as a JSON *number*, not a string. Typing it as
    // `string` and casting was a compile-time lie — the value stayed numeric
    // at runtime, got serialised into the session unquoted, and was then
    // rejected by verifySession's `typeof !== 'string'` guard. The session
    // was valid and correctly signed; our own validation threw it away, which
    // presented as an infinite sign-in redirect loop.
    const claims = JSON.parse(json) as { sub?: string | number };
    return claims.sub != null ? String(claims.sub) : null;
  } catch {
    return null;
  }
}

/** Customer-scoped GraphQL call. `accessToken` is per-customer, never shop-wide. */
export async function customerAccountFetch<T>({
  query,
  variables,
  accessToken,
}: {
  query: string;
  variables?: Record<string, unknown>;
  accessToken: string;
}): Promise<T> {
  const res = await fetch(customerApiEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Customer Account API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data as T;
}
