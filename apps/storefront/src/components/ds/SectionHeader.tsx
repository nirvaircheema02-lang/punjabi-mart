import Link from 'next/link'
import { CtaArrow } from './CtaArrow'

/**
 * SectionHeader — one component for every homepage and listing section.
 * Title + optional description + optional "View all". Headings stay at h3
 * scale deliberately; oversized section titles fight the product imagery.
 */
export function SectionHeader({
  title,
  description,
  viewAllHref,
  viewAllLabel = 'View all',
}: {
  title: string
  description?: string
  viewAllHref?: string
  viewAllLabel?: string
}) {
  return (
    <div className="pm-section__head">
      <div>
        <h2 className="pm-h3">{title}</h2>
        {description && (
          <p className="pm-small pm-ink-muted" style={{ marginTop: 'var(--space-1)' }}>
            {description}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="pm-viewall">
          {viewAllLabel}
          <CtaArrow size={16} />
        </Link>
      )}
    </div>
  )
}
