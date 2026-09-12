import { describe, it, expect } from 'vitest';
import { resolveAnnouncementMode, type Announcement } from '@/config/announcements';

const signup: Announcement = { id: 's', kind: 'signup', message: 'sign up' };
const promoA: Announcement = { id: 'a', kind: 'promo', message: 'free shipping' };
const promoB: Announcement = { id: 'b', kind: 'promo', message: 'sale', href: '/shop' };

describe('resolveAnnouncementMode', () => {
  it('hides the bar when nothing is configured', () => {
    expect(resolveAnnouncementMode([])).toEqual({ mode: 'hidden' });
  });

  it('runs promos as a ticker when there is no signup item', () => {
    expect(resolveAnnouncementMode([promoA, promoB])).toEqual({ mode: 'ticker', items: [promoA, promoB] });
  });

  it('shows the static signup line, and it wins over promos', () => {
    expect(resolveAnnouncementMode([promoA, signup, promoB])).toEqual({ mode: 'signup', item: signup });
  });
});
