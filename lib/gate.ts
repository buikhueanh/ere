// Pure logic for the pre-launch gate, kept separate from middleware.ts so it's
// unit-testable without spinning up Next's Edge runtime.

export const GATE_PATH = '/coming-soon';
export const PREVIEW_COOKIE = 'ere_preview';

// Paths that must always be reachable regardless of launch status: the gate
// page itself, the Shopify webhook (Shopify must be able to hit it no matter
// what), the customer-account OAuth routes (Shopify redirects the browser
// back to /api/auth/callback from its own domain — if that redirect gets
// bounced to the gate, the authorization code is never exchanged and every
// login silently fails), and Next's own static/image internals.
const ALWAYS_ALLOWED = [
  GATE_PATH,
  '/api/webhooks',
  '/api/auth',
  '/_next',
  '/images',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOWED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isBypassed({
  cookieValue,
  queryParam,
  token,
}: {
  cookieValue: string | null | undefined;
  queryParam: string | null | undefined;
  token: string | undefined;
}): boolean {
  if (!token) return false;
  return cookieValue === token || queryParam === token;
}
