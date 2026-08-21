import Image from 'next/image';
import Link from 'next/link';
import { getHomepageSettings } from '@/lib/shopify/homepage';
import HeroCarousel from '@/components/ui/HeroCarousel';

// Bundled fallback images, shown as an auto-advancing carousel whenever no
// custom image is set in Shopify Admin (decision 010 §5 default).
const FALLBACK_IMAGES = [
  '/images/hero/homepage.png',
  '/images/hero/homepage3.png',
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
    // Height = exactly the space left between the navbar (h-16 = 4rem) and
    // footer (h-24 = 6rem), so the hero can grow as large as possible
    // without ever pushing the footer past the bottom of the screen.
    <div className="h-[calc(100dvh-4rem-6rem)] flex flex-col items-center justify-center px-6 py-6 gap-4">
      <Link
        href="/new-in"
        aria-label="Explore new in"
        className="relative block w-screen mx-[calc(50%-50vw)] flex-1 min-h-0"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-contain"
            sizes="100vw"
          />
        ) : (
          <HeroCarousel images={FALLBACK_IMAGES} alt={imageAlt} />
        )}
      </Link>

      {settings?.seasonLabel && (
        <p className="text-xs tracking-widest text-foreground/60 shrink-0">{settings.seasonLabel}</p>
      )}
    </div>
  );
}
