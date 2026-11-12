import Link from 'next/link'
import { CtaArrow } from './CtaArrow'
import { ProductImage } from './ProductImage'
import { categoryImages, ceremonyImages, heroImage } from '@/lib/product-images'
import { assetIfPresent } from '@/lib/image-availability'
import type { ArtKind } from '@/lib/mock-data'

/**
 * Banners. Text is live HTML over the artwork, never baked into an image —
 * it stays selectable, translatable, responsive and readable to screen readers,
 * and it means a copy change doesn't require re-exporting art.
 *
 * Deliberately restrained: no countdown timers, no "MEGA SALE" slabs. A craft
 * catalogue that shouts reads as a clearance bin (§6g).
 */

export function HeroBanner({
  eyebrow, title, body, ctaLabel, ctaHref, secondaryLabel, secondaryHref, art = 'phulkari',
}: {
  eyebrow: string; title: string; body: string
  ctaLabel: string; ctaHref: string; secondaryLabel?: string; secondaryHref?: string; art?: ArtKind
}) {
  return (
    <section className="pm-hero" data-variant="editorial">
      <div className="pm-hero__content">
        <p className="pm-small pm-ink-muted">{eyebrow}</p>
        <h1 className="pm-display">{title}</h1>
        <p className="pm-body-lg pm-ink-secondary">{body}</p>
        <div className="pm-hero__actions">
          <Link href={ctaHref} className="pm-btn pm-btn--primary pm-btn--prominent">
            {ctaLabel} <CtaArrow size={20} />
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link href={secondaryHref} className="pm-hero__secondary">
              {secondaryLabel} <CtaArrow />
            </Link>
          )}
        </div>
      </div>
      {/* Product composition, not decorative wash — the goods carry the
          cultural identity so the layout doesn't need ornament. */}
      <div className="pm-hero__media">
        <ProductImage
          asset={assetIfPresent(heroImage)}
          fallbackKind={art}
          fallbackSeed="hero-banner"
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </section>
  )
}

/** Secondary promo strip — one message, no urgency theatre. */
export function PromoBanner({
  title, body, href, art = 'wedding',
}: { title: string; body: string; href: string; art?: ArtKind }) {
  return (
    <Link href={href} className="pm-promo">
      <div className="pm-promo__art" aria-hidden="true">
        <ProductImage
          asset={assetIfPresent(categoryImages[href.split('/').pop() ?? ''])}
          fallbackKind={art}
          fallbackSeed={`promo-${art}`}
          sizes="(min-width: 768px) 220px, 120px"
        />
      </div>
      <div className="pm-promo__content">
        <h3 className="pm-h4">{title}</h3>
        <p className="pm-small pm-ink-muted">{body}</p>
      </div>
      <span className="pm-promo__chev" aria-hidden="true">→</span>
    </Link>
  )
}

/** Category tile — artwork-led, no flat icons. */
export function CategoryTile({
  name, slug, art,
}: { name: string; slug: string; art: ArtKind }) {
  return (
    <Link href={`/c/${slug}`} className="pm-tile">
      <span className="pm-tile__art">
        <ProductImage
          asset={assetIfPresent(categoryImages[slug])}
          fallbackKind={art}
          fallbackSeed={`tile-${slug}`}
          sizes="(min-width: 768px) 14vw, 88px"
        />
      </span>
      <span className="pm-tile__label">{name}</span>
    </Link>
  )
}

/** Ceremony tile — the parallel navigation spine, given visual weight. */
export function CeremonyTile({ name, slug }: { name: string; slug: string }) {
  return (
    <Link href={`/ceremony/${slug}`} className="pm-ceremony">
      <span className="pm-ceremony__art">
        <ProductImage
          asset={assetIfPresent(ceremonyImages[slug])}
          fallbackKind="wedding"
          fallbackSeed={`ceremony-${slug}`}
          sizes="(min-width: 768px) 20vw, 45vw"
        />
      </span>
      <span className="pm-ceremony__label">{name}</span>
    </Link>
  )
}

/**
 * Announcement bar — the single promo slot on the homepage.
 * Jaypore runs exactly one 14px live-text line and no discount copy anywhere
 * below it; Nykaa puts offer text on every tile plus a countdown and reads as
 * a clearance bin. One slot, live text, no timer.
 */
export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="pm-announce">
      <div className="pm-container">
        <p className="pm-small">{message}</p>
      </div>
    </div>
  )
}

/**
 * Craft-technique rail — the provenance differentiator.
 * Jaypore's IKAT/KANTHA/DABU row is the single strongest idea in premium
 * Indian craft commerce: it sells the vocabulary, not the discount, and it
 * teaches customers what they're buying.
 */
const techniques: Array<{ name: string; note: string; art: ArtKind; slug: string }> = [
  { name: 'Phulkari', note: 'Floral darning embroidery', art: 'phulkari', slug: 'phulkari' },
  { name: 'Tilla', note: 'Gold thread work', art: 'juttis', slug: 'jutti' },
  { name: 'Zari', note: 'Metallic brocade', art: 'wedding', slug: 'ceremony-sets' },
  { name: 'Voile', note: 'Fine turban cloth', art: 'turbans', slug: 'turbans' },
  { name: 'Jadau', note: 'Set stone jewellery', art: 'jewellery', slug: 'jewellery' },
]

export function TechniqueRail() {
  return (
    <div className="pm-techniques">
      {techniques.map((t) => (
        <Link key={t.name} href={`/c/${t.slug}`} className="pm-technique">
          <span className="pm-technique__art">
            <ProductImage
              asset={assetIfPresent(categoryImages[t.slug])}
              fallbackKind={t.art}
              fallbackSeed={`tech-${t.name}`}
              sizes="(min-width: 768px) 20vw, 140px"
            />
          </span>
          <span className="pm-technique__name">{t.name}</span>
          <span className="pm-technique__note">{t.note}</span>
        </Link>
      ))}
    </div>
  )
}

/** Trust strip — provenance claims at the same visual rank as any offer. */
export function TrustStrip() {
  const claims = [
    'Bought direct from the shops',
    'Handmade by named artisans',
    'Ships across India',
    'Easy returns',
  ]
  return (
    <div className="pm-trust">
      {claims.map((c) => (
        <span key={c} className="pm-trust__item">{c}</span>
      ))}
    </div>
  )
}
