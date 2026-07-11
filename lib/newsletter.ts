// Pure helpers for the newsletter/waitlist signup — kept free of fetch calls
// so they're unit-testable.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

// The Storefront customerCreate mutation requires a password even though
// waitlist subscribers never log in. Generate a throwaway one — if a customer
// later wants an account, Shopify's password-reset flow covers it.
// Shopify caps passwords at 40 characters; 16 bytes → 32 hex chars.
export function generateThrowawayPassword(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Shopify returns TAKEN when the email already has a customer record. For a
// waitlist form that's not an error worth surfacing — they're on the list.
export function isAlreadySubscribedError(code: string | null | undefined): boolean {
  return code === 'TAKEN';
}
