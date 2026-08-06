'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface HeroCarouselProps {
  images: string[];
  alt: string;
}

const TRANSITION_INTERVAL_MS = 5000;

// Auto-advancing sliding carousel for the homepage hero — no arrows, no
// dots, loops indefinitely. All slides stay mounted and animate their own
// x position directly (rather than mounting/unmounting via AnimatePresence)
// so there's no exit-animation choreography to get wrong.
export default function HeroCarousel({ images, alt }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    console.log('[HeroCarousel] effect mount, images.length=', images.length);
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      console.log('[HeroCarousel] tick');
      setIndex((i) => (i + 1) % images.length);
    }, TRANSITION_INTERVAL_MS);
    return () => {
      console.log('[HeroCarousel] cleanup');
      clearInterval(timer);
    };
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((src, i) => (
        <motion.div
          key={src}
          animate={{ x: `${(i - index) * 100}%` }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={i === 0}
            className="object-contain"
            sizes="100vw"
          />
        </motion.div>
      ))}
    </div>
  );
}
