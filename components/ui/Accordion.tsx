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
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-xs tracking-widest text-foreground hover:text-foreground/70 transition-colors"
      >
        <span>{label}</span>
        {open ? <Minus size={12} strokeWidth={1.5} /> : <Plus size={12} strokeWidth={1.5} />}
      </button>
      {open && (
        <div className="pb-5 text-sm font-sans text-foreground/70 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
