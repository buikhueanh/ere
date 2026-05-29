import { shopifyFetch } from './client';
import {
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  GET_CART_QUERY,
} from '@/lib/queries/cart.queries';
import type { Cart } from '@/types/cart.types';

export async function createCart(variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: Cart } }>({
    query: CREATE_CART_MUTATION,
    variables: { lines: [{ merchandiseId: variantId, quantity }] },
    cache: 'no-store',
  });
  return data.cartCreate.cart;
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>({
    query: ADD_TO_CART_MUTATION,
    variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    cache: 'no-store',
  });
  return data.cartLinesAdd.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: Cart | null }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    cache: 'no-store',
  });
  return data.cart;
}
