'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { joinNewsletter } from '@/lib/shopify/customer';
import { isValidEmail } from '@/lib/newsletter';

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Session-scoped so it re-triggers on a fresh visit but not on every page
// load — mounted on /shop and /new-in only; each page gets its own one-time
// auto-open the first time it's visited this session, regardless of how the
// user got there, then collapses to the side tab for the rest of the
// session (decision: quick-fix spec, 2026-08-21).
const SESSION_KEY_PREFIX = 'ere-discount-popup-seen:';

// DiscountPopup is a separate component instance on each page (/shop,
// /new-in), so `status`/`email` local state doesn't survive navigating
// between them — without this flag, a user who already signed up on one
// page would see a fresh blank form (and could submit a different email)
// the moment they land on the other page.
const SUBSCRIBED_KEY = 'ere-discount-popup-subscribed';

// How long the collapsed tab stays fully out before tucking away to an
// 8px sliver (kept as a literal Tailwind class below, not this constant,
// since arbitrary-value classes must be static strings for the compiler
// to pick up).
const TAG_IDLE_MS = 3000;

// Delay before the first-visit auto-open, so the popup doesn't slam into
// view the instant the page loads — it waits, then fades/scales in over
// the existing 700ms transition.
const AUTO_OPEN_DELAY_MS = 1200;

export default function DiscountPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [isTagPeeking, setIsTagPeeking] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function schedulePeek() {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setIsTagPeeking(true), TAG_IDLE_MS);
  }

  // Tag reappears fully visible whenever it's (re)shown, then tucks away to
  // a sliver after a few idle seconds — hovering brings it back out.
  useEffect(() => {
    if (!hasOpenedOnce || isOpen) {
      setIsTagPeeking(false);
      return;
    }
    setIsTagPeeking(false);
    schedulePeek();
    return () => {
      if (peekTimer.current) clearTimeout(peekTimer.current);
    };
  }, [hasOpenedOnce, isOpen]);

  useEffect(() => {
    if (sessionStorage.getItem(SUBSCRIBED_KEY) === 'true') {
      setStatus('success');
    }

    const sessionKey = `${SESSION_KEY_PREFIX}${pathname}`;
    const alreadySeen = sessionStorage.getItem(sessionKey);

    // Already shown earlier this session on this page (e.g. a reload) —
    // restore the collapsed tab instead of re-opening the modal. Without
    // this, hasOpenedOnce resets to false on every remount and the tab
    // never comes back at all.
    if (alreadySeen) {
      setHasOpenedOnce(true);
      return;
    }

    // Mark "seen" only once the popup actually opens, not when the open is
    // merely scheduled — otherwise React's dev-mode double-effect-invoke
    // (mount → cleanup → mount) marks the session seen on the first pass,
    // gets its timer cleared before firing, and the second pass then finds
    // "already seen" and bails out without ever opening the popup.
    const timer = setTimeout(() => {
      sessionStorage.setItem(sessionKey, 'true');
      setIsOpen(true);
      setHasOpenedOnce(true);
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

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
        sessionStorage.setItem(SUBSCRIBED_KEY, 'true');
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
        className={`fixed inset-0 z-50 bg-foreground/20 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative w-full md:w-[650px] md:h-[450px] bg-background flex flex-col md:flex-row shadow-xl">
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
            <h2 className="font-handwriting italic text-2xl lowercase -mb-2">
              welcome to ère
            </h2>
            <p className="text-xs text-foreground leading-relaxed">
              sign up for our newsletter and enjoy <br className="hidden md:inline" /> 10% off your first purchase.
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
                  placeholder="email"
                  aria-label="Email address"
                  className="w-full border border-foreground px-4 py-3 text-xs placeholder:text-muted focus:outline-none focus:border-foreground"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-foreground text-background px-6 py-3 text-xs tracking-widest uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60"
                >
                  {status === 'submitting' ? 'signing up…' : 'join now'}
                </button>
                {status === 'error' && (
                  <p className="text-xs text-foreground/70">{errorMessage}</p>
                )}
              </form>
            )}


            <p className="text-xs italic lowercase text-foreground/60 leading-relaxed">
              *one-time use per customer.
            </p>
          </div>
        </div>
      </div>

      {/* Collapsed side tab */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => {
          if (peekTimer.current) clearTimeout(peekTimer.current);
          setIsTagPeeking(false);
        }}
        onMouseLeave={schedulePeek}
        aria-label="Open 10% off offer"
        className={`fixed right-0 top-9/10 -translate-y-1/2 z-40 bg-input-fill text-foreground px-2 py-3 text-xs tracking-widest uppercase transition-transform duration-300 ${
          !hasOpenedOnce || isOpen
            ? 'translate-x-full'
            : isTagPeeking
              ? 'translate-x-[calc(100%-8px)]'
              : 'translate-x-0'
        }`}
        style={{ writingMode: 'vertical-lr' }}
      >
        10% off
      </button>
    </>
  );
}
