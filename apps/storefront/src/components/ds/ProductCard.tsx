import Link from 'next/link'
import { AddControl } from './AddControl'
import { WishlistButton } from './WishlistButton'
import { ProductImage } from './ProductImage'
import { attributionFor, discountPercent, formatINR, type Product } from '@/lib/mock-data'
import { productImages } from '@/lib/product-images'
import { assetIfPresent } from '@/lib/image-availability'
import { SIZES_CARD, SIZES_CARD_FMCG, SIZES_CARD_SPOTLIGHT } from '@/lib/image-sizes'

/**
 * One card, two variants — not two components.
 *
 * lifestyle: 4:5, quick-add BELOW the image. An overlay `+` defaces the hero
 *            shot, which is the whole proposition for embroidery and jewellery.
 * fmcg:      1:1, compact, pack size prominent, quick-add MAY overlay because
 *            a flat packshot is not hero photography.
 */
export function ProductCard({
  product,
  priority = false,
  spotlight = false,
  /**
   * Override the listing geometry. The grid a card sits in decides how wide
   * it renders, and the card cannot know that — the home page packs 4-up
   * where a category listing runs 3-up. Containers whose geometry differs
   * from the listing default MUST pass their own; see lib/image-sizes.ts.
   */
  sizes,
}: {
  product: Product
  priority?: boolean
  spotlight?: boolean
  sizes?: string
}) {
  const isFmcg = product.kind === 'fmcg'
  const off = discountPercent(product)
  const asset = product.image ? { src: product.image, alt: product.title } : assetIfPresent(productImages[product.id])

  return (
    <article className={`pm-card${isFmcg ? ' pm-card--fmcg' : ''}${spotlight ? ' pm-card--spotlight' : ''}`}>
      <div className="pm-card__media">
        <Link href={`/product?slug=${encodeURIComponent(product.slug)}`} className="pm-card__imagelink" aria-label={product.title}>
          <ProductImage
            asset={asset}
            fallbackKind={product.art}
            fallbackSeed={product.id}
            priority={priority}
            /* Spotlight is a HORIZONTAL card: the image is ~41% of the card,
               not the full grid column. Declaring the column width here is what
               made this the worst over-fetch on the site (4.55x). */
            sizes={sizes ?? (spotlight ? SIZES_CARD_SPOTLIGHT : isFmcg ? SIZES_CARD_FMCG : SIZES_CARD)}
          />
        </Link>

        {/* One badge maximum — badge soup dilutes every badge. */}
        {product.badge && <span className="pm-card__badge pm-badge">{product.badge}</span>}

        {!product.inStock && <span className="pm-card__oos">Out of stock</span>}

        {!isFmcg && <WishlistButton productId={product.id} title={product.title} />}

        {isFmcg && !spotlight && (
          <div className="pm-card__actions">
            <AddControl
              productId={product.id}
              slug={product.slug}
              requiresVariant={product.requiresVariant}
              placement="overlay"
              disabled={!product.inStock}
            />
          </div>
        )}
      </div>

      <div className="pm-card__body">
        {/* Seller attribution — platform-owned shows PunjabiMarts, not a seller. */}
        <span className="pm-card__seller">{attributionFor(product)}</span>

        <Link href={`/product?slug=${encodeURIComponent(product.slug)}`} className="pm-card__title">
          {product.title}
        </Link>

        {product.packSize && <span className="pm-card__pack">{product.packSize}</span>}

        <div className="pm-price">
          <span className="pm-price__current">{formatINR(product.price)}</span>
          <span className="pm-price__mrp">{formatINR(product.mrp)}</span>
          <span className="pm-price__off">{off}% off</span>
        </div>

        {product.rating && (
          <div className="pm-rating">
            <span className="pm-rating__star">★</span> {product.rating}{' '}
            <span className="pm-ink-muted">({product.reviewCount})</span>
          </div>
        )}
      </div>

      {(!isFmcg || spotlight) && (
        <div className="pm-card__actions">
          <AddControl
            productId={product.id}
            slug={product.slug}
            requiresVariant={product.requiresVariant}
            placement="inline"
            emphasis={spotlight ? 'primary' : 'default'}
            disabled={!product.inStock}
            variantLabel={
              product.variant?.label?.replace(/^Select /i, 'Select ') ?? 'Select options'
            }
          />
        </div>
      )}
    </article>
  )
}
