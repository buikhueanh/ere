import type { SortOption } from '@/types/global.types';

export const sortOptions: SortOption[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

export const sizeOptions = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const colorOptions = [
  { label: 'Black', value: 'black', hex: '#000000' },
  { label: 'White', value: 'white', hex: '#FFFFFF' },
  { label: 'Ivory', value: 'ivory', hex: '#FFFFF0' },
  { label: 'Camel', value: 'camel', hex: '#C19A6B' },
  { label: 'Navy', value: 'navy', hex: '#001F5B' },
];
