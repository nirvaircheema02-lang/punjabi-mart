import Link from 'next/link'

export const metadata = { title: 'About our imagery | PunjabiMarts' }

export default function PhotoCreditsPage() {
  return (
    <div className="pm-container">
      <section className="pm-section">
        <h1 className="pm-h1">About our imagery</h1>
        <p className="pm-body-lg pm-ink-secondary" style={{ maxWidth: '64ch', marginTop: 'var(--space-6)' }}>
          Our demo catalogue uses images created with OpenAI image generation,
          art-directed around Punjabi textiles, craft, celebrations and everyday essentials.
          Warm stone, natural light and detailed materials bring the collections together.
        </p>
        <p className="pm-body pm-ink-secondary" style={{ maxWidth: '64ch', marginBlock: 'var(--space-6)' }}>
          Product and shop images are illustrative concepts. They do not document actual
          seller inventory, workshops or product specifications.
        </p>
        <Link href="/" className="pm-btn pm-btn--secondary">Explore the collections</Link>
      </section>
    </div>
  )
}
