import { NextRequest, NextResponse } from 'next/server';
import {
  generateCodeVerifier,
  codeChallengeFromVerifier,
  generateRandomState,
  safeReturnPath,
} from '@/lib/auth/pkce';
import { buildAuthorizationUrl } from '@/lib/shopify/customerAccount';

// Single-purpose cookies holding the PKCE verifier and the CSRF `state`.
// They only need to survive the round trip to Shopify and back — but that
// round trip includes the customer waiting for a one-time code to arrive by
// email, finding it, and typing it in. 10 minutes was too tight for that and
// produced `missing_parameters` failures that looked like a broken flow.
// These are httpOnly + Secure and usable exactly once, so a longer window
// costs little.
const OAUTH_COOKIE_MAX_AGE = 60 * 30; // 30 minutes

export async function GET(request: NextRequest) {
  const verifier = generateCodeVerifier();
  const challenge = await codeChallengeFromVerifier(verifier);
  const state = generateRandomState();
  const nonce = generateRandomState();
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get('returnTo'));

  const redirectUri = new URL('/api/auth/callback', request.nextUrl.origin).toString();

  const response = NextResponse.redirect(
    buildAuthorizationUrl({ redirectUri, state, nonce, codeChallenge: challenge }),
  );

  // sameSite MUST be 'lax', not 'strict': the customer returns here via a
  // top-level cross-site redirect from Shopify's domain, and a 'strict'
  // cookie is not sent on that navigation — the verifier would be missing
  // and every single login would fail.
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: OAUTH_COOKIE_MAX_AGE,
  };

  response.cookies.set('ere_oauth_verifier', verifier, cookieOptions);
  response.cookies.set('ere_oauth_state', state, cookieOptions);
  response.cookies.set('ere_oauth_return', returnTo, cookieOptions);

  return response;
}
