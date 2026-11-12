import Link from "next/link";
export default function Page() {
  return (
    <div className="pm-container pm-section pm-info">
      <h1 className="pm-h2">About PunjabiMarts</h1>
      <p>
        PunjabiMarts brings Punjabi crafts, everyday goods and gifting together
        in one store. The local preview lets customers browse platform and
        partner shop products.
      </p>
      <div className="pm-actions">
        <Link className="pm-btn pm-btn--secondary" href="/about/sellers">
          Meet the shops
        </Link>
        <Link className="pm-btn pm-btn--tertiary" href="/sell">
          Sell with us
        </Link>
      </div>
    </div>
  );
}
