import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ds/ProductCard'
import { ProductImage } from '@/components/ds/ProductImage'
import { sellerImages } from '@/lib/product-images'
import { assetIfPresent } from '@/lib/image-availability'
import { getSellerById, productsBySeller, sellers } from '@/lib/mock-data'
import { SIZES_SELLER_AVATAR } from '@/lib/image-sizes'

export function generateStaticParams() {
  return sellers.map((s) => ({ id: s.id }))
}

/**
 * Seller storefront — each shopkeeper gets a real page, not a footnote.
 * This is the brand promise made concrete: actual Amritsar shops, named, with
 * their own catalogue. It's also a strong SEO surface.
 */
export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seller = getSellerById(id)
  if (!seller) notFound()

  const items = productsBySeller(seller.id)

  return (
    <div className="pm-container">
      <nav aria-label="Breadcrumb" className="pm-small pm-ink-muted" style={{ paddingTop: 'var(--space-4)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link> / Sellers / {seller.name}
      </nav>

      <section className="pm-section">
        <div className="pm-shop">
          <div className="pm-shop__art" aria-hidden="true">
            <ProductImage asset={assetIfPresent(sellerImages[seller.id])} fallbackKind="turbans" fallbackSeed={`shop-${seller.id}`} sizes={SIZES_SELLER_AVATAR} />
          </div>
          <div className="pm-shop__meta">
            <h1 className="pm-h2">{seller.name}</h1>
            <p className="pm-body pm-ink-secondary">{seller.speciality}</p>
            <div className="pm-shop__facts">
              <span className="pm-badge">{seller.city}</span>
              <span className="pm-badge pm-badge--success">Since {seller.since}</span>
              <span className="pm-badge">{items.length} products</span>
            </div>
            <p className="pm-small pm-ink-muted" style={{ marginTop: 'var(--space-3)' }}>
              A family shop we buy from directly. Every order is packed by the shop itself.
            </p>
          </div>
        </div>
      </section>

      <section className="pm-section">
        <div className="pm-section__head">
          <h2 className="pm-h3">From this shop</h2>
        </div>
        <div className="pm-grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
