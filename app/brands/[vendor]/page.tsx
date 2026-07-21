import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductsByVendor } from '@/lib/shopify/vendors';
import ProductGrid from '@/components/product/ProductGrid';

interface VendorPageProps {
  params: Promise<{ vendor: string }>;
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { vendor } = await params;
  return { title: decodeURIComponent(vendor) };
}

// Products filtered by vendor (decision 010 §9). There's no fixed vendor
// list to validate against like /shop/[collection]'s collections — a
// vendor with zero products is treated as not found, since every real
// vendor in the Brands index necessarily has at least one product.
//
// Route params are NOT auto-decoded here — `vendor` arrives as the raw
// percent-encoded segment (e.g. "%C3%A8re"), not "ère". Must decode
// explicitly before using it as a real string (query, display, etc.).
export default async function VendorPage({ params }: VendorPageProps) {
  const { vendor: encodedVendor } = await params;
  const vendor = decodeURIComponent(encodedVendor);
  const products = await getProductsByVendor(vendor);

  if (products.length === 0) notFound();

  return (
    <main className="px-6 md:px-10 py-12">
      <h1 className="text-base mb-5 lowercase">{vendor}</h1>
      <ProductGrid products={products} />
    </main>
  );
}
