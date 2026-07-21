import { getShopPageCards, type ShopPageKey } from '@/lib/shopify/shop';
import { paginate } from '@/lib/pagination';
import ShopGrid from './ShopGrid';
import PageSelector from '@/components/ui/PageSelector';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

// 4 rows x 4 columns = 16 cards/page (decision 011 §5). Kept as its own
// constant rather than sharing New In's — the two pages' row counts are
// only coincidentally equal today, not coupled by design.
const ROWS_PER_PAGE = 4;
const COLUMNS = 4;
const PAGE_SIZE = ROWS_PER_PAGE * COLUMNS;

interface ShopPageContentProps {
  pageKey: ShopPageKey;
  heading: string;
  basePath: string;
  requestedPage: number;
  showNewsletter?: boolean;
}

// Shared by /shop and /shop/[collection] — same layout, different pageKey.
export default async function ShopPageContent({
  pageKey,
  heading,
  basePath,
  requestedPage,
  showNewsletter = false,
}: ShopPageContentProps) {
  const cards = await getShopPageCards(pageKey);
  const { items, currentPage, totalPages } = paginate(cards, requestedPage, PAGE_SIZE);

  return (
    <main className="px-6 md:px-10 py-12">
      <h1 className="text-xs mb-5">{heading}</h1>
      <ShopGrid cards={items} />
      <PageSelector currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
      <div className="mt-24" />
      {showNewsletter && (
        <>
          <div className="mt-16" />
          <NewsletterSignup
            headline="into the world of ère"
            subtext="join our private guest list to access exclusive content and member-only perks."
            imageSrc="/images/hero/homepage.png"
          />
        </>
      )}
    </main>
  );
}
