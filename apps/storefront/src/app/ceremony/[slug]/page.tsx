import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ds/ProductCard'
import { SectionHeader } from '@/components/ds/SectionHeader'
import { ProductImage } from '@/components/ds/ProductImage'
import { ceremonyImages } from '@/lib/product-images'
import { assetIfPresent } from '@/lib/image-availability'
import { ceremonies, getCeremony, productsByCeremony, products } from '@/lib/mock-data'

export function generateStaticParams() {
  return ceremonies.map((c) => ({ slug: c.slug }))
}

/**
 * Ceremony landing page — the parallel navigation spine.
 *
 * A customer shopping for a Roka wants trays, envelopes, potlis and sweet boxes
 * together. Those live in four different product categories, which is exactly
 * why ceremony can't be modelled as a sub-branch of category.
 */
export default async function CeremonyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ceremony = getCeremony(slug)
  if (!ceremony) notFound()

  const items = productsByCeremony(slug)
  // Anything wedding-adjacent, so the page is useful even where ceremony
  // tagging is still thin in the demo seed.
  const related = products
    .filter((p) => p.ceremony !== slug && p.occasions?.includes('wedding'))
    .slice(0, 4)

  return (
    <div className="pm-container">
      <nav aria-label="Breadcrumb" className="pm-small pm-ink-muted" style={{ paddingTop: 'var(--space-4)' }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link> /{' '}
        <Link href="/#ceremonies" style={{ color: 'inherit' }}>Ceremonies</Link> / {ceremony.name}
      </nav>

      <section className="pm-collection-intro" data-variant="editorial">
        <div className="pm-collection-intro__media">
          <ProductImage asset={assetIfPresent(ceremonyImages[slug])} fallbackKind="wedding" fallbackSeed={slug} priority fit="contain" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div className="pm-collection-intro__body">
        <h1 className="pm-h1">{ceremony.name}</h1>
        <p className="pm-body-lg pm-ink-secondary" style={{ maxWidth: '54ch', marginTop: 'var(--space-3)' }}>
          {ceremony.blurb}
        </p>
        </div>
      </section>

      <section className="pm-section">
        <SectionHeader
          title={`For the ${ceremony.name}`}
          description={`${items.length} ${items.length === 1 ? 'piece' : 'pieces'} across trays, boxes and gifting`}
        />
        {items.length ? (
          <div className="pm-grid">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="pm-empty">
            <h3 className="pm-h4">Nothing listed for this rasam yet</h3>
            <p className="pm-body pm-ink-muted">We’re still curating. Try a nearby ceremony.</p>
            <div className="pm-empty__grid">
              {ceremonies.filter((c) => c.slug !== slug).slice(0, 6).map((c) => (
                <Link key={c.slug} href={`/ceremony/${c.slug}`} className="pm-empty__tile">{c.name}</Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="pm-section">
        <SectionHeader title="Also for weddings" description="Pieces that work across rasams" />
        <div className="pm-grid">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="pm-section">
        <SectionHeader title="Other ceremonies" />
        <div className="pm-rail">
          {ceremonies.filter((c) => c.slug !== slug).map((c) => (
            <Link key={c.slug} href={`/ceremony/${c.slug}`} className="pm-rail__item">{c.name}</Link>
          ))}
        </div>
      </section>
    </div>
  )
}
