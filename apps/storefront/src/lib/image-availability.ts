import available from './available-images.json'
import versions from './image-versions.json'
import type { ImageAsset } from './product-images'

/**
 * Asset availability, resolved from a build-time scan of public/images
 * (see scripts/scan-images.mjs, wired into predev/prebuild).
 *
 * Reading a generated manifest rather than hitting `fs` means this works
 * identically in server and client components — the earlier `server-only`
 * version broke the moment a client page rendered a ProductCard.
 *
 * Why it matters: without the check, <Image> requests every manifest path and
 * each missing file costs a 400 from /_next/image before the fallback kicks
 * in. On the homepage that was 141 wasted requests.
 */
const present = new Set<string>(available as string[])
const imageVersions: Record<string, string> = versions

export function assetIfPresent(asset: ImageAsset | undefined): ImageAsset | undefined {
  if (!asset) return undefined
  if (!present.has(asset.src)) return undefined
  // Replacing a generated image must also refresh Next's optimized image cache.
  return { ...asset, src: `${asset.src}?v=${imageVersions[asset.src]}` }
}

/** How many manifest slots are still waiting on generated artwork. */
export const availableCount = present.size
