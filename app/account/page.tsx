import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession, getCustomerAccessToken } from '@/lib/auth/currentCustomer';
import { customerAccountFetch } from '@/lib/shopify/customerAccount';

export const metadata = { title: 'Account' };

interface CustomerQuery {
  customer: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    orders: {
      nodes: Array<{
        id: string;
        name: string;
        processedAt: string;
        totalPrice: { amount: string; currencyCode: string };
      }>;
    };
  } | null;
}

const CUSTOMER_QUERY = /* GraphQL */ `
  query AccountOverview {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/api/auth/login?returnTo=/account');

  const accessToken = await getCustomerAccessToken();

  // Our session outlives Shopify's token, so "logged in but no usable token"
  // is a normal state, not an error — send them through login again rather
  // than showing a broken page.
  let data: CustomerQuery | null = null;
  let loadError: string | null = null;
  if (accessToken) {
    try {
      data = await customerAccountFetch<CustomerQuery>({ query: CUSTOMER_QUERY, accessToken });
    } catch (error) {
      console.error('[account] customer query failed:', error);
      loadError = 'we could not load your details just now.';
    }
  }

  const customer = data?.customer;
  const displayName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');
  const orders = customer?.orders.nodes ?? [];

  return (
    <div className="px-6 mx-auto py-24 max-w-lg">
      <h1 className="font-handwriting italic lowercase text-xl mb-3">
        {displayName ? `hello, ${displayName.toLowerCase()}` : 'your account'}
      </h1>

      {customer?.emailAddress && (
        <p className="text-xs lowercase text-foreground/70 mb-8">
          {customer.emailAddress.emailAddress}
        </p>
      )}

      {!accessToken && (
        <p className="text-xs lowercase text-foreground/70 mb-8">
          your session has expired —{' '}
          <Link href="/api/auth/login?returnTo=/account" className="underline">
            sign in again
          </Link>
          .
        </p>
      )}

      {loadError && <p className="text-xs lowercase text-foreground/70 mb-8">{loadError}</p>}

      <h2 className="text-xs font-semibold uppercase tracking-wide mb-3">Orders</h2>
      {orders.length === 0 ? (
        <p className="text-xs lowercase text-foreground/70">no orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between py-4 text-xs lowercase">
              <span>{order.name}</span>
              <span className="text-foreground/70">
                {new Date(order.processedAt).toLocaleDateString()}
              </span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: order.totalPrice.currencyCode,
                }).format(Number(order.totalPrice.amount))}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form action="/api/auth/logout" method="post" className="mt-12">
        <button type="submit" className="text-xs lowercase underline text-foreground/70">
          sign out
        </button>
      </form>
    </div>
  );
}
