import Link from 'next/link';
import { supportLinks } from '@/config/navigation';

// Customer care hub (decision 010 §3): the footer's "customer care" link
// lands here and fans out to the individual support pages.
export default function CustomerCarePage() {
  return (
    <div className="px-6 mx-auto py-24 max-w-lg">
      <h1 className="font-handwriting italic lowercase text-3xl mb-3">Customer care</h1>
      <ul className="divide-y divide-border border-y border-border">
        {supportLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block lowercase py-4 text-xs leading-none text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
