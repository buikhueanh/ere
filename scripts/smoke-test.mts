// Live smoke test against the Shopify Storefront API.
// Run: node --env-file=.env.local scripts/smoke-test.mts
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
} from '../lib/queries/product.queries.ts';
import { CREATE_CART_MUTATION } from '../lib/queries/cart.queries.ts';

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;

if (!domain || !token || domain.startsWith('your-store')) {
  console.error('✗ .env.local is missing real credentials');
  process.exit(1);
}

async function gql(query: string, variables: Record<string, unknown>) {
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

// 1. List products
const list = await gql(GET_PRODUCTS_QUERY, { first: 5 });
const cards = list.products.nodes;
console.log(`✓ getProducts — ${cards.length} product(s) found`);
for (const p of cards) {
  console.log(`   ${p.title} (${p.handle}) — ${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}, vendor: ${p.vendor}, type: ${p.productType || '(empty)'}`);
}

if (cards.length === 0) {
  console.error('✗ No products — is the product published to the Headless channel?');
  process.exit(1);
}

// 2. Full PDP query
const handle = cards[0].handle;
const detail = await gql(GET_PRODUCT_BY_HANDLE_QUERY, { handle });
const prod = detail.productByHandle;
console.log(`\n✓ getProductByHandle("${handle}")`);
console.log(`   images: ${prod.images.nodes.length}, variants: ${prod.variants.nodes.length}, collections: ${prod.collections.nodes.map((c: { title: string }) => c.title).join(', ') || '(none)'}`);
for (const v of prod.variants.nodes) {
  const opts = v.selectedOptions.map((o: { name: string; value: string }) => `${o.name}=${o.value}`).join(' ');
  console.log(`   variant: ${opts} — $${v.price.amount}, available: ${v.availableForSale}, image: ${v.image ? 'yes' : 'no'}`);
}
console.log('   metafields:');
for (const m of prod.metafields) {
  if (m) console.log(`     ${m.key}: ${m.reference ? '[image]' : m.value.slice(0, 60)}`);
}
const missing = prod.metafields.filter((m: unknown) => m === null).length;
if (missing > 0) console.log(`     (${missing} metafield(s) empty on this product)`);

// 3. Create a cart with the first available variant
const variant = prod.variants.nodes.find((v: { availableForSale: boolean }) => v.availableForSale);
if (!variant) {
  console.error('✗ No available variant to test cart with');
  process.exit(1);
}
const cartData = await gql(CREATE_CART_MUTATION, {
  lines: [{ merchandiseId: variant.id, quantity: 1 }],
});
const cart = cartData.cartCreate.cart;
console.log(`\n✓ cartCreate — ${cart.totalQuantity} item, subtotal ${cart.cost.subtotalAmount.amount} ${cart.cost.subtotalAmount.currencyCode}`);
console.log(`   checkoutUrl: ${cart.checkoutUrl}`);

console.log('\nAll smoke tests passed.');
