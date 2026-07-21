import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductByHandle } from '@/lib/shopify/products';
import ProductDetail from '@/components/product/ProductDetail';

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  return <ProductDetail product={product} />;
  
    
}
