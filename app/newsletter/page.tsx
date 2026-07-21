import type { Metadata } from 'next';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

export const metadata: Metadata = {
  title: 'newsletter',
};

// The homepage nav's "newsletter" link lands here (decision 010 §4) —
// same shared signup module as the gate page, post-launch copy.
export default function NewsletterPage() {
  return (
    <div className="min-h-[70vh] flex items-center">
      <NewsletterSignup
        headline="into the world of ère"
        subtext="join our private guest list to access exclusive content and member-only perks."
        imageSrc="/images/newsletter/newsletter.png"
      />
    </div>
  );
}
