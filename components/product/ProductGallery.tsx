'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ShopifyImage } from '@/types/shopify.types';

interface ProductGalleryProps {
  images: ShopifyImage[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!images.length) return null;

  return (
    <>
      {/* ── Desktop: thumbnail strip + large image ──
          display:contents removes this wrapper from the box model — its
          children become direct items of the parent's 3-column grid
          (ProductDetail.tsx), so the thumbnail/big-image gap is exactly
          the grid's gap-10, matching the page's outer px-10 margin.
          Each item gets an explicit col-start so the big image still
          lands in column 2 even when there's only one image and the
          thumbnail strip below doesn't render. */}
      <div className="hidden md:contents">
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="md:col-start-1 flex flex-col gap-2">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setActiveIndex(i)}
                className={`relative aspect-[2/3] w-full bg-background overflow-hidden border transition-colors ${
                  i === activeIndex ? 'border-foreground' : 'border-transparent hover:border-foreground/30'
                }`}
              >
                <Image src={img.url} alt={img.altText ?? title} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}

        {/* Large image — height-driven so the full garment is always visible */}
        <div className="md:col-start-2 relative h-screen max-h-[800px] bg-background overflow-hidden">
          <Image
            src={active.url}
            alt={active.altText ?? title}
            fill
            className="object-contain"
            sizes="(max-width: 1280px) 50vw, 600px"
            priority
          />
        </div>
      </div>

      {/* ── Mobile: vertically scrollable images, no strip ── */}
      <div className="md:hidden flex flex-col gap-1">
        {images.map((img, i) => (
          <div key={img.url} className="relative w-full aspect-[3/4] bg-background overflow-hidden">
            <Image
              src={img.url}
              alt={img.altText ?? title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </>
  );
}
