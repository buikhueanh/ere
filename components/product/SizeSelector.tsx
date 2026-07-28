'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close when clicking anywhere outside the dropdown
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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
    <div ref={rootRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border border-foreground px-4 py-3 text-xs lowercase leading-none text-foreground hover:bg-input-fill transition-colors"
      >
        <span className={selectedSize ? '' : 'text-foreground/70'}>
          {selectedSize ?? 'Select Size'}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Options */}
      {open && (
        <ul className="absolute left-0 right-0 top-full z-30 bg-background border border-foreground border-t-0 max-h-64 overflow-y-auto">
          {sizes.map(({ size, available }) => (
            <li key={size}>
              <button
                onClick={() => {
                  if (!available) return;
                  onSizeChange(size);
                  setOpen(false);
                }}
                disabled={!available}
                className={`w-full text-left px-4 py-3 text-xs leading-none lowercase transition-colors
                  ${available
                    ? selectedSize === size
                      ? 'bg-input-fill text-foreground'
                      : 'text-foreground hover:bg-card-bg'
                    : 'bg-muted-bg text-muted line-through cursor-not-allowed'
                  }`}
              >
                {size}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
