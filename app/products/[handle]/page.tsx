interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  return (
    <main className="px-6 py-24">
      <h1 className="font-serif text-4xl">{handle}</h1>
    </main>
  );
}
