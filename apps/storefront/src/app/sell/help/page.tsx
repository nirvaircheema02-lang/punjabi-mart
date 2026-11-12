import Link from "next/link";
export default function Page() {
  return (
    <div className="pm-container pm-section pm-info">
      <h1 className="pm-h2">Seller help</h1>
      <p>
        Apply with your shop name, city and the products you make or sell. After
        approval, your seller centre lets you submit products, update stock,
        track your shipments, respond to customer issues and see settlement
        balances.
      </p>
      <p>
        PunjabiMarts reviews shop applications and submitted product changes
        before publication. Commission is shown in your shop settings and fixed
        for each order when it is placed.
      </p>
      <div className="pm-actions">
        <Link className="pm-btn pm-btn--primary" href="/sell">
          Apply to sell
        </Link>
        <Link className="pm-btn pm-btn--secondary" href="/help/contact">
          Contact support
        </Link>
      </div>
    </div>
  );
}
