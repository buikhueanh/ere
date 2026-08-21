import Link from "next/link";
import { footerLinks } from "@/config/navigation";

const [aboutUsLink, customerCareLink] = footerLinks;

// One universal footer layout, every page: about us bottom-left, copyright
// center, customer care bottom-right. Dev credit intentionally left out for
// now (quick-fix spec, 2026-07-xx) — previously this varied by page
// (homepage/about/other), now unified.
export default function Footer() {
  return (
    <footer className="w-full bottom-0 px-6 md:px-10 py-4 grid grid-cols-3 items-end gap-6">
      <Link
        href={aboutUsLink.href}
        className="text-xs leading-none text-foreground/70 hover:text-foreground transition-colors justify-self-start"
      >
        {aboutUsLink.label}
      </Link>

      <Link
        href={customerCareLink.href}
        className="text-xs leading-none text-foreground/70 hover:text-foreground transition-colors justify-self-center"
      >
        {customerCareLink.label}
      </Link>

      <div className="relative group justify-self-end">
        <p
         
          className="text-xs lowercase leading-none text-foreground/70 hover:text-foreground transition-colors cursor-default"
        >
          © 2026 ère
        </p>

      </div>
    </footer>
  );
}
