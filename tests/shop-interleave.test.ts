import { describe, it, expect } from 'vitest';
import { interleavePlaceholders, type ShopPlaceholder } from '@/lib/shop-interleave';
import type { ShopifyProductCard } from '@/types/shopify.types';

function makeProduct(id: string): ShopifyProductCard {
  return {
    id,
    handle: id,
    title: id,
    vendor: 'ERÉ',
    productType: '',
    tags: [],
    availableForSale: true,
    featuredImage: null,
    images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: '50.00', currencyCode: 'USD' } },
  };
}

function makePlaceholder(id: string, position: number): ShopPlaceholder {
  return { id, imageUrl: `https://cdn.shopify.com/${id}.jpg`, imageAlt: null, position };
}

function products(n: number): ShopifyProductCard[] {
  return Array.from({ length: n }, (_, i) => makeProduct(`p${i + 1}`));
}

describe('interleavePlaceholders', () => {
  it('inserts nothing when fewer than 3 products, even with placeholders available', () => {
    const cards = interleavePlaceholders(products(2), [makePlaceholder('ph1', 1)]);
    expect(cards).toEqual([
      { type: 'product', product: products(2)[0] },
      { type: 'product', product: products(2)[1] },
    ]);
  });

  it('the 1st placeholder (odd) is the last card in its group of 3', () => {
    const ph = makePlaceholder('ph1', 1);
    const cards = interleavePlaceholders(products(3), [ph]);
    expect(cards.map((c) => c.type)).toEqual(['product', 'product', 'product', 'placeholder']);
    expect(cards[3]).toEqual({ type: 'placeholder', placeholder: ph });
  });

  it('the 2nd placeholder (even) is the first card in its group of 3', () => {
    // Give it a single placeholder at "slot 2" by pre-consuming slot 1 via
    // a first group with no placeholder assigned (simulated by two calls
    // isn't meaningful here — instead verify directly via the multi-group
    // test below, which exercises both odd and even in one sequence).
    const ph1 = makePlaceholder('ph1', 1);
    const ph2 = makePlaceholder('ph2', 2);
    const cards = interleavePlaceholders(products(6), [ph1, ph2]);
    // Group 1 (odd, ph1): product, product, product, placeholder
    // Group 2 (even, ph2): placeholder, product, product, product
    expect(cards.map((c) => c.type)).toEqual([
      'product', 'product', 'product', 'placeholder',
      'placeholder', 'product', 'product', 'product',
    ]);
    expect(cards[3]).toEqual({ type: 'placeholder', placeholder: ph1 });
    expect(cards[4]).toEqual({ type: 'placeholder', placeholder: ph2 });
  });

  it('alternates odd/even across three groups (odd, even, odd)', () => {
    const ph1 = makePlaceholder('ph1', 1);
    const ph2 = makePlaceholder('ph2', 2);
    const ph3 = makePlaceholder('ph3', 3);
    const cards = interleavePlaceholders(products(9), [ph1, ph2, ph3]);
    expect(cards.map((c) => c.type)).toEqual([
      'product', 'product', 'product', 'placeholder', // group 1: ph1 last
      'placeholder', 'product', 'product', 'product', // group 2: ph2 first
      'product', 'product', 'product', 'placeholder', // group 3: ph3 last
    ]);
  });

  it('falls back to plain products once placeholders are exhausted — no gap', () => {
    const ph1 = makePlaceholder('ph1', 1);
    const cards = interleavePlaceholders(products(9), [ph1]);
    expect(cards.map((c) => c.type)).toEqual([
      'product', 'product', 'product', 'placeholder',
      'product', 'product', 'product',
      'product', 'product', 'product',
    ]);
    // total cards = 9 products + 1 placeholder, nothing dropped or duplicated
    expect(cards.filter((c) => c.type === 'product')).toHaveLength(9);
  });

  it('never attaches a placeholder to a trailing partial group, odd or even', () => {
    // 7 products = 2 full groups + 1 leftover. 2 placeholders supplied;
    // both get used (one odd/last, one even/first) since there are exactly
    // 2 full groups — the leftover single product gets no placeholder.
    const ph1 = makePlaceholder('ph1', 1);
    const ph2 = makePlaceholder('ph2', 2);
    const cards = interleavePlaceholders(products(7), [ph1, ph2]);
    expect(cards.map((c) => c.type)).toEqual([
      'product', 'product', 'product', 'placeholder',
      'placeholder', 'product', 'product', 'product',
      'product',
    ]);
  });

  it('consumes placeholders in position order regardless of input order', () => {
    const ph2 = makePlaceholder('ph2', 2);
    const ph1 = makePlaceholder('ph1', 1);
    const cards = interleavePlaceholders(products(6), [ph2, ph1]);
    const placeholderCards = cards.filter((c) => c.type === 'placeholder');
    // ph1 (position 1) is consumed first (odd/last), ph2 (position 2) second (even/first)
    expect(placeholderCards[0]).toEqual({ type: 'placeholder', placeholder: ph1 });
    expect(placeholderCards[1]).toEqual({ type: 'placeholder', placeholder: ph2 });
  });

  it('returns a pure product sequence when there are no placeholders', () => {
    const cards = interleavePlaceholders(products(5), []);
    expect(cards.every((c) => c.type === 'product')).toBe(true);
    expect(cards).toHaveLength(5);
  });

  it('returns an empty sequence for no products, regardless of placeholders', () => {
    const cards = interleavePlaceholders([], [makePlaceholder('ph1', 1)]);
    expect(cards).toEqual([]);
  });

  it('never inserts more placeholders than were supplied', () => {
    const ph1 = makePlaceholder('ph1', 1);
    const cards = interleavePlaceholders(products(30), [ph1]);
    expect(cards.filter((c) => c.type === 'placeholder')).toHaveLength(1);
  });
});
