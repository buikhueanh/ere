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
      className={`w-full py-4 text-xs lowercase leading-none transition-colors
        ${disabled
          ? 'bg-input-fill text-foreground cursor-not-allowed'
          : 'bg-foreground text-background hover:bg-foreground/80'
        }`}
    >
      {loading ? 'Adding...' : 'Add to Shopping Bag'}
    </button>
  );
}
