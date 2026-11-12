'use client'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ProductCard } from '@/components/ds/ProductCard'
import { SectionHeader } from '@/components/ds/SectionHeader'
import { SellerStory } from '@/components/ds/SellerStory'
import { TrustSection } from '@/components/ds/TrustSection'
import { ProductImage } from '@/components/ds/ProductImage'
import { categoryImages } from '@/lib/product-images'
import { assetIfPresent } from '@/lib/image-availability'
import {
  HeroBanner, PromoBanner, CategoryTile, TechniqueRail, TrustStrip, CeremonyTile,
} from '@/components/ds/Banner'
import { categories, ceremonies } from '@/lib/mock-data'
import { SIZES_CARD_HOME, SIZES_EDITORIAL, SIZES_SHORTCUT } from '@/lib/image-sizes'

/**
 * Homepage — "Everything Punjabi. One marketplace."
 *
 * Module types are deliberately varied rather than 14 identical carousels:
 * category tiles, ceremony tiles, product rails, an editorial block, a seller
 * module and promo pairs. Pantry stays last and visually quieter — it's a
 * secondary vertical and density-first grids cheapen craft goods.
 */
export default function HomePage() {
  const { products } = useStore()
  const productsByCategory = (slug: string) => products.filter(p => p.category === slug)
  const craft = products.filter((p) => p.kind === 'lifestyle')
  const pantry = products.filter((p) => p.kind === 'fmcg')
  const pick = (slug: string, n = 4) => productsByCategory(slug).slice(0, n)

  const trending = craft.filter((p) => (p.reviewCount ?? 0) > 120).slice(0, 4)
  const gifting = craft.filter((p) => p.occasions?.includes('gifting')).slice(0, 4)
  const featured = ['phulkari', 'jutti', 'pantry'].map((slug) => productsByCategory(slug)[0]).filter((p) => p !== undefined)
  const shortcuts = [
    { name: 'Phulkari', detail: 'Timeless embroidery', slug: 'phulkari' },
    { name: 'Juttis', detail: 'Handcrafted comfort', slug: 'jutti' },
    { name: 'Wedding', detail: 'For special days', slug: 'ceremony-sets' },
    { name: 'Pantry', detail: 'Flavours of Punjab', slug: 'pantry' },
    { name: 'Gifts', detail: 'Thoughtful finds', slug: 'gifts' },
  ]

  return (
    <>
      <div className="pm-container pm-home">
        <HeroBanner
          eyebrow="Authentic  |  Handmade  |  For everyday life"
          title="Punjab, made for your everyday"
          body="From vibrant phulkari to handcrafted juttis, pantry favourites and thoughtful gifts — discover the best of Punjab for modern life."
          ctaLabel="Shop collections"
          ctaHref="#collections"
          secondaryLabel="Explore the craft"
          secondaryHref="#craft"
          art="phulkari"
        />

        <section className="pm-section pm-section--shortcuts" id="collections" aria-label="Shop popular collections">
          <div className="pm-shortcuts">
            {shortcuts.map((item) => (
              <Link href={`/c/${item.slug}`} key={item.slug} className="pm-shortcut">
                <span className="pm-shortcut__copy">
                  <strong>{item.name}</strong>
                  <span>{item.detail}</span>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </span>
                <span className="pm-shortcut__media">
                  <ProductImage
                    asset={assetIfPresent(categoryImages[item.slug])}
                    fallbackKind={item.slug === 'jutti' ? 'juttis' : item.slug === 'pantry' ? 'pantry' : item.slug === 'phulkari' ? 'phulkari' : 'wedding'}
                    fallbackSeed={`shortcut-${item.slug}`}
                    sizes={SIZES_SHORTCUT}
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="pm-section pm-section--featured">
          <SectionHeader title="Popular right now" description="Customer favourites, handpicked for you" viewAllHref="/c/phulkari" viewAllLabel="Explore products" />
          <div className="pm-grid pm-grid--spotlight">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} spotlight />)}
          </div>
        </section>

        <TrustStrip />

        <section className="pm-section">
          <SectionHeader title="Explore every collection" description="Everyday essentials, heirloom details and everything in between." />
          <div className="pm-tiles">
            {categories.map((c) => (
              <CategoryTile key={c.slug} name={c.name} slug={c.slug} art={c.art} />
            ))}
          </div>
        </section>

        {/* Ceremony is a parallel spine to category — a Roka shopper needs
            trays, envelopes and potlis that live in four categories. */}
        <section className="pm-section" id="ceremonies">
          <SectionHeader
            title="Shop by ceremony"
            description="Every rasam, with what it actually needs"
            viewAllHref="/ceremony/roka"
          />
          <div className="pm-ceremonies">
            {ceremonies.map((c) => (
              <CeremonyTile key={c.slug} name={c.name} slug={c.slug} />
            ))}
          </div>
        </section>

        <section className="pm-section" id="craft">
          <SectionHeader title="Know the craft" description="The techniques behind what you’re buying" />
          <TechniqueRail />
        </section>

        <section className="pm-section">
          <SectionHeader title="Trending now" description="Moving fastest across our shops" viewAllHref="/c/turbans" />
          <div className="pm-grid">
            {trending.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} sizes={SIZES_CARD_HOME} />)}
          </div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Turban & Sikh essentials" description="Voile, rubia, patkas, baaz and pins" viewAllHref="/c/turbans" />
          <div className="pm-grid">{pick('turbans').map((p) => <ProductCard key={p.id} product={p} sizes={SIZES_CARD_HOME} />)}</div>
        </section>

        <section className="pm-section">
          <div className="pm-promos">
            <PromoBanner title="Turban accessories" body="Baaz, salayi, pins and brushes" href="/c/turban-accessories" art="accessories" />
            <PromoBanner title="Wedding &amp; Shagun" body="Trays, boxes and complete ceremony sets" href="/c/ceremony-sets" art="wedding" />
          </div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Phulkari & craft" description="Hand-embroidered by Punjab’s own clusters" viewAllHref="/c/phulkari" />
          <div className="pm-grid">{pick('phulkari').map((p) => <ProductCard key={p.id} product={p} sizes={SIZES_CARD_HOME} />)}</div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Punjabi jutti" description="Hand-stitched, never glued" viewAllHref="/c/jutti" />
          <div className="pm-grid">{pick('jutti').map((p) => <ProductCard key={p.id} product={p} sizes={SIZES_CARD_HOME} />)}</div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Wedding & Shagun" description="Roka through to the wedding day" viewAllHref="/c/ceremony-sets" />
          <div className="pm-grid">{pick('ceremony-sets').map((p) => <ProductCard key={p.id} product={p} sizes={SIZES_CARD_HOME} />)}</div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Kurta pajama & men’s" description="Cotton and linen, plain through to wedding" viewAllHref="/c/kurta-pajama" />
          <div className="pm-grid">{pick('kurta-pajama').map((p) => <ProductCard key={p.id} product={p} sizes={SIZES_CARD_HOME} />)}</div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Jewellery & accessories" description="Jhumkas, kadas, parandas and potlis" viewAllHref="/c/jewellery" />
          <div className="pm-grid">{pick('jewellery').map((p) => <ProductCard key={p.id} product={p} sizes={SIZES_CARD_HOME} />)}</div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Gifts from Punjab" description="Things that travel well and arrive ready to give" viewAllHref="/c/gifts" />
          <div className="pm-grid">{gifting.map((p) => <ProductCard key={p.id} product={p} sizes={SIZES_CARD_HOME} />)}</div>
        </section>
      </div>

      <SellerStory />

      <div className="pm-container pm-home">
        <section className="pm-section">
          <div className="pm-editorial">
            <div className="pm-editorial__media">
              <ProductImage asset={assetIfPresent(categoryImages.turbans)} fallbackKind="turbans" fallbackSeed="journal-turban" sizes={SIZES_EDITORIAL} />
            </div>
            <div className="pm-editorial__body" data-variant="editorial">
              <p className="pm-small pm-ink-muted">From the journal</p>
              <h2 className="pm-h2">How to choose turban cloth</h2>
              <p className="pm-body-lg pm-ink-secondary">
                Voile, rubia or malmal — what actually changes between them, how much length you need
                for a dumalla, and why the weave matters more than the price.
              </p>
              <Link href="/c/turbans" className="pm-btn pm-btn--secondary">Explore turban cloth</Link>
            </div>
          </div>
        </section>

        <section className="pm-section">
          <SectionHeader title="Pantry" description="Ghee, oils and pickles from Punjab" viewAllHref="/c/pantry" />
          <div className="pm-grid pm-grid--fmcg">
            {/* Pantry runs the denser fmcg grid, so it keeps the card's own fmcg geometry. */}
            {pantry.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        <TrustSection />
      </div>
    </>
  )
}
