import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShopPageContent from '@/components/product/ShopPageContent';
import { shopCategories } from '@/config/shop-categories';

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ page?: string }>;
}

function findCategory(collection: string) {
  return shopCategories.find((c) => c.key === collection);
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  const category = findCategory(collection);
  return { title: category ? category.label : 'Shop' };
}

// Reuses the exact same layout as /shop, filtered to one of the 5 real
// categories (decision 011 §1). Anything outside that list 404s rather
// than silently falling back to "all items" — a typo'd URL should look
// broken, not quietly show the wrong thing.
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { collection } = await params;
  const { page } = await searchParams;

  const category = findCategory(collection);
  if (!category) notFound();

  return (
    <ShopPageContent
      pageKey={category.key}
      heading={category.label}
      basePath={`/shop/${category.key}`}
      requestedPage={Number(page) || 1}
    />
  );
}
