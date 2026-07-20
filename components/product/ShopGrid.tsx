import type { ShopCard } from '@/lib/shop-interleave';
import ProductCard from './ProductCard';
import ShopPlaceholderCard from './ShopPlaceholderCard';

interface ShopGridProps {
  cards: ShopCard[];
}

// Same 2-up/4-up grid as ProductGrid, but over the interleaved
// product+placeholder sequence from getShopPageCards() (decision 011).
export default function ShopGrid({ cards }: ShopGridProps) {
  if (cards.length === 0) {
    return (
      <p className="text-sm tracking-widest lowercase text-muted py-24 text-center">
        No products found
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
      {cards.map((card) =>
        card.type === 'product' ? (
          <ProductCard key={card.product.id} product={card.product} />
        ) : (
          <ShopPlaceholderCard key={card.placeholder.id} placeholder={card.placeholder} />
        ),
      )}
    </div>
  );
}
