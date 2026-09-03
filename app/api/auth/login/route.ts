import { NextRequest, NextResponse } from 'next/server';
import {
  generateCodeVerifier,
  codeChallengeFromVerifier,
  generateRandomState,
  safeReturnPath,
} from '@/lib/auth/pkce';
import { buildAuthorizationUrl } from '@/lib/shopify/customerAccount';

// Short-lived, single-purpose cookies holding the PKCE verifier and the CSRF
// `state`. They only need to survive the round trip to Shopify and back.
const OAUTH_COOKIE_MAX_AGE = 60 * 10; // 10 minutes

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
