'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

interface HeroCarouselProps {
  images: string[];
  alt: string;
}

const TRANSITION_INTERVAL_MS = 5000;

// Auto-advancing sliding carousel for the homepage hero — no arrows, no
// dots, loops indefinitely, always moves left-to-right: the current image
// exits to the right while the next one enters from the left.
//
// `step` only ever increases (never wraps) and is used as the React key, so
// every showing of an image is a fresh mount with a fixed enter-left /
// exit-right lifecycle — this avoids the "which side does the other image
// live on" ambiguity that comes from cycling a plain 0/1 index back and
// forth, which would make the motion reverse direction on every other loop.
export default function HeroCarousel({ images, alt }: HeroCarouselProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    // Backgrounded tabs still fire setInterval (just throttled) even though
    // requestAnimationFrame — which drives the actual slide animation — is
    // fully paused while hidden. Without this, `step` keeps incrementing in
    // the background and every missed transition tries to animate at once
    // the moment the tab becomes visible again. Tearing the interval down
    // while hidden and starting a fresh one on return avoids that backlog.
    let timer: ReturnType<typeof setInterval> | null = null;

    function start() {
      timer = setInterval(() => {
        setStep((s) => s + 1);
      }, TRANSITION_INTERVAL_MS);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function handleVisibilityChange() {
      if (document.hidden) {
        stop();
      } else {
        stop();
        start();
      }
    }

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [images.length]);

  const currentSrc = images[step % images.length];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={step}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <Image
            src={currentSrc}
            alt={alt}
            fill
            priority={step === 0}
            className="object-contain"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
