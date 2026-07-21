import { describe, it, expect } from 'vitest';
import { normalizeVendors } from '@/lib/shopify/vendors';
import type { ShopifyProductCard } from '@/types/shopify.types';

function makeProduct(vendor: string): ShopifyProductCard {
  return {
    id: vendor + Math.random(),
    handle: 'x',
    title: 'x',
    vendor,
    productType: '',
    tags: [],
    availableForSale: true,
    featuredImage: null,
    images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: '10.00', currencyCode: 'USD' } },
  };
}

describe('normalizeVendors', () => {
  it('dedupes repeated vendors', () => {
    const products = [makeProduct('repos'), makeProduct('repos'), makeProduct('ère')];
    expect(normalizeVendors(products)).toEqual(['ère', 'repos']);
  });

  it('sorts alphabetically', () => {
    const products = [makeProduct('Zeta'), makeProduct('Alpha'), makeProduct('Mid')];
    expect(normalizeVendors(products)).toEqual(['Alpha', 'Mid', 'Zeta']);
  });

  it('drops empty vendor strings', () => {
    const products = [makeProduct(''), makeProduct('ère')];
    expect(normalizeVendors(products)).toEqual(['ère']);
  });

  it('returns an empty list for no products', () => {
    expect(normalizeVendors([])).toEqual([]);
  });
});
