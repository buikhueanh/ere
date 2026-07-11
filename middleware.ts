import { NextRequest, NextResponse } from 'next/server';
import { GATE_PATH, PREVIEW_COOKIE, isAlwaysAllowed, isBypassed } from '@/lib/gate';

const LAUNCHED = process.env.LAUNCHED === 'true';
const PREVIEW_TOKEN = process.env.PREVIEW_BYPASS_TOKEN;
const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function middleware(request: NextRequest) {
  if (LAUNCHED) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;

  if (isAlwaysAllowed(pathname)) return NextResponse.next();

  const cookieValue = request.cookies.get(PREVIEW_COOKIE)?.value;
  const queryParam = searchParams.get('preview');
  const bypassed = isBypassed({ cookieValue, queryParam, token: PREVIEW_TOKEN });

  if (bypassed) {
    const response = NextResponse.next();
    // Only (re)write the cookie when it came from the query param — no need
    // to re-set it on every request once it's already there.
    if (queryParam === PREVIEW_TOKEN && cookieValue !== PREVIEW_TOKEN) {
      response.cookies.set(PREVIEW_COOKIE, PREVIEW_TOKEN!, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: PREVIEW_COOKIE_MAX_AGE,
      });
    }
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = GATE_PATH;
  url.search = '';
  const response = NextResponse.redirect(url);
  // Belt-and-suspenders alongside robots.ts: gated pages should never be indexed.
  response.headers.set('X-Robots-Tag', 'noindex');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
