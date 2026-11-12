import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { ProductImage } from './ProductImage'
import { sellerImages } from '@/lib/product-images'
import { assetIfPresent } from '@/lib/image-availability'
import { sellers, productsBySeller } from '@/lib/mock-data'

/**
 * Seller story — the differentiation, given proper space.
 *
 * Documentary shop photography rather than a generic marketplace banner: the
 * claim is that these are real shops we buy from, so the imagery has to look
 * like a real shop, not a stock-photo artisan.
 */
export function SellerStory() {
  return (
    <section className="pm-storyband">
      <div className="pm-container">
        <div className="pm-section__head">
          <div>
            <h2 className="pm-h3">From Punjab’s shops</h2>
            <p className="pm-small pm-ink-muted" style={{ marginTop: 'var(--space-1)' }}>
              The people we actually buy from
            </p>
          </div>
        </div>

        <div className="pm-stories">
          {sellers.map((s) => (
            <article key={s.id} className="pm-story">
              <div className="pm-story__media">
                <ProductImage
                  asset={assetIfPresent(sellerImages[s.id])}
                  fallbackKind="turbans"
                  fallbackSeed={`story-${s.id}`}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="pm-story__body">
                <h3 className="pm-h4">{s.name}</h3>
                <p className="pm-small pm-ink-muted pm-story__loc">
                  <MapPin size={14} aria-hidden="true" /> {s.city} · since {s.since}
                </p>
                <p className="pm-body pm-ink-secondary">{s.story}</p>
                <p className="pm-caption pm-ink-muted">Illustrated shop concept</p>
                <Link href={`/s/${s.id}`} className="pm-viewall">
                  Shop {productsBySeller(s.id).length} products
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
