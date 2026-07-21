'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavDropdownItem {
  key: string;
  label: string;
  href: string;
}

interface NavDropdownProps {
  items: NavDropdownItem[];
  pathname: string;
}

// Dropdown under a hovered nav item (decision 010 §5 / 011 §2): a dot marks
// whichever item is currently hovered, falling back to whichever matches
// the current page when nothing's hovered. The dot is always rendered
// (opacity toggled) rather than conditionally, so the label never shifts
// left/right as you hover down the list.
export default function NavDropdown({ items, pathname }: NavDropdownProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <ul className="absolute bg-background left-0 top-full w-screen pb-6 px-6 md:px-10 flex flex-col gap-2 whitespace-nowrap max-h-80 overflow-y-auto">
      {items.map((item) => {
        const isMarked = hovered ? hovered === item.key : pathname === item.href;
        return (
          <li
            key={item.key}
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              href={item.href}
              className="flex items-center gap-2 text-xs leading-none text-foreground/70 hover:text-foreground transition-colors"
            >
              <span
                className={`w-1 h-1 rounded-full bg-foreground transition-opacity ${isMarked ? 'opacity-100' : 'opacity-0'}`}
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
