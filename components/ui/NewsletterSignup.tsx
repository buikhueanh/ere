'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { joinNewsletter } from '@/lib/shopify/customer';
import { isValidEmail } from '@/lib/newsletter';

interface NewsletterSignupProps {
  headline: string;
  subtext: string;
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
    <section className="w-full px-6 md:px-10 py-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
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
      <div className="w-full md:w-1/2 max-w-xl flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="font-handwriting italic text-3xl pb-0">{headline}</h2>
          <p className="text-xs text-foreground leading-none">{subtext}</p>
        </div>

        {status === 'success' ? (
          <p className="text-xs border border-border px-4 py-4">
            thank you - you&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-2">
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                aria-label="Email address"
                className="peer flex-1 border border-input-fill border-r-0 px-4 py-3 text-xs placeholder:text-muted focus:outline-none focus:border-foreground"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-input-fill border border-input-fill text-foreground px-6 py-3 text-xs tracking-widest uppercase hover:bg-foreground/90 hover:text-background transition-colors disabled:opacity-60 peer-focus:border-foreground"
              >
                {status === 'submitting' ? 'Signing up…' : 'Sign Up'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-xs text-foreground/70 lowercase">{errorMessage}</p>
            )}
            <p className="text-xs text-foreground lowercase pt-2">
              By signing up, you agree to receive email updates from ère and
              acknowledge our privacy policy, Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
