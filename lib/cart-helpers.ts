import type { CartLine } from '@/types/cart.types';

export const MAX_LINE_QUANTITY = 5;

export function clampQuantity(quantity: number): number {
  return Math.min(Math.max(quantity, 1), MAX_LINE_QUANTITY);
}

export function canIncrement(quantity: number): boolean {
  return quantity < MAX_LINE_QUANTITY;
}

export function getLineVariantLabel(line: CartLine): string {
  return line.merchandise.selectedOptions.map((o) => o.value).join(' / ');
}

export function getLineTotal(line: CartLine): number {
  return Number(line.merchandise.price.amount) * line.quantity;
}
