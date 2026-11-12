import Link from "next/link";
export default function Page() {
  return (
    <div className="pm-container pm-section pm-info">
      <h1 className="pm-h2">Craft journal</h1>
      <p>
        Stories about the people and craft behind PunjabiMarts are being
        prepared. For now, discover products and the shops behind them.
      </p>
      <Link className="pm-btn pm-btn--primary" href="/about/sellers">
        Explore sellers
      </Link>
    </div>
  );
}
