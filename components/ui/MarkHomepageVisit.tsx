'use client';

import { useEffect } from 'react';

// App Router client-side navigation never updates document.referrer, so the
// discount popup can't rely on it to detect "came from homepage" — this
// stamps a session flag instead, read by DiscountPopup on the New In page.
export default function MarkHomepageVisit() {
  useEffect(() => {
    sessionStorage.setItem('ere-visited-homepage', 'true');
  }, []);

  return null;
}
