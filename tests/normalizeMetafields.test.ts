import { describe, it, expect } from 'vitest';
import { normalizeMetafields, type RawMetafield } from '@/lib/shopify/products';

const textField = (key: string, value: string): RawMetafield => ({
  key,
  value,
  reference: null,
});

describe('normalizeMetafields', () => {
  it('maps every Shopify key to its camelCase field', () => {
    const result = normalizeMetafields([
      textField('fabric', 'Crepe Silk — 18% Cupro, 38% Tencel, 44% Nylon'),
      textField('origin', 'Made in Italy'),
      textField('care_instructions', 'Hand wash with cool water'),
      textField('fit_notes', 'Model is 5\'9", wearing size S'),
      textField('measurements', 'S: Waist 67cm · Hip 98cm · Length 84cm'),
    ]);

    expect(result.fabric).toBe('Crepe Silk — 18% Cupro, 38% Tencel, 44% Nylon');
    expect(result.origin).toBe('Made in Italy');
    expect(result.careInstructions).toBe('Hand wash with cool water');
    expect(result.fitNotes).toBe('Model is 5\'9", wearing size S');
    expect(result.measurements).toBe('S: Waist 67cm · Hip 98cm · Length 84cm');
  });

  it('returns null for every field when the product has no metafields', () => {
    // Shopify returns one array entry per requested identifier — null when unset
    const result = normalizeMetafields([null, null, null, null, null, null]);

    expect(result).toEqual({
      fabric: null,
      origin: null,
      careInstructions: null,
      fitNotes: null,
      measurements: null,
      sizeGuide: null,
    });
  });

  it('extracts the image from a file metafield reference', () => {
    const result = normalizeMetafields([
      {
        key: 'size_guide',
        value: 'gid://shopify/MediaImage/123',
        reference: { image: { url: 'https://cdn.shopify.com/guide.png', altText: 'Size guide' } },
      },
    ]);

    expect(result.sizeGuide).toEqual({
      url: 'https://cdn.shopify.com/guide.png',
      altText: 'Size guide',
    });
  });

  it('returns null sizeGuide when the file reference is missing', () => {
    // A file metafield can have a value (the gid) but a deleted/unresolvable file
    const result = normalizeMetafields([
      { key: 'size_guide', value: 'gid://shopify/MediaImage/123', reference: null },
    ]);

    expect(result.sizeGuide).toBeNull();
  });

  it('ignores unknown metafield keys', () => {
    const result = normalizeMetafields([textField('unrelated_key', 'whatever')]);

    expect(result.fabric).toBeNull();
    expect(result.sizeGuide).toBeNull();
  });

  it('handles a mix of set and unset fields', () => {
    const result = normalizeMetafields([
      textField('fabric', 'Crepe Silk'),
      null,
      null,
      textField('measurements', 'S: Waist 67cm'),
      null,
      null,
    ]);

    expect(result.fabric).toBe('Crepe Silk');
    expect(result.measurements).toBe('S: Waist 67cm');
    expect(result.origin).toBeNull();
    expect(result.careInstructions).toBeNull();
  });
});
