import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify/products';
import { fuzzySearchProducts } from '@/lib/search';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!query) return NextResponse.json({ products: [] });

  // Fuzzy-matches over the full catalog rather than Shopify's own
  // `products(query:)` search, which only does near-exact keyword matching
  // — see lib/search.ts. 250 is the Storefront API's max page size, which
  // comfortably covers this catalog's size.
  const products = await getProducts(250);
  const results = fuzzySearchProducts(products, query);

  return NextResponse.json({ products: results });
}
