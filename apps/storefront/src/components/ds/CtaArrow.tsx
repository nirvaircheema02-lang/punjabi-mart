import { ArrowUpRight } from 'lucide-react'

/** Decorative two-arrow swap. The parent link or button carries its label. */
export function CtaArrow({ size = 18 }: { size?: number }) {
  return (
    <span className="pm-cta-arrow" aria-hidden="true">
      <ArrowUpRight className="pm-cta-arrow__first" size={size} />
      <ArrowUpRight className="pm-cta-arrow__second" size={size} />
    </span>
  )
}
