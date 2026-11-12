import { Store, BadgeCheck, Truck, ShieldCheck, Users } from 'lucide-react'

/**
 * Trust pillars. Deliberately free of unverifiable promises — no delivery-time
 * guarantees, no "100%" claims. Everything here is something the business can
 * actually stand behind on day one.
 */
const pillars = [
  { Icon: Store, title: 'Sourced from real shops', body: 'We buy direct from named shops in Amritsar and across Punjab.' },
  { Icon: BadgeCheck, title: 'Quality reviewed', body: 'Every listing is checked before it goes live on the marketplace.' },
  { Icon: Truck, title: 'Pan-India delivery', body: 'Shipped nationwide from our sellers’ own counters.' },
  { Icon: ShieldCheck, title: 'Secure shopping', body: 'Protected checkout, with COD available where eligible.' },
  { Icon: Users, title: 'Seller transparency', body: 'You always see which shop your order comes from.' },
]

export function TrustSection() {
  return (
    <section className="pm-section">
      <div className="pm-trustgrid">
        {pillars.map(({ Icon, title, body }) => (
          <div key={title} className="pm-pillar">
            <span className="pm-pillar__icon">
              <Icon size={20} aria-hidden="true" />
            </span>
            <strong className="pm-body">{title}</strong>
            <p className="pm-small pm-ink-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
