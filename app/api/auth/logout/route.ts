import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  // Clear our own session first so the customer is logged out locally even if
  // the redirect to Shopify's logout endpoint fails for any reason.
  const response = NextResponse.redirect(new URL('/', request.nextUrl.origin));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete('ere_customer_token');
  return response;
}

// Accept POST too — a logout link is a state change, so a form POST is the
// correct method and avoids CSRF-via-<img src="/api/auth/logout">.
export const POST = GET;
