'use client';

import { useState, useEffect, useRef, FormEvent, ReactNode } from 'react';
import Image from 'next/image';
import { joinNewsletter } from '@/lib/shopify/customer';
import { isValidEmail } from '@/lib/newsletter';

interface NewsletterSignupProps {
  headline: string;
  subtext: ReactNode;
  imageSrc: string;
  imageAlt?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Shared signup module (decision 010 §11): image left, copy + email form
// right. Used on the coming-soon gate and after pagination on Shop / New In —
// same component, per-placement copy via props.
export default function NewsletterSignup({
  headline,
  subtext,
  imageSrc,
  imageAlt = 'ère',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Mobile-only: constrains subtext/consent text to the headline's own
  // rendered width (measured from a plain inline span, not the h2's full
  // stretched box) so their wrapped lines' left/right edges line up with
  // where the headline's text actually starts and ends, rather than the
  // wider column edge. headlineSpanRef wraps just the text so its bounding
  // box is the glyph width, not the h2's full-width flex-stretched box.
  const headlineSpanRef = useRef<HTMLSpanElement>(null);
  const [headlineWidth, setHeadlineWidth] = useState<number>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function measure() {
      const el = headlineSpanRef.current;
      if (el) setHeadlineWidth(el.getBoundingClientRect().width);
    }
    measure();
    window.addEventListener('resize', measure);

    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('resize', measure);
      mql.removeEventListener('change', handleChange);
    };
  }, [headline]);

  // width: '100%' is set explicitly alongside maxWidth rather than relying
  // on flex-stretch to fill up to the cap — some text/break combinations
  // (e.g. a forced <br>) leave the box sized to its own content instead of
  // stretching, so without this it can render narrower than headlineWidth.
  // Matching the *box* width to the headline isn't enough on its own —
  // centered text still falls short of the box's edges on every line since
  // words wrap at their natural width, not the box's. text-align: justify
  // stretches each line's word-spacing to reach both edges, so the visible
  // glyphs — not just the invisible box — line up with the headline's
  // tightly-fit text. Deliberately NOT setting text-align-last: justify —
  // that would also stretch the final line, which looks broken when it's
  // only one or two words (e.g. "member-only ... perks." with a single
  // huge gap). Leaving the last line at its natural (shorter) width is
  // standard justified-text behavior, not a bug.
  const constrainedTextStyle = isMobile && headlineWidth
    ? {
        width: '100%',
        maxWidth: headlineWidth,
        marginInline: 'auto' as const,
        textAlign: 'justify' as const,
        // Centers just the short trailing line (justify's default leaves it
        // flush-left) — the stretched lines above are untouched by this.
        textAlignLast: 'center' as const,
      }
    : undefined;

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
    <section className="w-full px-0 md:px-10 py-10 flex flex-col md:flex-row items-center gap-12 md:gap-16">
      {/* Image */}
      <div className="relative w-full md:w-1/2 aspect-[4/3] bg-card-bg overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Copy + form — a single gap rhythm on the flex column keeps every
          visible block equally spaced, whether or not the error message
          is present, instead of one-off top/bottom margins per element. */}
      <div className="w-full md:w-1/2 max-w-xl flex flex-col gap-3 text-center md:text-left">
        <div className="flex flex-col gap-3">
          <h2 className="font-handwriting italic text-3xl pb-0">
            <span ref={headlineSpanRef} className="inline-block">{headline}</span>
          </h2>
          <p className="text-xs text-foreground leading-5">
            {subtext}
          </p>
        </div>

        {status === 'success' ? (
          <p className="text-xs border border-border px-4 py-4">
            thank you - you&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4.5 pt-2">
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                aria-label="Email address"
                className="peer flex-1 border border-input-fill border-r-0 px-4 py-3 text-xs text-left placeholder:text-muted focus:outline-none focus:border-foreground"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-input-fill border border-input-fill text-foreground px-6 py-3 text-xs tracking-widest uppercase hover:bg-foreground/90 hover:text-background transition-colors disabled:opacity-60 peer-focus:border-foreground"
              >
                {status === 'submitting' ? 'Signing up…' : 'CREATE'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-xs text-foreground/70 lowercase">{errorMessage}</p>
            )}
          </form>
        )}
        <p className="text-[9px] italic lowercase text-foreground/60 leading-relaxed">
          by creating your personal ère <span className="uppercase">ID</span>, you agree to receive marketing <br className="md:hidden" /> emails from ère and acknowledge our privacy policy.
        </p>
      </div>
    </section>
  );
}
