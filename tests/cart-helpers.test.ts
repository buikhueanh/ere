import { describe, it, expect } from 'vitest';
import {
  MAX_LINE_QUANTITY,
  clampQuantity,
  canIncrement,
  getLineVariantLabel,
  getLineTotal,
} from '@/lib/cart-helpers';
import type { CartLine } from '@/types/cart.types';

function makeLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: 'line-1',
    quantity: 2,
    merchandise: {
      id: 'variant-1',
      image: null,
      price: { amount: '50.00', currencyCode: 'USD' },
      selectedOptions: [
        { name: 'Size', value: 'M' },
        { name: 'Color', value: 'Black' },
      ],
      product: { handle: 'lani-skirt', title: 'Lani skirt', vendor: 'ERÉ' },
    },
    ...overrides,
  };
}

describe('clampQuantity', () => {
  it('clamps below 1 up to 1', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-3)).toBe(1);
  });

  it('clamps above MAX_LINE_QUANTITY down to the cap', () => {
    expect(clampQuantity(99)).toBe(MAX_LINE_QUANTITY);
  });

  it('passes through values within range', () => {
    expect(clampQuantity(3)).toBe(3);
  });
});

describe('canIncrement', () => {
  it('disallows incrementing at the cap', () => {
    expect(canIncrement(MAX_LINE_QUANTITY)).toBe(false);
    expect(canIncrement(MAX_LINE_QUANTITY - 1)).toBe(true);
  });
});

describe('getLineVariantLabel', () => {
  it('joins selected option values with a slash', () => {
    expect(getLineVariantLabel(makeLine())).toBe('M / Black');
  });

  it('returns empty string when there are no selected options', () => {
    const line = makeLine({ merchandise: { ...makeLine().merchandise, selectedOptions: [] } });
    expect(getLineVariantLabel(line)).toBe('');
  });
});

describe('getLineTotal', () => {
  it('multiplies unit price by quantity', () => {
    expect(getLineTotal(makeLine({ quantity: 3 }))).toBe(150);
  });

  it('handles quantity of 1', () => {
    expect(getLineTotal(makeLine({ quantity: 1 }))).toBe(50);
  });
});
