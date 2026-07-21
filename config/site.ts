export const siteConfig = {
  name: 'ère',
  description: 'Curated luxury fashion for the discerning.',
  currency: 'USD',
  locale: 'en-US',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;
