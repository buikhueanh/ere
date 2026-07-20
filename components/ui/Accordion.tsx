'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AccordionProps {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

import { ReactNode } from 'react';

export default function Accordion({ label, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-input-fill">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-base lowercase leading-none text-foreground/70 hover:text-foreground transition-colors"
      >
        <span>{label}</span>
        {open ? <Minus size={12} strokeWidth={1.5} /> : <Plus size={12} strokeWidth={1.5} />}
      </button>
      {open && (
        <div className="pb-5 text-base leading-none text-foreground/70">
          {children}
        </div>
      )}
    </div>
  );
}
