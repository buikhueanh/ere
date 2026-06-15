export const metadata = { title: 'Search' };

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  return (
    <main className="px-6 py-24">
      <h1 className="font-serif text-4xl mb-12">
        {q ? `Results for "${q}"` : 'Search'}
      </h1>
    </main>
  );
}
