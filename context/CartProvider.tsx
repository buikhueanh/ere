'use client';

import { createContext, useContext, ReactNode } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }: { children: ReactNode }) {
  return <CartContext.Provider value={null}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  return useContext(CartContext);
}
