import type { MetadataRoute } from 'next';

const LAUNCHED = process.env.LAUNCHED === 'true';

export default function robots(): MetadataRoute.Robots {
  if (!LAUNCHED) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return { rules: { userAgent: '*', allow: '/' } };
}
