'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

/**
 * AddControl — the dual-catalog keystone, now wired to the real cart.
 *
 *   requiresVariant=false → ADD morphs into a stepper (width transition)
 *   requiresVariant=true  → routes to the PDP for variant selection,
 *                           NEVER silently adds
 *
 * Ghee and juttis share this one component via one boolean. Hit targets are
 * 44px; Zepto's equivalent ships 24×28 and fails accessibility. Cart writes
 * are optimistic — local state moves first.
 */
export function AddControl({
  productId,
  slug,
  requiresVariant,
  placement = 'inline',
  disabled = false,
  variantLabel = 'Select options',
  selectedVariant,
  emphasis = 'default',
}: {
  productId: string
  slug: string
  requiresVariant: boolean
  placement?: 'inline' | 'overlay'
  disabled?: boolean
  variantLabel?: string
  /** When set on a PDP, a variant product can add directly. */
  selectedVariant?: string | null
  emphasis?: 'default' | 'primary'
}) {
  const router = useRouter()
  const { cart, addToCart, setQty, ready } = useStore()
  const line = cart.find((l) => l.productId === productId && l.variant === (selectedVariant ?? undefined))
  const qty = line?.qty ?? 0
  const fullWidth = placement === 'inline' ? { width: '100%' } : undefined

  if (disabled) {
    return (
      <button className="pm-btn pm-btn--secondary pm-btn--compact pm-btn--block" disabled>
        Out of stock
      </button>
    )
  }

  // Variant products with nothing chosen yet must go to the PDP first.
  if (requiresVariant && !selectedVariant) {
    return (
      <button
        className={`pm-add__btn${emphasis === 'primary' ? ' pm-add__btn--primary' : ''}`}
        style={fullWidth}
        onClick={(e) => { e.preventDefault(); router.push(`/product?slug=${encodeURIComponent(slug)}`) }}
      >
        {variantLabel}
      </button>
    )
  }

  if (!ready || qty === 0) {
    return (
      <div className="pm-add" data-placement={placement}>
        <button
          className={`pm-add__btn${emphasis === 'primary' ? ' pm-add__btn--primary' : ''}`}
          style={fullWidth}
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault()
            addToCart({ productId, slug, variant: selectedVariant ?? undefined })
          }}
        >
          {emphasis === 'primary' ? 'Add to cart' : 'ADD'}
        </button>
      </div>
    )
  }

  return (
    <div className="pm-add" data-placement={placement}>
      <div className="pm-add__stepper" role="group" aria-label="Quantity">
        <button className="pm-add__step" aria-label="Decrease quantity"
          onClick={(e) => { e.preventDefault(); setQty(productId, qty - 1, selectedVariant ?? undefined) }}>−</button>
        <span className="pm-add__count" aria-live="polite">{qty}</span>
        <button className="pm-add__step" aria-label="Increase quantity" disabled={qty >= 20}
          onClick={(e) => { e.preventDefault(); setQty(productId, qty + 1, selectedVariant ?? undefined) }}>+</button>
      </div>
    </div>
  )
}
