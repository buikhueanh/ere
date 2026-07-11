import { getProducts } from '@/lib/shopify/products';
import ProductGrid from '@/components/product/ProductGrid';

export const metadata = { title: 'Shop' };

export default async function ShopPage() {
  const products = await getProducts(48);

  return (
    <main className="px-6 md:px-10 py-12">
      <h1 className="text-4xl mb-10 tracking-wide">Shop</h1>
      <ProductGrid products={products} />
    </main>
  );
}
