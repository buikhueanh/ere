# 013 — Announcement bar modes (signup CTA vs promo ticker)

**Status:** Active (2026-09-11)

## Context

The announcement bar (`components/layout/AnnouncementBar.tsx`) hard-coded one
line of copy. Two kinds of content are needed: the "create your ère ID for 10%
off" call-to-action, which should open the `DiscountPopup` when clicked, and
ordinary promos (free shipping, seasonal sale) which should run continuously,
stock-ticker style. With nothing to announce the bar should disappear.

`DiscountPopup` was mounted separately on `/shop` and `/new-in` with its own
`isOpen` state, so the bar — which lives in the root layout — had no way to
open it, and on other pages there was no popup to open.

## Decision

1. **Content is config, not JSX.** `config/announcements.tsx` exports a list of
   `{ kind: 'signup' | 'promo', message, href? }`. Same pattern as
   `navigation.ts` / `customerCareSections.tsx`: a promo is a config edit.
2. **Mode is derived from the list** (`resolveAnnouncementMode`):
   - any `signup` item → **static** centred line, rendered as a `<button>` that
     opens the popup. Signup wins over promos: a moving CTA is unusable,
     especially on touch, so it is never in the ticker.
   - only `promo` items → **ticker**, all of them looping right-to-left.
   - empty → bar **not rendered**; navbar sits at the top.
3. **Popup open state lives in `AnnouncementBarContext`**
   (`discountOpen / openDiscount / closeDiscount`); `<DiscountPopup />` is
   mounted once in `app/layout.tsx`. Its first-visit **auto-open stays gated**
   to `/shop` and `/new-in` (`AUTO_OPEN_PATHS`); the bar click works anywhere.
4. **Bar sizing is unchanged** — 36px band, `bg-input-fill`, `text-xs
   lowercase`, scroll-gesture show/hide. Only the content inside changed.

## Ticker (`components/layout/PromoTicker.tsx`)

- Items laid out in one track, list duplicated (an even number of copies);
  CSS `translateX(0 → -50%)` on an infinite linear loop, so the hand-off is
  seamless. If the items are narrower than the bar the list is repeated so no
  gap slides through.
- Constant speed (40 px/s): duration is computed from measured content width,
  so pace is the same for one promo or five. Re-measured on resize.
- Pauses on hover / focus-within so a linked promo is clickable.
- `prefers-reduced-motion: reduce` → static centred line, duplicates hidden.
- Pure CSS animation, so it pauses natively in hidden tabs (no rAF; see the
  carousel entry in the changelog for why that matters).
- The pause and reduced-motion rules are plain CSS in `styles/globals.css`,
  not Tailwind `group-hover:` / `motion-reduce:` utilities: that file is
  unlayered, so its `animation` shorthand would override a layered utility's
  `animation-play-state`.

## Consequences

- Because the popup no longer remounts per page, the "10% off" side tab now
  persists across navigation for the rest of the session once the popup has
  been opened (before, it vanished on leaving `/shop`). Considered an
  improvement, not a regression.
- The per-page `ere-discount-popup-seen:<path>` session keys are unchanged,
  so `/shop` and `/new-in` each still auto-open once per session.

## Revisit when

- Promos need scheduling (start/end dates) — add optional fields to the config
  and filter in `resolveAnnouncementMode`; nothing else changes.
- Marketing wants signup *and* promos visible at once — the hybrid (signup
  pinned left, promos ticking right) was considered and deferred: it gets
  cramped below ~480px.
