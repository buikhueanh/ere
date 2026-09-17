'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ShopifyImage } from '@/types/shopify.types';

interface ProductGalleryProps {
  images: ShopifyImage[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  // Mobile: horizontal swipe carousel (replaces the old vertical stack).
  // mobileIndex tracks scroll position (derived from scrollLeft, not a
  // separate "active" concept) purely to decide which arrow(s) to show —
  // it doesn't affect the desktop thumbnail/large-image state above.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }

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
                className={`relative aspect-[3/4] w-full bg-background overflow-hidden border transition-colors ${
                  i === activeIndex ? 'border-foreground' : 'border-transparent hover:border-foreground/30'
                }`}
              >
                <Image src={img.url} alt={img.altText ?? title} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}

        {/* Large image — same 3:4 crop as the grid/thumbnail, for a
            consistent look across every product shot on the site. */}
        <div className="md:col-start-2 relative aspect-[3/4] bg-background overflow-hidden">
          <Image
            src={active.url}
            alt={active.altText ?? title}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 50vw, 600px"
            priority
          />
        </div>
      </div>

      {/* ── Mobile: horizontal swipe carousel ──
          scroll-snap does the actual swipe UX natively; the scroll handler
          below only tracks which page it lands on, to decide which arrow(s)
          to show. */}
      <div className="md:hidden relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {images.map((img, i) => (
            <div
              key={img.url}
              className="relative w-full shrink-0 snap-start aspect-[3/4] bg-background overflow-hidden"
            >
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

        {mobileIndex > 0 && (
          <button
            onClick={() => scrollToIndex(mobileIndex - 1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 text-foreground"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
        )}
        {mobileIndex < images.length - 1 && (
          <button
            onClick={() => scrollToIndex(mobileIndex + 1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 text-foreground"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </>
  );
}
