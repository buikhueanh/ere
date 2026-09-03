// PKCE (Proof Key for Code Exchange) helpers for the Shopify Customer
// Account API OAuth flow. Kept pure and dependency-free so they're unit
// testable and run identically in the Edge middleware and Node route
// handlers — hence Web Crypto (`crypto.subtle`) rather than `node:crypto`.

/**
 * base64url per RFC 4648 §5: standard base64 with `+`→`-`, `/`→`_`, and all
 * `=` padding stripped. Shopify's docs call this out explicitly — sending
 * padded or standard-base64 challenges is rejected at the token step with
 * `400 invalid_grant`, which is an opaque way to find out you got it wrong.
 */
export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** A high-entropy random string, 43–128 chars per RFC 7636. */
export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** S256 challenge: base64url(SHA-256(verifier)). */
export async function codeChallengeFromVerifier(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

/** Opaque random value for the OAuth `state` / `nonce` parameters. */
export function generateRandomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/**
 * Only same-origin, path-only redirects are allowed after login. Anything
 * else (absolute URL, protocol-relative `//evil.com`, or a non-path value)
 * falls back to the account page — otherwise `?returnTo=` is an open
 * redirect that can bounce a freshly-authenticated customer to an attacker's
 * page.
 */
export function safeReturnPath(returnTo: string | null | undefined, fallback = '/account'): string {
  if (!returnTo) return fallback;
  // Must start with exactly one slash, and contain no scheme or backslash.
  if (!returnTo.startsWith('/')) return fallback;
  if (returnTo.startsWith('//')) return fallback;
  if (returnTo.includes('\\')) return fallback;
  if (/^\/+\s*[a-zA-Z][a-zA-Z0-9+.-]*:/.test(returnTo)) return fallback;
  return returnTo;
}
