import type { NavLink } from '@/types/global.types';

// In-site nav (decision 010 §4): every page except the homepage and the
// coming-soon gate. Rendered in the script font.
export const navLinks: NavLink[] = [
  { label: 'shop', href: '/shop' },
  { label: 'new in', href: '/new-in' },
  { label: 'brands', href: '/brands' },
];

// Footer links (decision 010 §3). Customer care is a hub page that lists
// the support links below.
export const footerLinks: NavLink[] = [
  { label: 'about us', href: '/about' },
  { label: 'customer care', href: '/customer-care' },
];

export const supportLinks: NavLink[] = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];
