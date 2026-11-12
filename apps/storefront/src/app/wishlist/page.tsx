'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/ds/ProductCard'
import { useStore } from '@/lib/store'
import { categories, type Product } from '@/lib/mock-data'

export default function WishlistPage() {
  const { wishlist, ready, products } = useStore()
  const items = ready
    ? wishlist.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p))
    : []

  return (
    <div className="pm-container">
      <section className="pm-section">
        <div className="pm-section__head">
          <h1 className="pm-h2">Saved</h1>
          {ready && <span className="pm-small pm-ink-muted">{items.length} items</span>}
        </div>

        {!ready ? (
          <div className="pm-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pm-card">
                <div className="pm-skeleton" style={{ paddingTop: '125%' }} />
                <div className="pm-skeleton pm-skeleton--text" style={{ width: '60%' }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="pm-empty">
            <h2 className="pm-h3">Nothing saved yet</h2>
            <p className="pm-body pm-ink-muted">Tap the heart on anything you want to keep.</p>
            <div className="pm-empty__grid">
              {categories.slice(0, 6).map((c) => (
                <Link key={c.slug} href={`/c/${c.slug}`} className="pm-empty__tile">{c.name}</Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="pm-grid">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  )
}
