import { describe, it, expect } from 'vitest';
import { paginate } from '@/lib/pagination';

const items = Array.from({ length: 42 }, (_, i) => i + 1);

describe('paginate', () => {
  it('slices the requested page', () => {
    const result = paginate(items, 1, 16);
    expect(result.items).toEqual(items.slice(0, 16));
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3); // 42 / 16 -> 3 pages
  });

  it('slices a middle page correctly', () => {
    const result = paginate(items, 2, 16);
    expect(result.items).toEqual(items.slice(16, 32));
    expect(result.currentPage).toBe(2);
  });

  it('last page has the remainder, not a full page', () => {
    const result = paginate(items, 3, 16);
    expect(result.items).toEqual(items.slice(32, 42));
    expect(result.items.length).toBe(10);
  });

  it('clamps a page number above the last page down to the last page', () => {
    const result = paginate(items, 99, 16);
    expect(result.currentPage).toBe(3);
    expect(result.items).toEqual(items.slice(32, 42));
  });

  it('clamps a page number below 1 up to 1', () => {
    const result = paginate(items, 0, 16);
    expect(result.currentPage).toBe(1);
    expect(result.items).toEqual(items.slice(0, 16));
  });

  it('clamps a non-numeric/NaN page to 1', () => {
    const result = paginate(items, Number.NaN, 16);
    expect(result.currentPage).toBe(1);
  });

  it('empty items still returns page 1 of 1, not 0', () => {
    const result = paginate([], 1, 16);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.items).toEqual([]);
  });

  it('exact multiple of pageSize does not create a trailing empty page', () => {
    const exact = Array.from({ length: 32 }, (_, i) => i);
    const result = paginate(exact, 1, 16);
    expect(result.totalPages).toBe(2);
  });
});
