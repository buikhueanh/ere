// Generic page-slicing helper — used by New In now, and by Shop's
// interleaved product+placeholder sequence in a later phase (decision 011).
// Kept as a pure function so both call sites can share one tested
// implementation instead of reimplementing page-clamping logic twice.

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
}

export function paginate<T>(items: T[], requestedPage: number, pageSize: number): PaginationResult<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Clamp instead of erroring — an out-of-range ?page= in the URL (typed by
  // hand, or a page that no longer exists after inventory changes) should
  // fall back to the nearest real page, not crash or show nothing.
  const currentPage = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
  };
}
