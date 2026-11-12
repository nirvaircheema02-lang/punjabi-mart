import type { MetadataRoute } from 'next'

/**
 * Search engines are blocked by DEFAULT, deliberately.
 *
 * The catalogue is demo data (every product carries isDemo) and the imagery is
 * AI-generated and disclosed at /photo-credits. Letting Google index 99
 * fictional products, with prices, under a real brand name would put listings
 * in front of shoppers who cannot actually buy them — there is no checkout
 * behind this yet.
 *
 * When real seller inventory is live, set NEXT_PUBLIC_ALLOW_INDEXING=true.
 */
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://punjabimarts.example'
  return allowIndexing
    ? { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${base}/sitemap.xml` }
    : { rules: [{ userAgent: '*', disallow: '/' }] }
}
