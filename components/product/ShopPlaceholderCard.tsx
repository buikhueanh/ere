import Image from 'next/image';
import type { ShopPlaceholder } from '@/lib/shop-interleave';

interface ShopPlaceholderCardProps {
  placeholder: ShopPlaceholder;
}

// Purely decorative editorial image — no link, no product data (decision
// 011 §4). Matches ProductCard's image aspect ratio, with a blank spacer
// where the name/price row would be, so grid rows stay visually aligned
// with the product cards sharing the same row.
export default function ShopPlaceholderCard({ placeholder }: ShopPlaceholderCardProps) {
  return (
    <div>
      <div className="relative w-full aspect-[3/4] bg-card-bg overflow-hidden">
        <Image
          src={placeholder.imageUrl}
          alt={placeholder.imageAlt ?? ''}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="mt-3 h-5" aria-hidden="true" />
    </div>
  );
}
