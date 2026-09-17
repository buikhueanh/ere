"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Plus, Minus } from "lucide-react";
import { navLinks } from "@/config/navigation";
import { shopCategories } from "@/config/shop-categories";
import { useCartContext } from "@/context/CartProvider";
import { useAnnouncementBar, ANNOUNCEMENT_BAR_HEIGHT } from "./AnnouncementBarContext";
import NavDropdown from "./NavDropdown";
import Footer from "./Footer";
import ProductGrid from "@/components/product/ProductGrid";
import type { ShopifyProductCard } from "@/types/shopify.types";

interface NavbarProps {
  vendors?: string[];
  /** Pre-launch gate variant (decision 010 §2): centered logo only, not a
   * link — there's nowhere for it to navigate to yet. */
  isComingSoon?: boolean;
}

const shopDropdownItems = [
  { key: "all-items", label: "all items", href: "/shop" },
  ...shopCategories.map((c) => ({
    key: c.key,
    label: c.label,
    href: `/shop/${c.key}`,
  })),
];

export default function Navbar({ vendors = [], isComingSoon = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ShopifyProductCard[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // Measured live rather than assumed (e.g. a hardcoded top-15/60px) so the
  // mobile menu panel's top offset can never drift out of sync with the
  // nav row's real rendered height — a hardcoded guess left a sub-pixel
  // seam on some devices/DPRs even though it matched exactly in testing.
  const [navHeight, setNavHeight] = useState(60);
  const { cart, openCart } = useCartContext();
  const itemCount = cart?.totalQuantity ?? 0;
  const pathname = usePathname();
  const {
    visible: announcementVisible,
    setVisible: setAnnouncementVisible,
    setMenuOpen: setAnnouncementMenuOpen,
  } = useAnnouncementBar();

  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
  }

  // Any navigation (e.g. clicking a result, or a link inside the embedded
  // Footer below) should close the search overlay / mobile menu rather than
  // leaving them open behind the new page — the individual onClick handlers
  // on the panel's own nav links cover most cases, but Footer's links have
  // no way to reach setIsMenuOpen, so this catches those too. Reset during
  // render (not an effect) per React's guidance for state that depends on
  // a changed prop — avoids an extra commit/cascading-render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    closeSearch();
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Keeps navHeight in sync with the nav row's real rendered height —
  // measured (via ResizeObserver) rather than assumed, so it can't drift
  // from whatever the browser/device actually renders even by a sub-pixel.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setNavHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mobile menu panel (md:hidden variant only — desktop has no hamburger,
  // so isMenuOpen never becomes true there): forcing the announcement bar
  // hidden while open keeps the header at a fixed top:0/height:60px, which
  // is what lets the panel's top offset below line up with zero gap; body
  // scroll is locked so the product grid behind the panel can't scroll.
  // setAnnouncementMenuOpen also tells AnnouncementBar's own scroll/touch
  // listeners to stand down while open — otherwise a swipe on the open
  // panel still reaches window and re-shows/hides the bar mid-gesture,
  // fighting this forced-hidden state. Closing restores the announcement
  // bar and hands scroll-driven show/hide back to AnnouncementBar.
  useEffect(() => {
    setAnnouncementMenuOpen(isMenuOpen);
    setAnnouncementVisible(!isMenuOpen);
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, setAnnouncementVisible, setAnnouncementMenuOpen]);

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

  // The layout's global navbar hides itself on the gate page — that page
  // renders its own <Navbar isComingSoon /> instance instead, further down.
  if (pathname === "/coming-soon" && !isComingSoon) return null;

  // Two variants (decision 010 §4): the homepage shows only "newsletter" +
  // search/cart; everywhere else shows the full in-site links.
  const isHomepage = pathname === "/";

  if (isComingSoon) {
    return (
      <header className="w-full bg-background">
        <nav className="w-full px-6 md:px-10 h-15 pb-2 flex items-center justify-center">
          <div className="relative w-18 h-6">
            <Image
              src="/images/logo-ere.png"
              alt="ère"
              fill
              priority
              className="object-contain object-center"
              sizes="72px"
            />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      className="sticky z-50 bg-background transition-[top] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ top: announcementVisible ? ANNOUNCEMENT_BAR_HEIGHT : 0 }}
    >
     <nav ref={navRef} className="relative w-full px-6 md:px-10 h-15 pb-2 grid grid-cols-3 items-center">
        {/* Left — homepage: newsletter link (desktop only) · in-site: hamburger (mobile) +
            nav links (desktop). */}
        <div className="flex items-center gap-4 justify-self-start">
          {isHomepage ? (
            <Link
              href="/new-in"
              className="font-script text-3xl leading-none hover:text-foreground/70 transition-colors"
            >
              shop
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
          className="relative block w-15 h-5 md:w-18 md:h-6 justify-self-center"
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

      {/* Search results panel — fills the rest of the viewport below the
          header (height = 100vh minus the header's own 60px plus whatever
          the announcement bar is currently adding above it), rather than
          the old flat max-h-[70vh] cap that left blank space under short
          result sets. */}
      {isSearchOpen && searchResults !== null && (
        <div
          style={{ height: `calc(100vh - ${60 + (announcementVisible ? ANNOUNCEMENT_BAR_HEIGHT : 0)}px)` }}
          className="absolute inset-x-0 top-full bg-background overflow-y-auto px-6 md:px-10 py-8 shadow-lg"
        >
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
          style={{ top: navHeight }}
          className={`fixed inset-x-0 bottom-0 bg-background z-40 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Nav links keep their own px-6/md:px-10 + gap-5 here rather than
              on the outer panel, so Footer below can sit unpadded — as a
              direct, full-width child of the panel it renders with exactly
              the site's real <Footer>, no margin-cancellation math needed
              to match its spacing pixel-for-pixel. */}
          <div className="flex-1 flex flex-col items-start justify-start gap-5 px-6 md:px-10">
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
          </div>

          <Footer />
        </div>
      )}
    </header>
  );
}
