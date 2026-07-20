import ShopPageContent from '@/components/product/ShopPageContent';

export const metadata = { title: 'Shop' };

interface ShopPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { page } = await searchParams;

  return (
    <ShopPageContent
      pageKey="all-items"
      heading="shop"
      basePath="/shop"
      requestedPage={Number(page) || 1}
      showNewsletter
    />
  );
}
