'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ProductArt } from './ProductArt'
import type { ArtKind } from '@/lib/mock-data'
import type { ImageAsset } from '@/lib/product-images'
import { SIZES_CARD } from '@/lib/image-sizes'

/**
 * ProductImage — the single image primitive for the storefront.
 *
 * Generated catalogue imagery renders through next/image (responsive srcset, lazy below
 * the fold, explicit dimensions so there is no layout shift). If the file
 * hasn't been generated yet, or fails to load, it falls back to the generated
 * SVG art. A broken-image icon can never appear (rule 14).
 *
 * This is why images are a pure drop-in: save the file at the manifest path
 * and it takes over with no code change.
 */
export function ProductImage({
  asset,
  fallbackKind,
  fallbackSeed,
  /**
   * Defaults to the listing-card geometry because that is the commonest
   * caller. Any role with a different width MUST pass its own — see
   * lib/image-sizes.ts. A wrong `sizes` is invisible on a fast desktop and
   * doubles the page weight on a phone.
   */
  sizes = SIZES_CARD,
  priority = false,
  fit = 'cover',
  className,
}: {
  asset?: Pick<ImageAsset, 'src' | 'alt'> & Partial<Pick<ImageAsset, 'ratio'>>
  fallbackKind: ArtKind
  fallbackSeed: string
  sizes?: string
  priority?: boolean
  fit?: 'cover' | 'contain'
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const ratio = asset?.ratio ?? '4:5'
  const [w, h] = ratio === '1:1' ? [1000, 1000] : ratio === '16:9' ? [1600, 900] : [1000, 1250]

  if (!asset || failed) {
    return (
      <ProductArt
        kind={fallbackKind}
        seed={fallbackSeed}
        ratio={ratio}
        className={className}
      />
    )
  }

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={w}
      height={h}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      onError={() => setFailed(true)}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
    />
  )
}
