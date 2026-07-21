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
  });

  const errors = data.customerCreate.customerUserErrors;
  if (errors.length === 0) return { ok: true };

  // Already subscribed → success from the visitor's point of view.
  if (errors.some((e) => isAlreadySubscribedError(e.code))) return { ok: true };

  return { ok: false, message: errors[0].message };
}
