'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Shared between AnnouncementBar and Navbar so the sticky navbar can shift
// down/up in step with the announcement bar's scroll-triggered show/hide on
// the homepage (decision: quick-fix spec, 2026-08-21).
export const ANNOUNCEMENT_BAR_HEIGHT = 36;

type AnnouncementBarContextValue = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  // DiscountPopup's open state lives here rather than in the popup itself so
  // the bar's signup line can open it. The popup is mounted once in the root
  // layout; the bar and the popup never render each other.
  discountOpen: boolean;
  openDiscount: () => void;
  closeDiscount: () => void;
};

const AnnouncementBarContext = createContext<AnnouncementBarContextValue>({
  visible: false,
  setVisible: () => {},
  discountOpen: false,
  openDiscount: () => {},
  closeDiscount: () => {},
});

export function AnnouncementBarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const openDiscount = useCallback(() => setDiscountOpen(true), []);
  const closeDiscount = useCallback(() => setDiscountOpen(false), []);
  return (
    <AnnouncementBarContext.Provider
      value={{ visible, setVisible, discountOpen, openDiscount, closeDiscount }}
    >
      {children}
    </AnnouncementBarContext.Provider>
  );
}

export function useAnnouncementBar() {
  return useContext(AnnouncementBarContext);
}
