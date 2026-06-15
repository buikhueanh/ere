'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createCart, addToCart, removeFromCart, updateCartLine, getCart } from '@/lib/shopify/cart';
import type { Cart } from '@/types/cart.types';

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_ID_KEY = 'ere_cart_id';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Rehydrate cart from localStorage on mount
  useEffect(() => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    getCart(cartId).then((existing) => {
      if (existing) setCart(existing);
      else localStorage.removeItem(CART_ID_KEY);
    });
  }, []);

  const persist = useCallback((updated: Cart) => {
    localStorage.setItem(CART_ID_KEY, updated.id);
    setCart(updated);
  }, []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    const updated = cartId
      ? await addToCart(cartId, variantId, quantity)
      : await createCart(variantId, quantity);
    persist(updated);
    setIsOpen(true);
  }, [persist]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return;
    const updated = await removeFromCart(cart.id, [lineId]);
    persist(updated);
  }, [cart, persist]);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;
    const updated = await updateCartLine(cart.id, lineId, quantity);
    persist(updated);
  }, [cart, persist]);

  return (
    <CartContext.Provider value={{
      cart,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      updateItem,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used inside CartProvider');
  return ctx;
}
