import Link from "next/link";
import { supportLinks } from "@/config/navigation";

export default function Footer() {
  return (
    <footer className="pt-10 pb-5 flex flex-row items-end justify-between px-10">
      {/* support links */}
      <div className="flex flex-col items-start gap-3 md:contents">
        {supportLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs tracking-widest uppercase text-foreground/50 hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* copyright */}
      <p className="text-xs text-foreground/50">
        © 2026 <Link href="/">ére</Link>
      </p>
    </footer>
  );
}
