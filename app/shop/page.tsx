import ShopPageContent from '@/components/product/ShopPageContent';
import DiscountPopup from '@/components/ui/DiscountPopup';

export const metadata = { title: 'Shop' };

interface ShopPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { page } = await searchParams;

  return (
    <>
      <DiscountPopup />
      <ShopPageContent
        pageKey="all-items"
        heading="all items"
        basePath="/shop"
        requestedPage={Number(page) || 1}
        showNewsletter
      />
    </>
  );
}
