'use server';

// Server-only. Without this directive the whole module was bundled into the
// browser, so `customerCreate` ran client-side — meaning the mutation, and
// the Storefront token's `unauthenticated_write_customers` scope, were both
// reachable from anyone's devtools. Running it here keeps the call on the
// server, where it can also be rate-limited and bot-checked.
//
// NOTE: this alone does not un-expose the scope. The public
// NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN is still in the browser bundle for
// cart mutations, and still carries write-customers. Closing that fully
// needs a Shopify Admin change — a separate server-only token holding the
// customer-write scope, and that scope removed from the public one.
// See docs/decisions/012.

import { shopifyFetch } from './client';
import { CUSTOMER_CREATE_MUTATION } from '@/lib/queries/customer.queries';
import { generateThrowawayPassword, isAlreadySubscribedError } from '@/lib/newsletter';

interface CustomerCreatePayload {
  customerCreate: {
    customer: { id: string; email: string } | null;
    customerUserErrors: Array<{ code: string | null; field: string[] | null; message: string }>;
  };
}

export type NewsletterResult = { ok: true } | { ok: false; message: string };

// Creates a customer record with marketing consent so they land in the
// Shopify Email audience (decision 010). Tags can't be set from the
// Storefront API — segment in Shopify Admin by "email subscribers" +
// customer creation date instead.
export async function joinNewsletter(email: string): Promise<NewsletterResult> {
  const data = await shopifyFetch<CustomerCreatePayload>({
    query: CUSTOMER_CREATE_MUTATION,
    variables: {
      input: {
        email,
        password: generateThrowawayPassword(),
        acceptsMarketing: true,
      },
    },
    cache: 'no-store',
    // Use the server-only private token: the customer-write scope belongs on
    // that token, not on the browser-exposed public one.
    privileged: true,
  });

  const errors = data.customerCreate.customerUserErrors;
  if (errors.length === 0) return { ok: true };

  // Already subscribed → success from the visitor's point of view.
  if (errors.some((e) => isAlreadySubscribedError(e.code))) return { ok: true };

  return { ok: false, message: errors[0].message };
}
