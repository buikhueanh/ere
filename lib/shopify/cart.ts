import { shopifyFetch } from './client';
import {
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  UPDATE_CART_MUTATION,
  GET_CART_QUERY,
} from '@/lib/queries/cart.queries';
import type { Cart } from '@/types/cart.types';

interface CartMutationPayload {
  cart: Cart | null;
  userErrors: Array<{ field: string[] | null; message: string }>;
}

function unwrap(payload: CartMutationPayload): Cart {
  if (payload.userErrors.length > 0) {
    throw new Error(payload.userErrors[0].message);
  }
  if (!payload.cart) {
    throw new Error('Shopify returned no cart');
  }
  return payload.cart;
}

export async function createCart(variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: CartMutationPayload }>({
    query: CREATE_CART_MUTATION,
    variables: { lines: [{ merchandiseId: variantId, quantity }] },
    cache: 'no-store',
  });
  return unwrap(data.cartCreate);
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationPayload }>({
    query: ADD_TO_CART_MUTATION,
    variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    cache: 'no-store',
  });
  return unwrap(data.cartLinesAdd);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationPayload }>({
    query: REMOVE_FROM_CART_MUTATION,
    variables: { cartId, lineIds },
    cache: 'no-store',
  });
  return unwrap(data.cartLinesRemove);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationPayload }>({
    query: UPDATE_CART_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    cache: 'no-store',
  });
  return unwrap(data.cartLinesUpdate);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: Cart | null }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    cache: 'no-store',
  });
  return data.cart;
}
