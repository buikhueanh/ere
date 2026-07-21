import type { ShopPageKey } from '@/lib/shopify/shop';

// The 5 real categories (decision 011 §1) — "all items" isn't here, it's
// just the unfiltered /shop. Shared by the /shop/[collection] route
// (validates the URL segment) and the nav "shop" hover-dropdown.
export interface ShopCategory {
  key: Exclude<ShopPageKey, 'all-items'>;
  label: string;
}

export const shopCategories: ShopCategory[] = [
  { key: 'tops', label: 'tops' },
  { key: 'bottoms', label: 'bottoms' },
  { key: 'accessories', label: 'accessories' },
  { key: 'homeware', label: 'homeware' },
  { key: 'self-care', label: 'self-care' },
];
