import Image from 'next/image';
import Link from 'next/link';
import { getHomepageSettings } from '@/lib/shopify/homepage';
import HeroCarousel from '@/components/ui/HeroCarousel';

// Bundled fallback images, shown as an auto-advancing carousel whenever no
// custom image is set in Shopify Admin (decision 010 §5 default).
const FALLBACK_IMAGES = [
  '/images/hero/image.png',
  '/images/hero/hp-placeholder.jpeg',
];

// Minimal post-launch homepage (decision 010 §5): one centered seasonal
// image — clicking it is the only path deeper into the site (→ New In).
// Image + season label are editable in Shopify Admin via the
// homepage_settings metaobject; falls back to a carousel of the bundled
// images until a custom one is configured.
export default async function HomePage() {
  const settings = await getHomepageSettings();

  const imageUrl = settings?.imageUrl;
  const imageAlt = settings?.imageAlt ?? 'ère — seasonal collection';

  return (
    // Height = exactly the space left between the navbar and footer.
    // `flex-1` (not a guessed calc(), and not h-full — a flex item's
    // flex-grow-derived height isn't a definite height for CSS
    // percentage-height children) lets flexbox do this correctly: main is
    // flex-col (see app/layout.tsx) so this fills whatever space is
    // actually left after the real (possibly announcement-bar-shifted)
    // navbar and the footer — no hardcoded navbar/footer height to keep in
    // sync. `-mb-5` cancels out the root layout's h-5 scroll-buffer div
    // between `main` and the footer, so the image touches the footer
    // exactly instead of stopping 20px short of it.
    <div className="relative flex-1 -mb-5">
      <Link
        href="/new-in"
        aria-label="Explore new in"
        // absolute + inset-y-0 (not h-full) — same flex-percentage-height
        // issue as the wrapping div: this Link's own height needs to match
        // its parent's real computed height exactly, and only absolute
        // positioning resolves against that directly.
        className="absolute inset-y-0 w-screen mx-[calc(50%-50vw)]"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <HeroCarousel images={FALLBACK_IMAGES} alt={imageAlt} />
        )}
      </Link>

      {settings?.seasonLabel && (
        <p className="absolute inset-x-0 bottom-4 text-center text-xs tracking-widest text-foreground/60">
          {settings.seasonLabel}
        </p>
      )}
    </div>
  );
}
