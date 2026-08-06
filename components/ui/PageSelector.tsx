import Link from 'next/link';

interface PageSelectorProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

// Numbered, bookmarkable pagination (decision 010 §7 / 011): links to
// `${basePath}?page=N`, page 1 omits the query param so the base URL stays
// the canonical first-page link.
export default function PageSelector({ currentPage, totalPages, basePath }: PageSelectorProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-5 mt-10 pt-0">
      {pages.map((page) => (
        <Link
          key={page}
          href={page === 1 ? basePath : `${basePath}?page=${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`text-xs w-6 text-center transition-colors ${
            page === currentPage
              ? 'text-foreground underline underline-offset-4'
              : 'text-muted hover:text-foreground'
          }`}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
