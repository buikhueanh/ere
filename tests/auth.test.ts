import { describe, it, expect } from 'vitest';
import {
  base64UrlEncode,
  generateCodeVerifier,
  codeChallengeFromVerifier,
  generateRandomState,
  safeReturnPath,
} from '@/lib/auth/pkce';
import { signSession, verifySession } from '@/lib/auth/session';

const SECRET = 'test-secret-not-a-real-one';

describe('base64UrlEncode', () => {
  it('produces URL-safe output with no padding', () => {
    // 0xFB 0xFF encodes to "+/8=" in standard base64 — exercises all three
    // substitutions Shopify's token endpoint rejects if left unmade.
    const encoded = base64UrlEncode(new Uint8Array([0xfb, 0xff]));
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });
});

describe('PKCE', () => {
  it('generates verifiers within the RFC 7636 length bounds', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
  });

  it('generates a different verifier each time', () => {
    expect(generateCodeVerifier()).not.toBe(generateCodeVerifier());
    expect(generateRandomState()).not.toBe(generateRandomState());
  });

  it('derives a stable S256 challenge from a verifier', async () => {
    const a = await codeChallengeFromVerifier('abc123');
    const b = await codeChallengeFromVerifier('abc123');
    expect(a).toBe(b);
    expect(a).not.toBe(await codeChallengeFromVerifier('abc124'));
  });

  it('produces a URL-safe challenge', async () => {
    const challenge = await codeChallengeFromVerifier(generateCodeVerifier());
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('safeReturnPath', () => {
  it('allows ordinary same-origin paths', () => {
    expect(safeReturnPath('/account/orders')).toBe('/account/orders');
    expect(safeReturnPath('/shop?page=2')).toBe('/shop?page=2');
  });

  it('falls back when absent', () => {
    expect(safeReturnPath(null)).toBe('/account');
    expect(safeReturnPath(undefined)).toBe('/account');
    expect(safeReturnPath('')).toBe('/account');
  });

  it('rejects open-redirect attempts', () => {
    expect(safeReturnPath('https://evil.com')).toBe('/account');
    expect(safeReturnPath('//evil.com')).toBe('/account');
    expect(safeReturnPath('/\\evil.com')).toBe('/account');
    expect(safeReturnPath('javascript:alert(1)')).toBe('/account');
    expect(safeReturnPath('/javascript:alert(1)')).toBe('/account');
  });
});

describe('session cookie', () => {
  const future = () => Math.floor(Date.now() / 1000) + 3600;

  it('round-trips a valid session', async () => {
    const payload = { customerId: 'gid://shopify/Customer/1', exp: future() };
    const verified = await verifySession(await signSession(payload, SECRET), SECRET);
    expect(verified).toEqual(payload);
  });

  it('rejects a tampered payload', async () => {
    const signed = await signSession({ customerId: 'gid://shopify/Customer/1', exp: future() }, SECRET);
    const [, signature] = signed.split('.');
    const forged = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify({ customerId: 'gid://shopify/Customer/999', exp: future() })),
    );
    expect(await verifySession(`${forged}.${signature}`, SECRET)).toBeNull();
  });

  it('rejects a session signed with a different secret', async () => {
    const signed = await signSession({ customerId: 'gid://shopify/Customer/1', exp: future() }, 'other');
    expect(await verifySession(signed, SECRET)).toBeNull();
  });

  it('rejects an expired session', async () => {
    const signed = await signSession(
      { customerId: 'gid://shopify/Customer/1', exp: Math.floor(Date.now() / 1000) - 1 },
      SECRET,
    );
    expect(await verifySession(signed, SECRET)).toBeNull();
  });

  it('treats malformed cookies as logged out rather than throwing', async () => {
    for (const bad of [null, undefined, '', 'nodot', 'a.b.c', 'not-base64.sig']) {
      expect(await verifySession(bad, SECRET)).toBeNull();
    }
  });
});
