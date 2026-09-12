import { describe, it, expect } from 'vitest';
import { normalizeVendors, groupProductsByVendor } from '@/lib/shopify/vendors';
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

describe('groupProductsByVendor', () => {
  it('groups alphabetically and keeps input (newest-first) order within a brand', () => {
    const p = ['repos', 'ère', 'repos', 'ère', 'atelier'].map(makeProduct);
    const groups = groupProductsByVendor(p);
    expect(groups.map((g) => g.vendor)).toEqual(['atelier', 'ère', 'repos']);
    expect(groups[2].products).toEqual([p[0], p[2]]);
  });

  it('caps each brand at perVendor products', () => {
    const p = Array.from({ length: 7 }, () => makeProduct('repos'));
    const [group] = groupProductsByVendor(p, 4);
    expect(group.products).toEqual(p.slice(0, 4));
  });

  it('skips products with no vendor', () => {
    expect(groupProductsByVendor([makeProduct(''), makeProduct('repos')])).toHaveLength(1);
  });
});
