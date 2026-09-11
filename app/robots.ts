import type { MetadataRoute } from 'next';

const LAUNCHED = process.env.LAUNCHED === 'true';

export default function robots(): MetadataRoute.Robots {
  if (!LAUNCHED) {
    // Keep the icons crawlable even while gated — Google's favicon fetcher
    // obeys robots.txt, and a blanket disallow left it serving a stale icon
    // (and "site won't allow us" as the description) in search results.
    return {
      rules: {
        userAgent: '*',
        allow: ['/icon.png', '/apple-icon.png'],
        disallow: '/',
      },
    };
  }
  return { rules: { userAgent: '*', allow: '/' } };
}
