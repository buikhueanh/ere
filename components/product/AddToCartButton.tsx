'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

interface AddToCartButtonProps {
  variantId: string | null;
}

export default function AddToCartButton({ variantId }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const disabled = !variantId || loading;

  async function handleClick() {
    if (!variantId) return;
    setLoading(true);
    try {
      await addItem(variantId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full py-4 text-xs uppercase leading-none transition-colors
        ${disabled
          ? 'bg-input-fill text-foreground cursor-not-allowed'
          : "bg-input-fill border border-input-fill text-foreground px-6 py-3 text-xs tracking-widest uppercase hover:bg-foreground/90 hover:text-background transition-colors disabled:opacity-60 peer-focus:border-foreground"
             
        }`}
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
