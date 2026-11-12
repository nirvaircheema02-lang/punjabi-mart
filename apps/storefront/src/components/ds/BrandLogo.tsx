import Image from 'next/image'
import { SIZES_LOGO } from '@/lib/image-sizes'

/**
 * The approved PM monogram and wordmark, kept as one brand asset.
 *
 * Served from the derived webp, not the 1.1MB master PNG — the master is
 * 2172px wide and the lockup never renders above 270px. See
 * scripts/build-brand-logo.mjs.
 *
 * `sizes` is not optional here. Without it next/image assumes 100vw, which
 * put the 1920px variant in the header of every page on the site, above the
 * fold, with `priority` so it competed with the hero for bandwidth.
 */
export function BrandLogo({ priority = false, footer = false }: { priority?: boolean; footer?: boolean }) {
  return (
    <span className={`pm-brandmark${footer ? ' pm-brandmark--footer' : ''}`}>
      <Image
        src="/brand/punjabimarts-logo.webp"
        alt="PunjabiMarts"
        width={1100}
        height={367}
        sizes={SIZES_LOGO}
        priority={priority}
        className="pm-brandmark__image"
      />
    </span>
  )
}
