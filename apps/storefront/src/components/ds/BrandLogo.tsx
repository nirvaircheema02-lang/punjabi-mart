import Image from 'next/image'

/** The approved PM monogram and wordmark, kept as one brand asset. */
export function BrandLogo({ priority = false, footer = false }: { priority?: boolean; footer?: boolean }) {
  return (
    <span className={`pm-brandmark${footer ? ' pm-brandmark--footer' : ''}`}>
      <Image
        src="/brand/punjabimarts-logo.png"
        alt="PunjabiMarts"
        width={2172}
        height={724}
        priority={priority}
        className="pm-brandmark__image"
      />
    </span>
  )
}
