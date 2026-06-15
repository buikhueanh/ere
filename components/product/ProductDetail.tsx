'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { colorHexMap } from '@/config/colors';
import { topLevelCollections } from '@/config/collections';
import { formatPrice } from '@/utils/formatPrice';
import ProductGallery from '@/components/product/ProductGallery';
import SizeSelector from '@/components/product/SizeSelector';
import AddToCartButton from '@/components/product/AddToCartButton';
import Accordion from '@/components/ui/Accordion';
import type { ShopifyProduct, ShopifyVariant } from '@/types/shopify.types';

// Resolve the variant that matches the selected color + size combination.
function resolveVariant(
  variants: ShopifyVariant[],
  color: string | null,
  size: string | null,
): ShopifyVariant | null {
  return variants.find((v) => {
    const matchColor = !color || v.selectedOptions.some((o) => o.name === 'Color' && o.value === color);
    const matchSize = !size || v.selectedOptions.some((o) => o.name === 'Size' && o.value === size);
    return matchColor && matchSize;
  }) ?? null;
}

// For a given color, check if every variant in that color is sold out.
function isColorSoldOut(variants: ShopifyVariant[], color: string): boolean {
  const colorVariants = variants.filter((v) =>
    v.selectedOptions.some((o) => o.name === 'Color' && o.value === color),
  );
  return colorVariants.length > 0 && colorVariants.every((v) => !v.availableForSale);
}

// Build breadcrumb: sort product's collections against the hierarchy config.
function buildBreadcrumb(collections: Array<{ handle: string; title: string }>) {
  const sorted = [...collections].sort((a, b) => {
    const ai = topLevelCollections.indexOf(a.title);
    const bi = topLevelCollections.indexOf(b.title);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
  return sorted.slice(0, 2);
}

export default function ProductDetail({ product }: { product: ShopifyProduct }) {
  const { title, descriptionHtml, vendor, priceRange, variants, collections, metafields } = product;

  const firstColor = variants.nodes[0]?.selectedOptions.find((o) => o.name === 'Color')?.value ?? null;
  const [selectedColor, setSelectedColor] = useState<string | null>(firstColor);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState(product.images.nodes);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // When color changes, surface that colorway's variant image first in the gallery.
  useEffect(() => {
    if (!selectedColor) return;
    const variantWithImage = variants.nodes.find(
      (v) => v.selectedOptions.some((o) => o.name === 'Color' && o.value === selectedColor) && v.image,
    );
    if (variantWithImage?.image) {
      const rest = product.images.nodes.filter((img) => img.url !== variantWithImage.image!.url);
      setGalleryImages([variantWithImage.image, ...rest]);
    } else {
      setGalleryImages(product.images.nodes);
    }
  }, [selectedColor, variants.nodes, product.images.nodes]);

  const resolvedVariant = resolveVariant(variants.nodes, selectedColor, selectedSize);
  const displayPrice = resolvedVariant
    ? formatPrice(resolvedVariant.price.amount, resolvedVariant.price.currencyCode)
    : formatPrice(priceRange.minVariantPrice.amount, priceRange.minVariantPrice.currencyCode);

  const uniqueColors = [...new Set(
    variants.nodes.flatMap((v) => v.selectedOptions.filter((o) => o.name === 'Color').map((o) => o.value)),
  )];

  const breadcrumb = buildBreadcrumb(collections.nodes);

  const accordionRows = [
    { label: 'Fabric', value: metafields.fabric },
    { label: 'Origin', value: metafields.origin },
    { label: 'Care', value: metafields.careInstructions },
    { label: 'Fit', value: metafields.fitNotes },
    { label: 'Measurements', value: metafields.measurements },
    { label: 'Designer', value: vendor },
  ].filter((row) => row.value);

  const breadcrumbNav = breadcrumb.length > 0 && (
    <nav className="flex items-center gap-2">
      {breadcrumb.map((c, i) => (
        <span key={c.handle} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted text-xs">·</span>}
          <Link
            href={`/collections/${c.handle}`}
            className="text-xs tracking-widest text-muted hover:text-foreground transition-colors"
          >
            {c.title}
          </Link>
        </span>
      ))}
    </nav>
  );

  const colorPicker = uniqueColors.length > 0 && (
    <div>
      <p className="text-xs tracking-widest mb-3">Color : {selectedColor ?? ''}</p>
      <div className="flex gap-2">
        {uniqueColors.map((color) => {
          const hex = colorHexMap[color];
          const soldOut = isColorSoldOut(variants.nodes, color);
          return (
            <button
              key={color}
              onClick={() => !soldOut && setSelectedColor(color)}
              title={color}
              disabled={soldOut}
              className={`w-7 h-7 border transition-all ${
                selectedColor === color ? 'border-foreground scale-110' : 'border-border hover:border-foreground/50'
              } ${soldOut ? 'opacity-30 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: hex ?? '#ccc' }}
            />
          );
        })}
      </div>
    </div>
  );

  const sizeGuideButton = metafields.sizeGuide && (
    <button
      onClick={() => setSizeGuideOpen(true)}
      className="text-xs tracking-widest underline underline-offset-2 text-foreground/60 hover:text-foreground transition-colors"
    >
      Size Guide
    </button>
  );

  const accordions = (
    <>
      {accordionRows.length > 0 && (
        <Accordion label="More information">
          <dl className="space-y-3">
            {accordionRows.map((row) => (
              <div key={row.label} className="flex gap-4">
                <dt className="text-xs tracking-widest text-muted w-24 shrink-0">{row.label}</dt>
                <dd className="text-xs whitespace-pre-line">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Accordion>
      )}
    </>
  );

  const description = descriptionHtml && (
    <div
      className="text-xs font-sans text-foreground/70 leading-relaxed prose-sm"
      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
    />
  );

  return (
    <>
      <main className="px-4 md:px-10 py-6 md:py-12">
        {/* ── Desktop: gallery + info panel ── */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_380px] md:gap-10">
          <div className="col-span-2">
            <ProductGallery images={galleryImages} title={title} />
          </div>

          <div className="flex flex-col gap-5">
            {breadcrumbNav}

            <div>
              <h1 className="font-serif text-2xl mb-1">{title}</h1>
              <p className="text-sm font-sans">{displayPrice}</p>
            </div>

            {colorPicker}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest">Size</p>
                {sizeGuideButton}
              </div>
              <SizeSelector
                variants={variants.nodes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
              />
            </div>

            <div>
              <AddToCartButton variantId={selectedSize ? resolvedVariant?.id ?? null : null} />
              {!selectedSize && (
                <p className="text-xs text-muted mt-2 text-center tracking-wide">Please select a size</p>
              )}
            </div>

            {description}
            <div>{accordions}</div>
          </div>
        </div>

        {/* ── Mobile: stacked, sticky add-to-bag ── */}
        <div className="md:hidden">
          <ProductGallery images={galleryImages} title={title} />

          <div className="pt-5 pb-28 space-y-5">
            {breadcrumbNav}

            <div>
              <h1 className="font-serif text-xl mb-1">{title}</h1>
              <p className="text-sm font-sans">{displayPrice}</p>
            </div>

            {colorPicker}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest">Size</p>
                {sizeGuideButton}
              </div>
              <SizeSelector
                variants={variants.nodes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
              />
            </div>

            {description}
            <div>{accordions}</div>
          </div>

          {/* Sticky add to bag */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-40">
            <AddToCartButton variantId={selectedSize ? resolvedVariant?.id ?? null : null} />
          </div>
        </div>
      </main>

      {/* Size guide modal */}
      {sizeGuideOpen && metafields.sizeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div
            className="bg-background p-6 max-w-lg w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-xs tracking-widest hover:text-foreground/60 transition-colors"
            >
              Close
            </button>
            <p className="text-xs tracking-widest mb-4">Size Guide</p>
            <div className="relative w-full aspect-[3/4]">
              <Image
                src={metafields.sizeGuide.url}
                alt={metafields.sizeGuide.altText ?? 'Size guide'}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
