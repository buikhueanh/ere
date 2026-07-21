import { describe, it, expect } from 'vitest';
import { normalizePlaceholder, type RawPlaceholderNode } from '@/lib/shopify/shop';

function makeNode(overrides: Partial<RawPlaceholderNode> = {}): RawPlaceholderNode {
  return {
    id: 'gid://shopify/Metaobject/1',
    image: { reference: { image: { url: 'https://cdn.shopify.com/ph.jpg', altText: 'Look' } } },
    position: { value: '2' },
    page: { value: 'tops' },
    ...overrides,
  };
}

describe('normalizePlaceholder', () => {
  it('extracts image, position (as a number), and page', () => {
    expect(normalizePlaceholder(makeNode())).toEqual({
      id: 'gid://shopify/Metaobject/1',
      imageUrl: 'https://cdn.shopify.com/ph.jpg',
      imageAlt: 'Look',
      position: 2,
      page: 'tops',
    });
  });

  it('drops an entry with no image', () => {
    expect(normalizePlaceholder(makeNode({ image: null }))).toBeNull();
    expect(normalizePlaceholder(makeNode({ image: { reference: null } }))).toBeNull();
  });

  it('drops an entry with no position', () => {
    expect(normalizePlaceholder(makeNode({ position: null }))).toBeNull();
    expect(normalizePlaceholder(makeNode({ position: { value: null } }))).toBeNull();
  });

  it('drops an entry with a non-numeric position', () => {
    expect(normalizePlaceholder(makeNode({ position: { value: 'not-a-number' } }))).toBeNull();
  });

  it('drops an entry with no page', () => {
    expect(normalizePlaceholder(makeNode({ page: null }))).toBeNull();
    expect(normalizePlaceholder(makeNode({ page: { value: null } }))).toBeNull();
  });

  it('tolerates a missing alt text', () => {
    const node = makeNode();
    node.image!.reference!.image!.altText = null;
    expect(normalizePlaceholder(node)?.imageAlt).toBeNull();
  });
});
