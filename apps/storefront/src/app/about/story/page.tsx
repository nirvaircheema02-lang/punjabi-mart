import Link from "next/link";
export default function Page() {
  return (
    <div className="pm-container pm-section pm-info">
      <h1 className="pm-h2">Our story</h1>
      <p>
        PunjabiMarts is being built to make Punjabi products easier to discover
        and buy online. It combines our own inventory with selected partner
        shops while keeping each seller and order clear to customers.
      </p>
      <Link href="/about/sellers">Explore our sellers</Link>
    </div>
  );
}
