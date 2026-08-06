"use client";
import { usePathname } from "next/navigation";

// Top-of-page shipping banner, scrolls away above the sticky navbar
// (decision: quick-fix spec, 2026-08-06).
export default function AnnouncementBar() {
  const pathname = usePathname();


  // No banner on the pre-launch gate (decision 010 §2).
  if (pathname === "/coming-soon" || pathname === "/") return null;

  return (
    <div className="relative w-full bg-input-fill px-10 py-2 text-center">
      <p className="text-xs text-foreground lowercase leading-none">
        Free shipping for orders of $250+ within the continental US
      </p>
    </div>
  );
}
