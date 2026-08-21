'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Shared between AnnouncementBar and Navbar so the sticky navbar can shift
// down/up in step with the announcement bar's scroll-triggered show/hide on
// the homepage (decision: quick-fix spec, 2026-08-21).
export const ANNOUNCEMENT_BAR_HEIGHT = 36;

type AnnouncementBarContextValue = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

const AnnouncementBarContext = createContext<AnnouncementBarContextValue>({
  visible: false,
  setVisible: () => {},
});

export function AnnouncementBarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <AnnouncementBarContext.Provider value={{ visible, setVisible }}>
      {children}
    </AnnouncementBarContext.Provider>
  );
}

export function useAnnouncementBar() {
  return useContext(AnnouncementBarContext);
}
