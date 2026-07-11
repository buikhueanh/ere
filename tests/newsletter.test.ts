import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  generateThrowawayPassword,
  isAlreadySubscribedError,
} from '@/lib/newsletter';

describe('isValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isValidEmail('customer@example.com')).toBe(true);
    expect(isValidEmail('first.last+tag@sub.domain.co')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEmail('  customer@example.com  ')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing@tld')).toBe(false);
    expect(isValidEmail('@nouser.com')).toBe(false);
    expect(isValidEmail('two words@example.com')).toBe(false);
  });
});

describe('generateThrowawayPassword', () => {
  it('is strong, unique per call, and within Shopify limits', () => {
    const a = generateThrowawayPassword();
    const b = generateThrowawayPassword();
    expect(a.length).toBeGreaterThanOrEqual(24);
    // Shopify rejects passwords over 40 characters — caught in live testing.
    expect(a.length).toBeLessThanOrEqual(40);
    expect(a).not.toBe(b);
  });
});

describe('isAlreadySubscribedError', () => {
  it('treats TAKEN as already subscribed', () => {
    expect(isAlreadySubscribedError('TAKEN')).toBe(true);
  });

  it('does not treat other codes or missing codes as subscribed', () => {
    expect(isAlreadySubscribedError('INVALID')).toBe(false);
    expect(isAlreadySubscribedError(null)).toBe(false);
    expect(isAlreadySubscribedError(undefined)).toBe(false);
  });
});
