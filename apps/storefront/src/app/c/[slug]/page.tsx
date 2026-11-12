import { Suspense } from 'react'
import { Catalog } from '@/components/commerce/Catalog'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductImage } from '@/components/ds/ProductImage'
import { categoryImages } from '@/lib/product-images'
import { assetIfPresent } from '@/lib/image-availability'
import { categories } from '@/lib/mock-data'

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }))
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()


  return (
    <div className="pm-container">
      <nav aria-label="Breadcrumb" className="pm-small pm-ink-muted" style={{ paddingTop: 'var(--space-4)' }}>
        <Link href="/" style={{ color: 'inherit' }}>
          Home
        </Link>{' '}
        / {category.name}
      </nav>

      <div className="pm-collection-intro">
        <div className="pm-collection-intro__media">
          <ProductImage asset={assetIfPresent(categoryImages[slug])} fallbackKind={category.art} fallbackSeed={slug} priority fit="contain" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div className="pm-collection-intro__body">
          <p className="pm-small pm-ink-brand">The PunjabiMarts collection</p>
          <h1 className="pm-h1">{category.name}</h1>
          <p className="pm-body-lg pm-ink-secondary">{category.blurb ?? 'Thoughtful pieces, full of Punjabi character.'}</p>
        </div>
      </div>

      <section className="pm-section"><Suspense fallback={<p>Loading collection…</p>}><Catalog category={slug}/></Suspense></section>
    </div>
  )
}
