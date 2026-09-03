"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Plus, Minus } from "lucide-react";
import { navLinks, footerLinks } from "@/config/navigation";
import { shopCategories } from "@/config/shop-categories";
import { useCartContext } from "@/context/CartProvider";
import { useAnnouncementBar, ANNOUNCEMENT_BAR_HEIGHT } from "./AnnouncementBarContext";
import NavDropdown from "./NavDropdown";
import ProductGrid from "@/components/product/ProductGrid";
import type { ShopifyProductCard } from "@/types/shopify.types";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ShopifyProductCard[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cart, openCart } = useCartContext();
  const itemCount = cart?.totalQuantity ?? 0;
  const pathname = usePathname();
  const { visible: announcementVisible } = useAnnouncementBar();

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
  }

  // Any navigation (e.g. clicking a result) should close the search
  // overlay rather than leaving it open behind the new page. Reset during
  // render (not an effect) per React's guidance for state that depends on
  // a changed prop — avoids an extra commit/cascading-render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    closeSearch();
  }

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  async function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.products);
    } finally {
      setIsSearching(false);
    }
  }

  const openDropdown = (key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(key);
  };
  const closeDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  // The pre-launch gate page has no navbar by design (decision 010 §2).
  if (pathname === "/coming-soon") return null;

  // Two variants (decision 010 §4): the homepage shows only "newsletter" +
  // search/cart; everywhere else shows the full in-site links.
  const isHomepage = pathname === "/";

  return (
    <header
      className="sticky z-50 bg-background transition-[top] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ top: announcementVisible ? ANNOUNCEMENT_BAR_HEIGHT : 0 }}
    >
     <nav className="relative w-full px-6 md:px-10 h-15 pb-2 grid grid-cols-3 items-center">
        {/* Left — homepage: newsletter link (desktop only) · in-site: hamburger (mobile) +
            nav links (desktop). */}
        <div className="flex items-center gap-4 justify-self-start">
          {isHomepage ? (
            <Link
              href="/newsletter"
              className="hidden sm:block font-script text-3xl leading-none hover:text-foreground/70 transition-colors"
            >
              sign up
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
              <div
                onMouseEnter={() => {
                  if (closeTimer.current) clearTimeout(closeTimer.current);
                }}
                onMouseLeave={closeDropdown}
                className="h-14 flex items-center"
              >
                <ul className="hidden md:flex items-stretch gap-12">
                  {navLinks.map((link) => {
                    const isShop = link.href === "/shop";
                    const isBrands = link.href === "/brands";
                    return (
                      <li
                        key={link.href}
                        className="h-full flex items-center"
                        onMouseEnter={() => {
                          if (isShop || isBrands) {
                            openDropdown(link.href);
                          } else {
                            if (closeTimer.current)
                              clearTimeout(closeTimer.current);
                            setActiveDropdown(null);
                          }
                        }}
                      >
                        <Link
                          href={link.href}
                          className="font-script text-3xl leading-none text-foreground hover:text-foreground/60 transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {activeDropdown === "/shop" && (
                  <NavDropdown items={shopDropdownItems} pathname={pathname} />
                )}
                {activeDropdown === "/brands" && vendors.length > 0 && (
                  <NavDropdown
                    items={vendors.map((v) => ({
                      key: v,
                      label: v,
                      href: `/brands/${encodeURIComponent(v)}`,
                    }))}
                    pathname={pathname}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Center — always the logo. justify-self-center keeps it centered
        regardless of left/right content width. On the homepage it links to New In; everywhere else it links back home */}
        <Link
          href={isHomepage ? "/new-in" : "/"}
          aria-label={isHomepage ? "New In" : "Home"}
          className="relative block w-18 h-6 justify-self-center"
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
          <button onClick={() => setIsSearchOpen(true)} aria-label="Search">
            <Search
              size={18}
              strokeWidth={1.5}
              className="text-foreground/70 hover:text-foreground transition-colors"
            />
          </button>
          {/* Always points at /account, which shows either the account itself
              or a sign-in prompt — one entry point covering both states. The
              session cookie is httpOnly, so this client component can't read
              it to show a signed-in state; that would need the header to
              become a server component.

              prefetch={false} is deliberate: /account is per-customer and
              cookie-dependent, so prefetching it is wasted work on every page
              view — and it was the direct cause of an auth bug where
              background prefetches clobbered in-flight login cookies. */}
          <Link href="/account" prefetch={false} aria-label="Account">
            <User
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

      {/* Search takeover — replaces the nav row in place so the header
          height never changes, rather than pushing content down. */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-10 h-15 pb-2 bg-background flex items-center gap-4 px-6 md:px-10">
          <Search size={18} strokeWidth={1.5} className="text-foreground/50 shrink-0" />
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              aria-label="Search products"
              className="w-full bg-transparent text-sm lowercase text-foreground placeholder:text-muted focus:outline-none"
            />
          </form>
          <button
            onClick={closeSearch}
            aria-label="Close search"
            className="shrink-0 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Search results panel */}
      {isSearchOpen && searchResults !== null && (
        <div className="absolute inset-x-0 top-full bg-background border-t border-border max-h-[70vh] overflow-y-auto px-6 md:px-10 py-8 shadow-lg">
          {isSearching ? (
            <p className="text-xs tracking-widest lowercase text-muted text-center py-12">
              searching…
            </p>
          ) : (
            <ProductGrid products={searchResults} />
          )}
        </div>
      )}

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
