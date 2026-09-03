"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnnouncementBar, ANNOUNCEMENT_BAR_HEIGHT } from "./AnnouncementBarContext";

// Top-of-page shipping banner, shared identically across every page: stays
// hidden by default and only appears while the user is actively scrolling
// up, hiding again as soon as they scroll down.
//
// The homepage's content is sized to exactly fill the viewport
// (100dvh - navbar - footer, see app/page.tsx), so it never actually
// scrolls there — window.scrollY never changes. The show/hide is driven by
// the scroll *gesture* itself (wheel delta on desktop, touch drag on
// mobile) rather than scroll position, so the same logic works everywhere
// without depending on whether the page actually scrolls (decision:
// quick-fix spec, 2026-08-21).
export default function AnnouncementBar() {
  const pathname = usePathname();
  const { visible, setVisible } = useAnnouncementBar();
  const lastTouchY = useRef(0);

  useEffect(() => {
    setVisible(true);

    function handleWheel(e: WheelEvent) {
      if (e.deltaY > 5) {
        setVisible(false);
      } else if (e.deltaY < -5) {
        setVisible(true);
      }
    }

    function handleTouchStart(e: TouchEvent) {
      lastTouchY.current = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      const currentY = e.touches[0].clientY;
      const delta = lastTouchY.current - currentY;

      // Finger moving up the screen = content scrolling down, and vice versa.
      if (delta > 5) {
        setVisible(false);
      } else if (delta < -5) {
        setVisible(true);
      }
      lastTouchY.current = currentY;
    }

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [setVisible]);

  // No banner on the pre-launch gate (decision 010 §2).
  if (pathname === "/coming-soon") return null;

  return (
    <div
      style={{ height: visible ? ANNOUNCEMENT_BAR_HEIGHT : 0 }}
      className="sticky top-0 z-50 w-full overflow-hidden bg-input-fill transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <p
        style={{ height: ANNOUNCEMENT_BAR_HEIGHT }}
        className={`flex items-center justify-center px-10 text-center text-xs text-foreground lowercase leading-none transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        free shipping for orders of $300+ within the united states
      </p>
    </div>
  );
}
