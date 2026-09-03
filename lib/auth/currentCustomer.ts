import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './session';

/** The logged-in customer's session, or null. Server components / actions only. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * The Shopify customer access token for the current request, or null when
 * it has expired (Shopify's expiry is shorter than our session's, so a
 * customer can be "logged in" locally with no usable Shopify token — callers
 * must handle null by prompting a re-login rather than assuming it's there).
 */
export async function getCustomerAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get('ere_customer_token')?.value ?? null;
}
