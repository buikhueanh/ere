import Link from 'next/link';
import { getVendors } from '@/lib/shopify/vendors';

export const metadata = { title: 'Brands' };

// Distinct vendor names, alphabetized (decision 010 §9 / 011 §2) — no new
// data model, reuses the `vendor` field already on every product.
export default async function BrandsPage() {
  const vendors = await getVendors();

  return (
    <main className="px-6 md:px-10 py-12">
      <h1 className="text-xs mb-5 lowercase">brands</h1>
      {vendors.length === 0 ? (
        <p className="text-sm tracking-widest lowercase text-muted py-24 text-center">
          No brands found
        </p>
      ) : (
        <ul className="max-w-xl">
          {vendors.map((vendor) => (
            <li key={vendor}>
              <Link
                href={`/brands/${encodeURIComponent(vendor)}`}
                className="block py-4 text-xs lowercase text-foreground/70 hover:text-foreground transition-colors"
              >
                {vendor}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
