import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "@/config/navigation";

// New footer (decision 010 §3): about us · customer care left, copyright
// centered, script ère wordmark bottom-right (links home).
export default function Footer() {
  return (
    // Grid instead of flex + absolute positioning: all four items (links,
    // copyright, logo) are real grid children sharing one items-end
    // baseline, so they're guaranteed to bottom-align — an absolutely
    // positioned copyright can't reliably match its siblings' baseline.
    <footer className="w-full px-6 md:px-10 py-6 grid grid-cols-3 items-end gap-6">
      <div className="flex items-end gap-8 justify-self-start">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-base leading-none text-foreground/70 hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <p className="text-base leading-none text-foreground/50 justify-self-center">© 2026 ère</p>

      {/* object-bottom anchors the logo to the box's bottom edge — without
          it, object-contain centers the image, leaving equal transparent
          space above and below whenever the PNG's aspect ratio doesn't
          exactly match the box. */}
      <Link href="/" aria-label="Home" className="relative block w-32 h-12 justify-self-end -translate-y-1">
        <Image src="/images/logo-ere.png" alt="ère" fill className="object-contain object-bottom" />
      </Link>
    </footer>
  );
}
