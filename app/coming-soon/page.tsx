import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import TypewriterText from "@/components/ui/TypewriterText";

export const metadata: Metadata = {
  title: "coming soon",
  robots: { index: false, follow: false },
};

// The pre-launch gate page (decision 010 §2): the signup module with
// teaser copy, no navbar links (nothing to navigate to yet — the logo isn't
// a link either, via Navbar's isComingSoon variant), site footer below.
export default function ComingSoonPage() {
  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
      <Navbar isComingSoon />

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-10">
        <TypewriterText
          text="Coming soon. Stay tuned x"
          className="text-xs sm:text-sm text-foreground lowercase"
        />
      </div>
    </div>
  );
}
