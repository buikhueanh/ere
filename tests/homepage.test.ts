import { describe, it, expect } from 'vitest';
import { normalizeHomepageSettings, type RawHomepageNode } from '@/lib/shopify/homepage';

function makeNode(overrides: Partial<RawHomepageNode> = {}): RawHomepageNode {
  return {
    image: {
      reference: {
        image: { url: 'https://cdn.shopify.com/hero.jpg', altText: 'Summer hero' },
      },
    },
    seasonLabel: { value: 'summer/spring 2026 collection' },
    ...overrides,
  };
}

describe('normalizeHomepageSettings', () => {
  it('extracts image url, alt, and season label', () => {
    expect(normalizeHomepageSettings([makeNode()])).toEqual({
      imageUrl: 'https://cdn.shopify.com/hero.jpg',
      imageAlt: 'Summer hero',
      seasonLabel: 'summer/spring 2026 collection',
    });
  });

  it('returns null when no entries exist', () => {
    expect(normalizeHomepageSettings([])).toBeNull();
    expect(normalizeHomepageSettings(undefined)).toBeNull();
  });

  it('returns null when the image field is blank — fallback image stays', () => {
    expect(normalizeHomepageSettings([makeNode({ image: null })])).toBeNull();
    expect(normalizeHomepageSettings([makeNode({ image: { reference: null } })])).toBeNull();
  });

  it('tolerates a missing season label', () => {
    const result = normalizeHomepageSettings([makeNode({ seasonLabel: null })]);
    expect(result?.imageUrl).toBe('https://cdn.shopify.com/hero.jpg');
    expect(result?.seasonLabel).toBeNull();
  });

  it('null altText stays null rather than becoming undefined', () => {
    const node = makeNode();
    node.image!.reference!.image!.altText = null;
    expect(normalizeHomepageSettings([node])?.imageAlt).toBeNull();
  });
});
