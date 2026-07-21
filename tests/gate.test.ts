import { describe, it, expect } from 'vitest';
import { isAlwaysAllowed, isBypassed, GATE_PATH } from '@/lib/gate';

describe('isAlwaysAllowed', () => {
  it('allows the gate page itself', () => {
    expect(isAlwaysAllowed(GATE_PATH)).toBe(true);
  });

  it('allows the Shopify webhook route', () => {
    expect(isAlwaysAllowed('/api/webhooks/shopify')).toBe(true);
  });

  it('allows Next internals and static assets', () => {
    expect(isAlwaysAllowed('/_next/static/chunk.js')).toBe(true);
    expect(isAlwaysAllowed('/images/hero/homepage.png')).toBe(true);
    expect(isAlwaysAllowed('/favicon.ico')).toBe(true);
  });

  it('allows robots.txt and sitemap.xml regardless of launch status', () => {
    // Crawlers must be able to read these to know to stay away pre-launch.
    expect(isAlwaysAllowed('/robots.txt')).toBe(true);
    expect(isAlwaysAllowed('/sitemap.xml')).toBe(true);
  });

  it('does not allow ordinary site routes', () => {
    expect(isAlwaysAllowed('/shop')).toBe(false);
    expect(isAlwaysAllowed('/products/lani-skirt')).toBe(false);
    expect(isAlwaysAllowed('/')).toBe(false);
  });

  it('does not partial-match unrelated paths sharing a prefix', () => {
    expect(isAlwaysAllowed('/imagesomething')).toBe(false);
  });
});

describe('isBypassed', () => {
  const token = 'secret123';

  it('returns false when no token is configured', () => {
    expect(isBypassed({ cookieValue: 'secret123', queryParam: null, token: undefined })).toBe(false);
  });

  it('returns true when the cookie matches the token', () => {
    expect(isBypassed({ cookieValue: token, queryParam: null, token })).toBe(true);
  });

  it('returns true when the query param matches the token', () => {
    expect(isBypassed({ cookieValue: null, queryParam: token, token })).toBe(true);
  });

  it('returns false when neither matches', () => {
    expect(isBypassed({ cookieValue: 'wrong', queryParam: 'also-wrong', token })).toBe(false);
  });

  it('returns false when both are missing', () => {
    expect(isBypassed({ cookieValue: null, queryParam: null, token })).toBe(false);
  });
});
