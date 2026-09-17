import { getShopPageCards, type ShopPageKey } from "@/lib/shopify/shop";
import { paginate } from "@/lib/pagination";
import ShopGrid from "./ShopGrid";
import PageSelector from "@/components/ui/PageSelector";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

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
  const { items, currentPage, totalPages } = paginate(
    cards,
    requestedPage,
    PAGE_SIZE,
  );

  return (
    <main className={`px-6 md:px-10 pt-12 ${showNewsletter ? 'pb-5' : 'pb-12'}`}>
      <h1 className="text-xs mb-5">{heading}</h1>
      <ShopGrid cards={items} />
      <PageSelector
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
      />
      {showNewsletter ? (
        <>
          {/* 40px — matches the gap from NewsletterSignup's own bottom edge
              to Footer (main's pb-5 [20px] + the root layout's h-5 spacer
              [20px] before <Footer>), so the space above and below the
              section reads as equal. Not mt-24 + mt-12 stacked: two
              adjacent empty divs' margins collapse to max(24,12), not their
              sum, so that combination silently produced 96px, not 144px. */}
          <div className="mt-10" />
          <NewsletterSignup
            headline="into the world of ère"
            subtext={
              <>
                create your ère ID for a personalized experience to <br className="md:hidden" /> access
                exclusive content and member-only perks.
              </>
            }
            imageSrc="/images/newsletter/newsletter-ph.jpeg"
          />
        </>
      ) : (
        <div className="mt-24" />
      )}
    </main>
  );
}
