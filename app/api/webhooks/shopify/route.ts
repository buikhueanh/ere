import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS_TAG } from '@/lib/shopify/products';
import { SHOP_PLACEHOLDERS_TAG } from '@/lib/shopify/shop';
import { HOMEPAGE_TAG } from '@/lib/shopify/homepage';

// metaobjects/* webhooks fire for every metaobject type in the shop, not
// just one — the payload's `type` field tells us which cache actually needs
// busting, so an edit to shop_placeholder doesn't needlessly revalidate the
// homepage cache and vice versa.
const METAOBJECT_TAGS: Record<string, string> = {
  shop_placeholder: SHOP_PLACEHOLDERS_TAG,
  homepage_settings: HOMEPAGE_TAG,
};

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

  const topic = request.headers.get('x-shopify-topic') ?? 'unknown';
  let revalidated: string[];

  if (topic.startsWith('metaobjects/')) {
    let metaobjectType: string | undefined;
    try {
      metaobjectType = JSON.parse(rawBody).type;
    } catch {
      // Malformed body — fall through to the defensive case below.
    }
    const tag = metaobjectType ? METAOBJECT_TAGS[metaobjectType] : undefined;
    if (tag) {
      revalidateTag(tag, 'max');
      revalidated = [tag];
    } else {
      // Unrecognized/unparsed type — safer to revalidate every
      // metaobject-backed tag than to silently miss the update.
      revalidated = Object.values(METAOBJECT_TAGS);
      revalidated.forEach((t) => revalidateTag(t, 'max'));
    }
  } else {
    // Product/collection webhooks — one shared tag covers the grid and
    // every PDP at once, so we don't need to parse the body.
    revalidateTag(PRODUCTS_TAG, 'max');
    revalidated = [PRODUCTS_TAG];
  }

  console.log(`[webhook] ${topic} → revalidated ${revalidated.map((t) => `"${t}"`).join(', ')}`);

  return NextResponse.json({ revalidated: true });
}
