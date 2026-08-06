"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { supportSections } from "@/config/customerCareSections";

// Customer care hub (decision 010 §3): sections expand in place rather than
// linking out to separate pages.
export default function CustomerCarePage() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  return (
    <div className="px-6 mx-auto py-24 max-w-lg">
      <h1 className="font-handwriting italic lowercase text-xl mb-3">
        Customer care
      </h1>
      <div className="text-xs lowercase flex gap-1">
        <p>we are here to help. for customer service and orders, contact</p>
        <a
          href="mailto:contact@ere-world.com"
          className="hover:text-foreground/70 transition-colors"
        >
          customerservice@ere-world.com
        </a>
        <br />
        <br />
      </div>

      <ul>
        {supportSections.map((section) => {
          const isOpen = openLabel === section.label;
          return (
            <li key={section.label}>
              <button
                onClick={() => setOpenLabel(isOpen ? null : section.label)}
                className="w-full flex items-center gap-2 py-4 text-xs font-semibold uppercase leading-none text-foreground"
              >
                {isOpen ? (
                  <Minus size={12} strokeWidth={1.5} />
                ) : (
                  <Plus size={12} strokeWidth={1.5} />
                )}
                <span>{section.label}</span>
              </button>
              {isOpen && (
                <div className="pb-4 pl-5 lowercase text-xs leading-relaxed text-foreground/70">
                  {section.content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
