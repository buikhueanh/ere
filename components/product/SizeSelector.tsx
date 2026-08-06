'use client';

import type { ShopifyVariant } from '@/types/shopify.types';

interface SizeSelectorProps {
  variants: ShopifyVariant[];
  selectedColor: string | null;
  selectedSize: string | null;
  onSizeChange: (size: string) => void;
}

export default function SizeSelector({
  variants,
  selectedColor,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) {
  // Sizes for the selected color (or all colors if none selected)
  const sizeVariants = variants.filter((v) => {
    if (!selectedColor) return true;
    return v.selectedOptions.some((o) => o.name === 'Color' && o.value === selectedColor);
  });

  const sizes = sizeVariants.reduce<Array<{ size: string; available: boolean }>>((acc, v) => {
    const sizeOpt = v.selectedOptions.find((o) => o.name === 'Size');
    if (!sizeOpt) return acc;
    if (acc.some((s) => s.size === sizeOpt.value)) return acc;
    acc.push({ size: sizeOpt.value, available: v.availableForSale });
    return acc;
  }, []);

  if (!sizes.length) return null;

  return (
    <div className="flex items-center gap-4">
      {sizes.map(({ size, available }) => (
        <button
          key={size}
          onClick={() => available && onSizeChange(size)}
          disabled={!available}
          className={`text-xs lowercase leading-none transition-colors
            ${!available
              ? 'text-foreground/40 line-through cursor-not-allowed'
              : selectedSize === size
                ? 'text-foreground underline underline-offset-4'
                : 'text-foreground hover:text-foreground/60'
            }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
