import Link from 'next/link';
import Image from 'next/image';
import type { ShopifyProductCard } from '@/types/shopify.types';
import { formatPrice } from '@/utils/formatPrice';

interface ProductCardProps {
  product: ShopifyProductCard;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { handle, title, featuredImage, images, priceRange, availableForSale } = product;
  const hoverImage = images.nodes[1] ?? null;
  const price = formatPrice(
    priceRange.minVariantPrice.amount,
    priceRange.minVariantPrice.currencyCode,
  );

  return (
    <Link href={`/products/${handle}`} className="group block">
      {/* Image */}
      <div className="relative w-full aspect-[3/4] bg-card-bg overflow-hidden">
        {!availableForSale && (
          <span className="absolute top-3 left-3 z-10 text-[9px] tracking-widest uppercase text-muted">
            Sold Out
          </span>
        )}

        {featuredImage ? (
          <>
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText ?? title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-500 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
            />
            {hoverImage && (
              <Image
                src={hoverImage.url}
                alt={hoverImage.altText ?? title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-card-bg" />
        )}
      </div>

      {/* Name + price — stacked on mobile, side by side on desktop */}
      <div className="mt-3 flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2">
        <p className="text-xs tracking-widest text-foreground leading-relaxed">
          {title}
        </p>
        <p className="text-xs tracking-widest uppercase text-foreground md:whitespace-nowrap">
          {price}
        </p>
      </div>
    </Link>
  );
}
