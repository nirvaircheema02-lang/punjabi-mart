import type { MetadataRoute } from 'next'
import { categories, ceremonies, products, sellers } from '@/lib/mock-data'

/** Emitted for completeness; robots.ts still gates whether it is advertised. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://punjabimarts.example'
  const url = (p: string) => ({ url: `${base}${p}`, lastModified: new Date() })
  return [
    url('/'),
    ...categories.map((c) => url(`/c/${c.slug}`)),
    ...ceremonies.map((c) => url(`/ceremony/${c.slug}`)),
    ...products.map((p) => url(`/p/${p.slug}`)),
    ...sellers.map((s) => url(`/s/${s.id}`)),
  ]
}
