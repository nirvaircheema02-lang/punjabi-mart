"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
export default function Page() {
  const { sellers } = useStore();
  return (
    <div className="pm-container pm-section">
      <h1 className="pm-h2">Our sellers</h1>
      <p>Products from PunjabiMarts and approved partner shops.</p>
      <div className="pm-grid">
        {sellers.map((shop) => (
          <article className="pm-panel pm-stack" key={shop.id}>
            <h2 className="pm-h4">{shop.name}</h2>
            <p>
              {shop.city} · {shop.speciality}
            </p>
            <p>{shop.story}</p>
            <Link href={`/search?owner=seller`}>Browse partner products</Link>
          </article>
        ))}
      </div>
      <Link className="pm-btn pm-btn--secondary" href="/sell">
        Apply to sell
      </Link>
    </div>
  );
}
