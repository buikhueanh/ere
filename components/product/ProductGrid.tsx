import type { ShopifyProductCard } from '@/types/shopify.types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ShopifyProductCard[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-xs tracking-widest uppercase text-muted py-24 text-center">
        No products found
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
