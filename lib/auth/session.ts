// App-level session cookie: an HMAC-signed payload, independent of the
// Shopify access token's lifetime. Middleware only needs to answer "is this
// person logged in", which must not cost a Shopify round-trip on every
// request — so that check reads this cookie alone.
//
// Web Crypto (not `node:crypto`) so the same code verifies in the Edge
// middleware and in Node route handlers.

import { base64UrlEncode } from './pkce';

export const SESSION_COOKIE = 'ere_session';

/** Everything the app needs about the logged-in customer without calling Shopify. */
export interface SessionPayload {
  /** Shopify customer GID — the join key for any future own-database rows. */
  customerId: string;
  /** Unix seconds. Checked on every verify; expired sessions are rejected. */
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set — refusing to sign or verify sessions with a default.',
    );
  }
  return secret;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(sig));
}

/** `<base64url(json)>.<hmac>` */
export async function signSession(payload: SessionPayload, secret = getSecret()): Promise<string> {
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body, secret)}`;
}

/**
 * Returns the payload, or null for anything untrusted: wrong shape, bad
 * signature, or expired. Never throws on malformed input — a tampered cookie
 * is an ordinary "logged out", not a 500.
 */
export async function verifySession(
  cookieValue: string | null | undefined,
  secret = getSecret(),
): Promise<SessionPayload | null> {
  if (!cookieValue) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  const expected = await hmac(body, secret);
  // Constant-time-ish compare: bail only after checking every byte, so the
  // loop's duration doesn't leak how much of the signature matched.
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(body.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
    );
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.customerId !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
