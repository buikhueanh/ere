import { NextRequest, NextResponse } from 'next/server';
import {
  generateCodeVerifier,
  codeChallengeFromVerifier,
  generateRandomState,
  safeReturnPath,
} from '@/lib/auth/pkce';
import { SESSION_COOKIE, LEGACY_SESSION_COOKIES } from '@/lib/auth/session';
import { buildAuthorizationUrl } from '@/lib/shopify/customerAccount';

// Guards against an infinite sign-in loop. If a session cookie exists but
// cannot be verified, /account redirects here, we mint a new one, and
// /account rejects it again — spinning until the browser gives up with
// ERR_TOO_MANY_REDIRECTS. Counting attempts turns that into one honest error.
const ATTEMPT_COOKIE = 'ere_auth_attempt';
const MAX_ATTEMPTS = 3;

// Single-purpose cookies holding the PKCE verifier and the CSRF `state`.
// They only need to survive the round trip to Shopify and back — but that
// round trip includes the customer waiting for a one-time code to arrive by
// email, finding it, and typing it in. 10 minutes was too tight for that and
// produced `missing_parameters` failures that looked like a broken flow.
// These are httpOnly + Secure and usable exactly once, so a longer window
// costs little.
const OAUTH_COOKIE_MAX_AGE = 60 * 30; // 30 minutes

export async function GET(request: NextRequest) {
  // Bail out rather than loop. Anything above this count means each new
  // session we issue is being rejected on the next request, so trying again
  // will not help — show the customer a real error instead of spinning.
  const attempts = Number(request.cookies.get(ATTEMPT_COOKIE)?.value ?? '0') + 1;
  if (attempts > MAX_ATTEMPTS) {
    console.error(
      `[auth/login] aborting after ${attempts - 1} attempts — issued sessions are not verifying on return`,
    );
    const errorResponse = NextResponse.redirect(
      new URL('/account/error?reason=loop_detected', request.nextUrl.origin),
    );
    errorResponse.cookies.delete(ATTEMPT_COOKIE);
    errorResponse.cookies.delete(SESSION_COOKIE);
    errorResponse.cookies.delete('ere_customer_token');
    return errorResponse;
  }

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
  response.cookies.set(ATTEMPT_COOKIE, String(attempts), cookieOptions);

  // Clear any existing session before starting a new one. A stale or
  // unverifiable session cookie (left over from a rotated SESSION_SECRET, an
  // older payload shape, or a half-finished login) is exactly what causes the
  // loop above — and since we're about to issue a fresh session anyway, there
  // is never a reason to keep the old one around.
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete('ere_customer_token');
  // Best-effort cleanup of pre-rename cookies. This only reaches ones on the
  // default path/domain — the rename above is what actually guarantees a
  // stale cookie can no longer shadow the live one.
  for (const legacy of LEGACY_SESSION_COOKIES) response.cookies.delete(legacy);

  return response;
}
