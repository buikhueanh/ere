"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Plus, Minus } from "lucide-react";
import { navLinks, footerLinks } from "@/config/navigation";
import { shopCategories } from "@/config/shop-categories";
import { useCartContext } from "@/context/CartProvider";
import NavDropdown from "./NavDropdown";

interface NavbarProps {
  vendors: string[];
}

const shopDropdownItems = [
  { key: "all-items", label: "all items", href: "/shop" },
  ...shopCategories.map((c) => ({
    key: c.key,
    label: c.label,
    href: `/shop/${c.key}`,
  })),
];

export default function Navbar({ vendors }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { cart, openCart } = useCartContext();
  const itemCount = cart?.totalQuantity ?? 0;
  const pathname = usePathname();

  const openDropdown = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(key);
  };
  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  // The pre-launch gate page has no navbar by design (decision 010 §2).
  if (pathname === "/coming-soon") return null;

  // Two variants (decision 010 §4): the homepage shows only "newsletter" +
  // search/cart; everywhere else shows the full in-site links.
  const isHomepage = pathname === "/";

  return (
    <header className="relative sticky top-0 pt-3 pb-4 z-50 bg-background">
      <nav className="w-full px-6 md:px-10 h-16 grid grid-cols-3 items-center">
        {/* Left — homepage: newsletter link (desktop only) · in-site: hamburger (mobile) +
            nav links (desktop). */}
        <div className="flex items-center gap-4 justify-self-start">
          {isHomepage ? (
            <Link
              href="/newsletter"
              className="hidden sm:block font-script text-4xl hover:text-foreground/70 transition-colors"
            >
              newsletter
            </Link>
          ) : (
            <>
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
              <ul className="hidden md:flex items-stretch gap-12">
                {navLinks.map((link) => {
                  const isShop = link.href === "/shop";
                  const isBrands = link.href === "/brands";
                  return (
                    <li
                      key={link.href}
                      className="flex items-center"
                      onMouseEnter={() =>
                        isShop || isBrands ? openDropdown(link.href) : undefined
                      }
                      onMouseLeave={closeDropdown}
                    >
                      <Link
                        href={link.href}
                        className="font-script text-4xl text-foreground hover:text-foreground/60 transition-colors"
                      >
                        {link.label}
                      </Link>
                      {isShop && activeDropdown === link.href && (
                        <div
                          onMouseEnter={() => openDropdown(link.href)}
                          onMouseLeave={closeDropdown}
                        >
                          <NavDropdown
                            items={shopDropdownItems}
                            pathname={pathname}
                          />
                        </div>
                      )}
                      {isBrands &&
                        vendors.length > 0 &&
                        activeDropdown === link.href && (
                          <div
                            onMouseEnter={() => openDropdown(link.href)}
                            onMouseLeave={closeDropdown}
                          >
                            <NavDropdown
                              items={vendors.map((v) => ({
                                key: v,
                                label: v,
                                href: `/brands/${encodeURIComponent(v)}`,
                              }))}
                              pathname={pathname}
                            />
                          </div>
                        )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Center — always the logo. justify-self-center keeps it centered
              regardless of left/right content width. On the homepage it links to New In; everywhere else it links back home */}
        <Link
          href={isHomepage ? "/new-in" : "/"}
          aria-label={isHomepage ? "New In" : "Home"}
          className="relative block w-24 h-8 justify-self-center"
        >
          <Image
            src="/images/logo-ere.png"
            alt="ère"
            fill
            className="object-contain"
          />
        </Link>

        {/* Right — actions */}
        <div className="flex items-center gap-5 justify-self-end">
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
          {navLinks.map((link) => {
            const isShop = link.href === "/shop";
            const isBrands = link.href === "/brands";
            const isExpandable = isShop || isBrands;
            const subItems = isShop
              ? shopDropdownItems
              : isBrands
                ? vendors.map((v) => ({
                    key: v,
                    label: v,
                    href: `/brands/${encodeURIComponent(v)}`,
                  }))
                : [];
            const isExpanded = mobileExpanded === link.href;

            return (
              <div key={link.href} className="w-full">
                {/* w-full + justify-between on every row means the +/-
                    button always lands at the same right-hand x position,
                    so shop's and brands' toggles line up vertically even
                    though their labels are different widths. */}
                <div className="flex items-center justify-between w-full">
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-script text-3xl hover:text-foreground/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                  {isExpandable && subItems.length > 0 && (
                    <button
                      onClick={() =>
                        setMobileExpanded(isExpanded ? null : link.href)
                      }
                      aria-label={
                        isExpanded
                          ? `Collapse ${link.label}`
                          : `Expand ${link.label}`
                      }
                      className="w-6 flex justify-center text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <Minus size={14} strokeWidth={1.5} />
                      ) : (
                        <Plus size={14} strokeWidth={1.5} />
                      )}
                    </button>
                  )}
                </div>

                {isExpandable && isExpanded && (
                  <ul className="mt-3 pl-4 flex flex-col gap-3">
                    {subItems.map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="text-xs lowercase text-foreground/70 hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <div className="h-4" />

          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-xs tracking-widest lowercase hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
