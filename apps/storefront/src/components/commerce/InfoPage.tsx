import Link from "next/link";
import type { InfoPage as Content } from "@/lib/info-pages";
export function InfoPage({ page }: { page: Content }) {
  return (
    <div className="pm-container pm-section pm-info">
      <h1 className="pm-h2">{page.title}</h1>
      <p className="pm-body-lg pm-ink-muted">{page.intro}</p>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="pm-h4">{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      <div className="pm-actions">
        <Link className="pm-btn pm-btn--secondary" href="/help/contact">
          Contact support
        </Link>
        <Link className="pm-btn pm-btn--tertiary" href="/account/orders">
          My orders
        </Link>
      </div>
    </div>
  );
}
