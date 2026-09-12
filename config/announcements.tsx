import type { ReactNode } from 'react';

// What the announcement bar shows. Edit this list to change the bar — no
// component changes needed (same pattern as navigation.ts).
//
// The bar picks its mode from the list's contents:
//   - a `signup` item present  → static, centred line; clicking it opens the
//                                 DiscountPopup. Takes precedence over promos
//                                 because it is a single click target and a
//                                 moving CTA is unusable, especially on touch.
//   - only `promo` items       → every promo runs in a continuous ticker.
//   - empty list               → the bar is not rendered at all.
export type Announcement =
  | { id: string; kind: 'signup'; message: ReactNode }
  | { id: string; kind: 'promo'; message: ReactNode; href?: string };

export const announcements: Announcement[] = [
  {
    id: 'signup-10',
    kind: 'signup',
    message: (
      <>
        create your ère ID & enjoy 10% off* your first purchase
      </>
    ),
  },
  // Example promos — remove the signup item above to run these as a ticker:
  // { id: 'free-shipping', kind: 'promo', message: (
  //     <>
  //       <span className="uppercase">free shipping on all orders</span>
  //     </>
  //   ), },
  // { id: 'ss26', kind: 'promo', message: 'ss26 preview — 15% off outerwear through sunday', href: '/shop' },
];

/** Resolves the bar's mode from the list (see the note above). */
export function resolveAnnouncementMode(items: Announcement[]) {
  const signup = items.find((a) => a.kind === 'signup');
  if (signup) return { mode: 'signup' as const, item: signup };
  const promos = items.filter((a) => a.kind === 'promo');
  if (promos.length > 0) return { mode: 'ticker' as const, items: promos };
  return { mode: 'hidden' as const };
}
