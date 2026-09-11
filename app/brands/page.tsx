import Link from 'next/link';
import { getVendorGroups } from '@/lib/shopify/vendors';
import ProductGrid from '@/components/product/ProductGrid';

export const metadata = { title: 'Brands' };

// Alphabetized brand index, each with a one-row preview of its newest
// products (decision 014). The brand name links to the full /brands/[vendor]
// listing. ProductGrid is the same 2/4-column grid the shop pages use, so
// four products is exactly one desktop row.
export default async function BrandsPage() {
  const groups = await getVendorGroups(4);

  return (
    <main className="px-6 md:px-10 py-12">
      <h1 className="text-xs mb-5 lowercase">brands</h1>
      {groups.length === 0 ? (
        <p className="text-sm tracking-widest lowercase text-muted py-24 text-center">
          No brands found
        </p>
      ) : (
        groups.map(({ vendor, products }) => (
          <section key={vendor} className="mb-16">
            <Link
              href={`/brands/${encodeURIComponent(vendor)}`}
              className="inline-block py-4 text-xs lowercase text-foreground/70 hover:text-foreground transition-colors"
            >
              {vendor}
            </Link>
            <ProductGrid products={products} />
          </section>
        ))
      )}
    </main>
  );
}
