"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { navLinks, supportLinks } from "@/config/navigation";
import { useCartContext } from "@/context/CartProvider";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, openCart } = useCartContext();
  const itemCount = cart?.totalQuantity ?? 0;
  const pathname = usePathname();

  // The pre-launch gate page has no navbar by design (decision 010 §2).
  if (pathname === "/coming-soon") return null;

  // Two variants (decision 010 §4): the homepage shows only "newsletter" +
  // search/cart; everywhere else shows the full in-site links.
  const isHomepage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-background">
      <nav className="w-full px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Hamburger (mobile, in-site only — homepage has just one link) */}
        {!isHomepage && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="md:hidden text-foreground/70 hover:text-foreground transition-colors"
          >
            {isMenuOpen ? (
              <X size={18} strokeWidth={1.5} />
            ) : (
              <Menu size={18} strokeWidth={1.5} />
            )}
          </button>
        )}

        {/* Left — homepage: newsletter link · in-site: script nav links */}
        {isHomepage ? (
          <Link
            href="/newsletter"
            className="font-script text-4xl hover:text-foreground/70 transition-colors"
          >
            newsletter
          </Link>
        ) : (
          <ul className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-script text-4xl text-foreground hover:text-foreground/60 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Right — actions */}
        <div className="flex items-center gap-5">
          <Link href="/search" aria-label="Search">
            <Search
              size={18}
              strokeWidth={1.5}
              className="text-foreground/70 hover:text-foreground transition-colors"
            />
          </Link>
          <button onClick={openCart} aria-label="Cart" className="relative">
            <ShoppingBag
              size={18}
              strokeWidth={1.5}
              className="text-foreground/70 hover:text-foreground transition-colors"
            />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-foreground text-background text-[10px] leading-none tabular-nums">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay (in-site variant only) */}
      {!isHomepage && (
        <div
          className={`fixed inset-0 top-16 bg-background z-40 flex flex-col items-start justify-start gap-5 px-6 md:px-10 md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="font-script text-3xl hover:text-foreground/60 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="h-4" />

          {supportLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-xs tracking-widest uppercase text-foreground/50 hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
