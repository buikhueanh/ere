import type { Metadata } from 'next';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

export const metadata: Metadata = {
  title: 'coming soon',
  robots: { index: false, follow: false },
};

// The pre-launch gate page (decision 010 §2): the signup module with
// teaser copy, no navbar (nothing to navigate to yet), site footer below.
export default function ComingSoonPage() {
  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col">
      {/* Wordmark, top-left — plain text in the script font */}
      <p className="font-script text-3xl px-6 md:px-10 pt-8">ère</p>

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
