import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS_TAG } from '@/lib/shopify/products';

// Shopify signs every webhook with HMAC-SHA256 over the raw body using the
// app's webhook secret. We recompute it and compare, so nobody but Shopify can
// force a cache bust. Returns false if the secret is missing or the digest
// doesn't match.
function isValidShopifyRequest(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;

  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');

  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  // timingSafeEqual throws on length mismatch, so guard first.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  // Must read the raw text BEFORE parsing — the HMAC is over the exact bytes.
  const rawBody = await request.text();
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

  if (!isValidShopifyRequest(rawBody, hmacHeader)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Any product create/update/delete invalidates all product reads. We don't
  // need to parse the body — the tag covers the grid and every PDP at once.
  revalidateTag(PRODUCTS_TAG, 'max');

  const topic = request.headers.get('x-shopify-topic') ?? 'unknown';
  console.log(`[webhook] ${topic} → revalidated "${PRODUCTS_TAG}"`);

  return NextResponse.json({ revalidated: true });
}
