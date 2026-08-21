'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus } from 'lucide-react';
import { useCartContext } from '@/context/CartProvider';
import { formatPrice } from '@/utils/formatPrice';
import { canIncrement, getLineVariantLabel } from '@/lib/cart-helpers';
import { supportSections, slugifyLabel } from '@/config/customerCareSections';
import type { CartLine } from '@/types/cart.types';

const termsSection = supportSections.find((s) => s.label === 'Term of Service');
const TERMS_HREF = termsSection
  ? `/customer-care?section=${slugifyLabel(termsSection.label)}`
  : '/customer-care';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateItem } = useCartContext();
  // Track which line is mid-mutation so we can disable its controls
  const [pendingLine, setPendingLine] = useState<string | null>(null);
  // Client-side gate only — see note above the checkout link below.
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const lines = cart?.lines.nodes ?? [];
  const isEmpty = lines.length === 0;

  async function withPending(lineId: string, action: () => Promise<void>) {
    setPendingLine(lineId);
    try {
      await action();
    } finally {
      setPendingLine(null);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 bg-foreground/20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel — width breakpoints live here:
          phones: full width · small tablets: 85vw · laptops+: 1/3 viewport */}
      <aside
        aria-label="cart"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[85vw] md:w-1/3 bg-background flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <p className="lowercase text-xs leading-none text-foreground/70 hover:text-foreground transition-colors">
            cart{cart && cart.totalQuantity > 0 ? ` (${cart.totalQuantity})` : ''}
          </p>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="lowercase text-xs leading-none text-foreground/70 hover:text-foreground transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <p className="lowercase text-xs leading-none text-foreground/70">Your cart is empty</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="lowercase underline text-xs leading-none text-foreground hover:text-foreground/70 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Line items */}
            <ul className="flex-1 overflow-y-auto px-6 divide-y divide-border">
              {lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  pending={pendingLine === line.id}
                  onRemove={() => withPending(line.id, () => removeItem(line.id))}
                  onIncrement={() =>
                    withPending(line.id, () => updateItem(line.id, line.quantity + 1))
                  }
                  onDecrement={() =>
                    withPending(line.id, () =>
                      line.quantity <= 1
                        ? removeItem(line.id)
                        : updateItem(line.id, line.quantity - 1)
                    )
                  }
                  onClose={closeCart}
                />
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-border px-6 py-5 shrink-0 space-y-4">
              <div className="flex items-center justify-between lowercase text-xs leading-none text-foreground/70">
                <span>Subtotal</span>
                <span>
                  {cart &&
                    formatPrice(
                      cart.cost.subtotalAmount.amount,
                      cart.cost.subtotalAmount.currencyCode
                    )}
                </span>
              </div>
              <p className="lowercase text-xs leading-none text-muted">Taxes and shipping calculated at checkout.</p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-3 w-3 shrink-0 accent-foreground"
                />
                <span className="lowercase text-xs leading-snug text-foreground/70">
                  I accept the{' '}
                  <Link
                    href={TERMS_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                  .
                </span>
              </label>

              {/* This checkbox only gates the link client-side — it isn't
                  sent to Shopify, so it isn't part of the recorded order.
                  For consent that's actually attached to the order, also
                  enable "Require customers to agree to the terms and
                  conditions" under Shopify Admin → Settings → Policies,
                  which adds Shopify's own native checkbox to its hosted
                  checkout. */}
              <a
                href={agreedToTerms ? (cart?.checkoutUrl ?? '#') : undefined}
                aria-disabled={!agreedToTerms}
                onClick={(e) => {
                  if (!agreedToTerms) e.preventDefault();
                }}
                className={`block w-full border text-center text-xs tracking-widest lowercase py-4 transition-colors ${
                  agreedToTerms
                    ? 'bg-background border-foreground text-foreground hover:bg-foreground/90 hover:text-background'
                    : 'bg-background border-border text-muted cursor-not-allowed'
                }`}
              >
                Proceed to Checkout
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

interface CartLineItemProps {
  line: CartLine;
  pending: boolean;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onClose: () => void;
}

function CartLineItem({
  line,
  pending,
  onRemove,
  onIncrement,
  onDecrement,
  onClose,
}: CartLineItemProps) {
  const { merchandise } = line;
  const variantLabel = getLineVariantLabel(line);

  return (
    <li className={`flex gap-4 py-5 transition-opacity ${pending ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Thumbnail */}
      <Link
        href={`/products/${merchandise.product.handle}`}
        onClick={onClose}
        className="relative w-20 aspect-[2/3] bg-card-bg shrink-0 overflow-hidden"
      >
        {merchandise.image && (
          <Image
            src={merchandise.image.url}
            alt={merchandise.image.altText ?? merchandise.product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between gap-2">
          <Link
            href={`/products/${merchandise.product.handle}`}
            onClick={onClose}
            className="lowercase text-xs leading-none text-foreground/70 hover:text-foreground transition-colors"
          >
            {merchandise.product.title}
          </Link>
          <button
            onClick={onRemove}
            aria-label="Remove item"
            className="text-foreground/40 hover:text-foreground transition-colors shrink-0"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {variantLabel && <p className="lowercase text-xs leading-none text-muted mt-1">{variantLabel}</p>}

        <div className="flex items-end justify-between mt-auto pt-3">
          {/* Quantity stepper */}
          <div className="flex items-center border border-border">
            <button
              onClick={onDecrement}
              aria-label="Decrease quantity"
              className="px-2 py-1.5 text-foreground/70 hover:text-foreground transition-colors"
            >
              <Minus size={12} strokeWidth={1.5} />
            </button>
            <span className="px-3 text-xs tabular-nums">{line.quantity}</span>
            <button
              onClick={onIncrement}
              disabled={!canIncrement(line.quantity)}
              aria-label="Increase quantity"
              className="px-2 py-1.5 text-foreground/70 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={12} strokeWidth={1.5} />
            </button>
          </div>

          <p className="text-xs font-sans">
            {formatPrice(merchandise.price.amount, merchandise.price.currencyCode)}
          </p>
        </div>
      </div>
    </li>
  );
}
