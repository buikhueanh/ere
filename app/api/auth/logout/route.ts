import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, LEGACY_SESSION_COOKIES } from '@/lib/auth/session';
import { buildLogoutUrl } from '@/lib/shopify/customerAccount';

/** Every cookie the signed-in state is made of. */
const AUTH_COOKIES = [
  SESSION_COOKIE,
  'ere_customer_token',
  'ere_id_token',
  'ere_auth_attempt',
  ...LEGACY_SESSION_COOKIES,
];

export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl;
  const idToken = request.cookies.get('ere_id_token')?.value;

  // Ending the Shopify session too, not just ours. Without this, signing out
  // clears our cookies but leaves the customer authenticated with Shopify, so
  // the next sign-in silently re-authenticates them with no prompt — on a
  // shared device the account never actually closes.
  //
  // Degrades gracefully: with no id_token to present, fall back to a local
  // sign-out rather than sending Shopify a request it will reject.
  const destination = idToken
    ? buildLogoutUrl({ idToken, postLogoutRedirectUri: `${origin}/` })
    : `${origin}/`;

  // 303, not NextResponse.redirect()'s default 307: a 307 preserves the
  // method, so the sign-out form's POST would be replayed against the
  // destination — which returned 405 from the page at "/". 303 is the correct
  // Post/Redirect/Get status and switches the browser to GET.
  const response = NextResponse.redirect(destination, 303);

  // Clear local cookies regardless of which path we took, so the customer is
  // signed out here even if the hop to Shopify fails.
  for (const name of AUTH_COOKIES) response.cookies.delete(name);

  return response;
}

// A logout is a state change, so the sign-out control POSTs. Accepting GET as
// well keeps a plain link working, but the form uses POST so that a stray
// <img src="/api/auth/logout"> can't sign someone out.
export const POST = GET;
