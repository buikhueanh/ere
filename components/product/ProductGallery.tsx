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
      {/* ── Desktop: thumbnail strip + large image ── */}
      <div className="hidden md:flex gap-4">
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 w-20 shrink-0">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setActiveIndex(i)}
                className={`relative aspect-[2/3] w-full bg-card-bg overflow-hidden border transition-colors ${
                  i === activeIndex ? 'border-foreground' : 'border-transparent hover:border-foreground/30'
                }`}
              >
                <Image src={img.url} alt={img.altText ?? title} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}

        {/* Large image — height-driven so the full garment is always visible */}
        <div className="relative flex-1 h-screen max-h-[800px] bg-card-bg overflow-hidden">
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
          <div key={img.url} className="relative w-full aspect-[3/4] bg-card-bg overflow-hidden">
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
