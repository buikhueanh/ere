import type { Metadata } from "next";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import Image from "next/image";

export const metadata: Metadata = {
  title: "coming soon",
  robots: { index: false, follow: false },
};

// The pre-launch gate page (decision 010 §2): the signup module with
// teaser copy, no navbar (nothing to navigate to yet), site footer below.
export default function ComingSoonPage() {
  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col">
      {/* The navbar's shell, stripped to the wordmark alone — the gate has
          nothing to navigate to, so no links, search or cart. Classes are
          copied from components/layout/Navbar.tsx (px-6 md:px-10, h-15 pb-2,
          items-center) so the logo sits exactly where "sign up" does on the
          launched site. Kept as static markup rather than reusing <Navbar>,
          which is a client component wired to cart context and dropdowns that
          this page has no use for.

          Sized to that link's 30px line box (text-3xl leading-none); 73px is
          30px x the logo's 2.44:1 aspect ratio. The wrapper must be
          `relative` with explicit dimensions — <Image fill> positions against
          its nearest positioned ancestor, and with none it stretched across
          the entire page. */}
      <header className="w-full bg-background">
        <nav className="w-full px-6 md:px-10 h-15 pb-2 flex items-center">
          <div className="relative h-[30px] w-[73px]">
            <Image
              src="/images/logo-ere.png"
              alt="ère"
              fill
              priority
              className="object-contain object-left"
              sizes="73px"
            />
          </div>
        </nav>
      </header>

      <div className="flex-1 flex items-center">
        <NewsletterSignup
          headline="Be the first to know"
          subtext="ère is almost here, a curated edit of quiet, considered pieces. Leave your email and we'll write to you the moment the doors open."
          imageSrc="/images/hero/homepage.png"
        />
      </div>
    </div>
  );
}
