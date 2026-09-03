import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './session';

/** The logged-in customer's session, or null. Server components / actions only. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  const session = await verifySession(raw);

  // Temporary diagnostic for the post-login redirect loop: distinguishes
  // "cookie never arrived" from "cookie arrived but failed verification",
  // which have completely different causes. Logs no secret material — only
  // presence and length. Remove once the loop is resolved.
  if (!session) {
    console.warn(
      `[auth/session] no valid session (cookie present=${Boolean(raw)}, length=${raw?.length ?? 0}, ` +
        `secret configured=${Boolean(process.env.SESSION_SECRET)})`,
    );
  }

  return session;
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
