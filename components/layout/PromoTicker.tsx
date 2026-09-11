'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Announcement } from '@/config/announcements';

// Constant speed in px/s regardless of how much copy there is — a fixed
// duration would make one long promo crawl and three short ones sprint.
const SPEED_PX_PER_S = 80;

// Continuous right-to-left marquee of promo items, stock-ticker style.
//
// The item list is laid out twice back-to-back and the track animates from
// 0 to -50%; at the end of one cycle the second copy sits exactly where the
// first started, so the loop restarts with no visible jump. If the items
// are narrower than the bar the list is repeated more times so there is
// never an empty gap sliding through. CSS animation (not rAF) so it pauses
// natively in hidden tabs — the carousel's stacking bug from earlier came
// from rAF-based timing, not applicable here.
//
// Pauses on hover/focus so a linked promo is actually clickable, and is
// replaced by a static centred line under prefers-reduced-motion — both in
// globals.css next to the keyframes (see the note there on why not
// Tailwind variants).
export default function PromoTicker({ items }: { items: Announcement[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [durationS, setDurationS] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const group = groupRef.current;
    if (!container || !group) return;

    function measure() {
      if (!container || !group) return;
      const groupWidth = group.scrollWidth;
      if (groupWidth === 0) return;
      // Enough copies that one full set plus the gap still covers the bar,
      // then doubled so the -50% translate always has a twin to hand off to.
      const perHalf = Math.max(1, Math.ceil(container.clientWidth / groupWidth));
      setCopies(perHalf * 2);
      setDurationS((groupWidth * perHalf) / SPEED_PX_PER_S);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [items]);

  const group = (
    <>
      {items.map((item) => {
        const content = (
          <span className="whitespace-nowrap px-5">{item.message}</span>
        );
        return item.kind === 'promo' && item.href ? (
          <Link key={item.id} href={item.href} className="">
            {content}
          </Link>
        ) : (
          <span key={item.id}>{content}</span>
        );
      })}
    </>
  );

  return (
    <div ref={containerRef} className="ticker h-full w-full overflow-hidden">
      <div
        className="ticker-track flex h-full w-max items-center"
        style={{ animationDuration: durationS ? `${durationS}s` : undefined }}
      >
        {/* The first copy is the one we measure; it is also what reduced-
            motion viewers see, since the extra copies are hidden for them. */}
        <div ref={groupRef} className="flex items-center">
          {group}
        </div>
        {Array.from({ length: copies - 1 }, (_, i) => (
          <div key={i} aria-hidden className="flex items-center">
            {group}
          </div>
        ))}
      </div>
    </div>
  );
}
