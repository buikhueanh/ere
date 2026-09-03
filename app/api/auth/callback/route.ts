import { NextRequest, NextResponse } from 'next/server';
import { safeReturnPath } from '@/lib/auth/pkce';
import { SESSION_COOKIE, signSession } from '@/lib/auth/session';
import { exchangeCodeForToken, customerIdFromIdToken } from '@/lib/shopify/customerAccount';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Clears the one-shot OAuth cookies whichever way the request ends. */
function clearOAuthCookies(response: NextResponse) {
  for (const name of ['ere_oauth_verifier', 'ere_oauth_state', 'ere_oauth_return']) {
    response.cookies.delete(name);
  }
  return response;
}

function fail(request: NextRequest, reason: string) {
  const url = new URL('/account/error', request.nextUrl.origin);
  url.searchParams.set('reason', reason);
  return clearOAuthCookies(NextResponse.redirect(url));
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  // Shopify reports user-facing failures (e.g. the customer cancelled) here.
  if (searchParams.get('error')) {
    return fail(request, searchParams.get('error') ?? 'authorization_failed');
  }

  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');
  const verifier = request.cookies.get('ere_oauth_verifier')?.value;
  const expectedState = request.cookies.get('ere_oauth_state')?.value;
  const returnTo = safeReturnPath(request.cookies.get('ere_oauth_return')?.value);

  // Distinguish the three causes rather than collapsing them into one opaque
  // reason — they have completely different fixes. A missing verifier/state
  // means our own cookies didn't come back (almost always: the customer took
  // longer than OAUTH_COOKIE_MAX_AGE to finish, or landed here without going
  // through /api/auth/login first). A missing code means Shopify didn't send
  // one, which points at the authorization request instead.
  if (!verifier || !expectedState) {
    console.warn(
      `[auth/callback] oauth cookies absent (verifier=${Boolean(verifier)}, state=${Boolean(expectedState)}) — expired, or callback reached without starting at /api/auth/login`,
    );
    return fail(request, 'session_expired');
  }
  if (!code) return fail(request, 'missing_code');

  // CSRF check: the state we issued must match the one that came back.
  if (returnedState !== expectedState) {
    console.warn('[auth/callback] state mismatch — issued and returned state differ');
    return fail(request, 'state_mismatch');
  }

  try {
    const tokens = await exchangeCodeForToken({
      code,
      codeVerifier: verifier,
      redirectUri: new URL('/api/auth/callback', origin).toString(),
    });

    const customerId = tokens.id_token ? customerIdFromIdToken(tokens.id_token) : null;
    if (!customerId) {
      console.warn(
        `[auth/callback] no customer id (id_token present=${Boolean(tokens.id_token)})`,
      );
      return fail(request, 'no_customer_id');
    }

    const response = NextResponse.redirect(new URL(returnTo, origin));
    clearOAuthCookies(response);

    // Our own session is what middleware checks — deliberately decoupled from
    // the Shopify access token's much shorter lifetime.
    response.cookies.set(
      SESSION_COOKIE,
      await signSession({
        customerId,
        exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      },
    );

    // The Shopify access token is stored in its own httpOnly cookie rather
    // than inside the session payload, so it is never readable by client JS
    // and expires on Shopify's schedule, not ours.
    response.cookies.set('ere_customer_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in,
    });

    console.log(
      `[auth/callback] success: session issued for ${customerId}, redirecting to ${returnTo} ` +
        `(shopify token ${tokens.access_token.length} chars, expires_in ${tokens.expires_in}s)`,
    );

    return response;
  } catch (error) {
    console.error('[auth/callback] token exchange failed:', error);
    return fail(request, 'token_exchange_failed');
  }
}
