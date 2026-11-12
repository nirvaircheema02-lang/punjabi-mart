import Link from "next/link";
export default function SellerLogin() {
  return (
    <div className="pm-container pm-section">
      <h1 className="pm-h2">Seller centre</h1>
      <p>
        Sign in with your approved shop account, or apply to join PunjabiMarts.
      </p>
      <Link className="pm-btn pm-btn--primary" href="/login?next=/seller">
        Seller sign in
      </Link>
      <Link className="pm-btn" href="/sell">
        Apply to sell
      </Link>
    </div>
  );
}
