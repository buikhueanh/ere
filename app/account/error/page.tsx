import Link from 'next/link';

export const metadata = { title: 'Sign in' };

// Reasons are set by /api/auth/callback. Anything unrecognised falls back to
// the generic message rather than echoing the raw query value back into the
// page.
const MESSAGES: Record<string, string> = {
  state_mismatch: 'that sign-in link could not be verified. please try again.',
  session_expired: 'that sign-in link expired. please start again.',
  missing_code: 'that sign-in attempt was incomplete. please try again.',
  // Kept so links from older deploys still resolve to a sensible message.
  missing_parameters: 'that sign-in attempt was incomplete. please try again.',
  token_exchange_failed: 'we could not complete your sign in. please try again.',
  no_customer_id: 'we could not confirm your account. please try again.',
  access_denied: 'sign in was cancelled.',
};

export default async function AccountErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message = (reason && MESSAGES[reason]) || 'something went wrong signing you in.';

  return (
    <div className="px-6 mx-auto py-24 max-w-lg">
      <h1 className="font-handwriting italic lowercase text-xl mb-3">sign in</h1>
      <p className="text-xs lowercase text-foreground/70 mb-8">{message}</p>
      <Link href="/api/auth/login" className="text-xs lowercase underline">
        try again
      </Link>
    </div>
  );
}
