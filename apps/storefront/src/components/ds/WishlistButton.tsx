'use client'

import { Heart } from 'lucide-react'
import { useStore } from '@/lib/store'

export function WishlistButton({ productId, title }: { productId: string; title: string }) {
  const { inWishlist, toggleWishlist, ready } = useStore()
  const saved = ready && inWishlist(productId)

  return (
    <button
      className="pm-card__wish"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      title={saved ? 'Saved' : 'Save'}
      onClick={(e) => { e.preventDefault(); toggleWishlist(productId) }}
    >
      <Heart size={18} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
