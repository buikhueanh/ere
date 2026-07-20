import type { ShopifyProductCard } from '@/types/shopify.types';

// A shop_placeholder metaobject entry, already scoped to one page
// (all-items/tops/bottoms/etc.) and normalized from Shopify's raw shape.
export interface ShopPlaceholder {
  id: string;
  imageUrl: string;
  imageAlt: string | null;
  position: number;
}

export type ShopCard =
  | { type: 'product'; product: ShopifyProductCard }
  | { type: 'placeholder'; placeholder: ShopPlaceholder };

const GROUP_SIZE = 3;

// Interleaves editorial placeholder images into a product sequence, one
// per full group of 3 products, alternating which side of the group the
// placeholder lands on: the 1st, 3rd, 5th... placeholder consumed is the
// last card in its group (product, product, product, placeholder); the
// 2nd, 4th, 6th... is the first card instead (placeholder, product,
// product, product). A placeholder only ever attaches to a *complete*
// group of 3 — a trailing partial group (1-2 leftover products) never
// gets a placeholder, and any placeholders left over past that point are
// simply unused for this render. Once placeholders run out, the rest of
// the sequence is plain products — no gap, no special-casing, because the
// "3-then-1" vs. "plain 4-wide" visual difference falls out entirely from
// whether a placeholder card is present at that point; the grid itself
// (grid-cols-4) doesn't know or care about grouping.
// See docs/decisions/011-shop-categories-placeholders.md §4.
export function interleavePlaceholders(
  products: ShopifyProductCard[],
  placeholders: ShopPlaceholder[],
): ShopCard[] {
  const sorted = [...placeholders].sort((a, b) => a.position - b.position);

  const cards: ShopCard[] = [];
  let productIndex = 0;
  let nextPlaceholderIndex = 0;

  while (productIndex < products.length) {
    const remaining = products.length - productIndex;
    const hasFullGroup = remaining >= GROUP_SIZE;
    const hasPlaceholder = nextPlaceholderIndex < sorted.length;
    // 1-based: the 1st placeholder consumed is "odd" (goes last), the 2nd
    // is "even" (goes first), and so on.
    const placeholderIsEven = (nextPlaceholderIndex + 1) % 2 === 0;
    const attachHere = hasFullGroup && hasPlaceholder;

    if (attachHere && placeholderIsEven) {
      cards.push({ type: 'placeholder', placeholder: sorted[nextPlaceholderIndex] });
      nextPlaceholderIndex++;
    }

    const groupSize = hasFullGroup ? GROUP_SIZE : remaining;
    for (let i = 0; i < groupSize; i++) {
      cards.push({ type: 'product', product: products[productIndex + i] });
    }
    productIndex += groupSize;

    if (attachHere && !placeholderIsEven) {
      cards.push({ type: 'placeholder', placeholder: sorted[nextPlaceholderIndex] });
      nextPlaceholderIndex++;
    }
  }

  return cards;
}
