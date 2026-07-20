import { getProducts } from '@/lib/shopify/products';
import { paginate } from '@/lib/pagination';
import ProductGrid from '@/components/product/ProductGrid';
import PageSelector from '@/components/ui/PageSelector';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

export const metadata = { title: 'New In' };

// 4 rows x 4 columns desktop; mobile reflows the same slice 2-up (decision 010 §6).
const ROWS_PER_PAGE = 4;
const COLUMNS = 4;
const PAGE_SIZE = ROWS_PER_PAGE * COLUMNS;

interface NewInPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewInPage({ searchParams }: NewInPageProps) {
  const { page } = await searchParams;

  // getProducts() already sorts CREATED_AT reverse — newest upload is
  // always first (decision 011). Fetching enough for several pages up
  // front; revisit with real cursor pagination if the catalog outgrows this.
  const products = await getProducts(96);
  const { items, currentPage, totalPages } = paginate(products, Number(page) || 1, PAGE_SIZE);

  return (
    <main className="px-6 md:px-10 py-12">
      <h1 className="text-xs mb-5">new in</h1>
      <ProductGrid products={items} />
      <PageSelector currentPage={currentPage} totalPages={totalPages} basePath="/new-in" />
      <div className='mt-24'></div>
      <NewsletterSignup
        headline="into the world of ère"
        subtext="join our private guest list to access exclusive content and member-only perks."
        imageSrc="/images/hero/homepage.png"
      />
    </main>
  );
}
