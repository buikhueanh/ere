import { shopifyFetch } from './client';
import { GET_HOMEPAGE_SETTINGS_QUERY } from '@/lib/queries/homepage.queries';

export interface HomepageSettings {
  imageUrl: string;
  imageAlt: string | null;
  seasonLabel: string | null;
}

// Shape of one metaobject node as the Storefront API returns it — every
// field is nullable (definition missing, entry missing, field left blank).
export interface RawHomepageNode {
  image: { reference: { image: { url: string; altText: string | null } | null } | null } | null;
  seasonLabel: { value: string | null } | null;
}

// Falls back to null unless an image is actually set — the homepage keeps
// its bundled fallback image until the metaobject is fully configured.
export function normalizeHomepageSettings(
  nodes: Array<RawHomepageNode | null> | undefined
): HomepageSettings | null {
  const node = nodes?.[0];
  const image = node?.image?.reference?.image;
  if (!image?.url) return null;
  return {
    imageUrl: image.url,
    imageAlt: image.altText ?? null,
    seasonLabel: node?.seasonLabel?.value ?? null,
  };
}

export const HOMEPAGE_TAG = 'homepage';

export async function getHomepageSettings(): Promise<HomepageSettings | null> {
  try {
    const data = await shopifyFetch<{ metaobjects: { nodes: RawHomepageNode[] } }>({
      query: GET_HOMEPAGE_SETTINGS_QUERY,
      revalidate: 60,
      tags: [HOMEPAGE_TAG],
    });
    return normalizeHomepageSettings(data.metaobjects?.nodes);
  } catch {
    // Metaobject type not defined yet (or Storefront access off) — the
    // homepage falls back to its bundled image rather than erroring.
    return null;
  }
}
