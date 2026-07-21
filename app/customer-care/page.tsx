import Link from 'next/link';
import { supportLinks } from '@/config/navigation';

// Customer care hub (decision 010 §3): the footer's "customer care" link
// lands here and fans out to the individual support pages.
export default function CustomerCarePage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl mb-8">Customer care</h1>
      <ul className="divide-y divide-border border-y border-border">
        {supportLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block py-4 text-sm hover:text-foreground/60 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
