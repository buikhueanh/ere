'use client';

import { useEffect, useState, FormEvent } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { joinNewsletter } from '@/lib/shopify/customer';
import { isValidEmail } from '@/lib/newsletter';

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Session-scoped so it re-triggers on a fresh visit but not on every page
// load — mounted on /shop and /new-in only; auto-opens once when arriving
// from the homepage, then collapses to the side tab for the rest of the
// session (decision: quick-fix spec, 2026-08-06).
const SESSION_KEY = 'ere-discount-popup-seen';

export default function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);

    // Already shown earlier this session (e.g. a reload, or navigating back
    // to /new-in) — restore the collapsed tab instead of re-opening the
    // modal. Without this, hasOpenedOnce resets to false on every remount
    // and the tab never comes back at all.
    if (alreadySeen) {
      setHasOpenedOnce(true);
      return;
    }

    const cameFromHomepage = sessionStorage.getItem('ere-visited-homepage') === 'true';
    if (cameFromHomepage) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsOpen(true);
      setHasOpenedOnce(true);
    }
  }, []);

  function handleClose() {
    setIsOpen(false);
    setHasOpenedOnce(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMessage('please enter a valid email address.');
      return;
    }
    setStatus('submitting');
    try {
      const result = await joinNewsletter(email.trim());
      if (result.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.message);
      }
    } catch {
      setStatus('error');
      setErrorMessage('something went wrong, please try again.');
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 bg-foreground/20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative w-full max-w-2xl bg-background flex flex-col md:flex-row shadow-xl">
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute -top-3 -right-3 md:top-4 md:right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>

          {/* Image */}
          <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-card-bg overflow-hidden">
            <Image
              src="/images/discount/discount-placeholder.png"
              alt="ère"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Copy + form */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center gap-5 px-8 py-12">
            <h2 className="font-handwriting italic text-2xl lowercase">
              welcome to ère.
            </h2>
            <p className="text-xs text-foreground leading-relaxed">
              sign up for our newsletter and enjoy 10% off your first purchase.
            </p>

            {status === 'success' ? (
              <p className="text-xs border border-border px-4 py-4 w-full">
                thank you - check your inbox for your code.
              </p>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  aria-label="Email address"
                  className="w-full border border-foreground px-4 py-3 text-xs placeholder:text-muted focus:outline-none focus:border-foreground"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-foreground text-background px-6 py-3 text-xs tracking-widest lowercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
                >
                  {status === 'submitting' ? 'signing up…' : 'get code'}
                </button>
                {status === 'error' && (
                  <p className="text-xs text-foreground/70">{errorMessage}</p>
                )}
              </form>
            )}

            <p className="text-xs italic text-foreground/60 leading-relaxed">
              *one-time use per customer. sale items purchased with this code
              are final sale. no price adjustments on prior purchases. cannot
              be redeemed for cash.
            </p>
          </div>
        </div>
      </div>

      {/* Collapsed side tab */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open 10% off offer"
        className={`fixed left-0 top-4/5 -translate-y-1/2 z-40 bg-input-fill px-2 py-3 text-xs tracking-widest uppercase transition-transform duration-300 ${
          hasOpenedOnce && !isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ writingMode: 'vertical-rl' }}
      >
        10% off
      </button>
    </>
  );
}
