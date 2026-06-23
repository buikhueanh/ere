"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { navLinks, supportLinks } from "@/config/navigation";
import Image from "next/image";
import { useCartContext } from "@/context/CartProvider";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, openCart } = useCartContext();
  const itemCount = cart?.totalQuantity ?? 0;
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-foreground/10">
      <nav className="w-full px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Hamburger Menu (visible on Mobile) */}
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

        {/* Left — nav links (hidden on Mobile)*/}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative text-xs tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Center — logo */}
        <Link
          href="/"
          aria-label="Home"
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
        >
          <Image
            src="/images/logo.png"
            alt="ére"
            width={40}
            height={20}
            priority
          />
        </Link>

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
      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-16 md:top-28 bg-background z-40 flex flex-col items-start justify-start gap-5 px-6 md:px-10 md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Main nav links */}
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="text-xs tracking-widest uppercase hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}

        <div className="h-4" />
        {/* Footer/support links */}

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
    </header>
  );
}
