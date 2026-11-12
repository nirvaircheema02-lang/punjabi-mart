"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { categories } from "@/lib/taxonomy";
import { ProductCard } from "@/components/ds/ProductCard";
import { Notice } from "./Forms";
export function Catalog({
  category,
  ceremony,
  seller,
}: {
  category?: string;
  ceremony?: string;
  seller?: string;
}) {
  const { products, error, refresh, settings } = useStore();
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const sub = params.get("sub") ?? "";
  const sort = params.get("sort") ?? "";
  const price = params.get("price") ?? "";
  const owner = params.get("owner") ?? "";
  const stock = params.get("stock") === "1";
  let items = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!ceremony || p.ceremony === ceremony) &&
      (!seller || p.sellerId === seller) &&
      (!sub || p.subCategory === sub) &&
      (!stock || p.inStock) &&
      (!owner || p.ownerType === owner),
  );
  if (query) {
    const terms = query.toLowerCase().split(/\s+/);
    items = items.filter((p) =>
      terms.every((t) =>
        `${p.title} ${p.category} ${p.description ?? ""} ${p.material ?? ""}`
          .toLowerCase()
          .includes(t),
      ),
    );
  }
  const ranges: Record<string, [number, number]> = {
    under500: [0, 500],
    mid: [500, 1500],
    premium: [1500, 3000],
    over3000: [3000, Infinity],
  };
  if (ranges[price])
    items = items.filter(
      (p) => p.price >= ranges[price][0] && p.price < ranges[price][1],
    );
  items = [...items].sort((a, b) =>
    sort === "price-asc"
      ? a.price - b.price
      : sort === "price-desc"
        ? b.price - a.price
        : sort === "rating"
          ? (b.rating ?? 0) - (a.rating ?? 0)
          : 0,
  );
  return (
    <>
      <Notice error>{error}</Notice>
      {error && (
        <button
          className="pm-btn pm-btn--secondary"
          onClick={() => void refresh()}
        >
          Retry connection
        </button>
      )}
      <div className="pm-section__head">
        <div>
          <h2 className="pm-h3">
            {query
              ? `Results for “${query}”`
              : category
                ? "Explore the collection"
                : "Browse products"}
          </h2>
          <p className="pm-small pm-ink-muted">
            {items.length} products
            {settings?.demo ? " · Preview catalogue" : ""}
          </p>
        </div>
      </div>
      <form
        className="pm-catalog-filters"
        action={category ? `/c/${category}` : "/search"}
      >
        <input type="hidden" name="q" value={query} />
        {sub && <input type="hidden" name="sub" value={sub} />}
        <label>
          Price
          <select className="pm-input" name="price" defaultValue={price}>
            <option value="">All prices</option>
            <option value="under500">Under ₹500</option>
            <option value="mid">₹500–₹1,500</option>
            <option value="premium">₹1,500–₹3,000</option>
            <option value="over3000">₹3,000+</option>
          </select>
        </label>
        <label>
          Sold by
          <select className="pm-input" name="owner" defaultValue={owner}>
            <option value="">All shops</option>
            <option value="platform">PunjabiMarts</option>
            <option value="seller">Partner shops</option>
          </select>
        </label>
        <label>
          Sort
          <select className="pm-input" name="sort" defaultValue={sort}>
            <option value="">Relevance</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Rating</option>
          </select>
        </label>
        <label className="pm-check">
          <input
            type="checkbox"
            name="stock"
            value="1"
            defaultChecked={stock}
          />{" "}
          In stock
        </label>
        <button className="pm-btn pm-btn--primary">Apply</button>
        <Link
          className="pm-btn pm-btn--tertiary"
          href={category ? `/c/${category}` : "/search"}
        >
          Clear
        </Link>
      </form>
      {sub && (
        <p className="pm-small">
          Showing:{" "}
          {categories
            .find((c) => c.slug === category)
            ?.children.find((c) => c.slug === sub)?.name ?? sub}
        </p>
      )}
      {items.length ? (
        <div className="pm-grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="pm-empty">
          <h3 className="pm-h4">No matching products</h3>
          <p>Try a different search or clear your filters.</p>
          <Link href="/search" className="pm-btn pm-btn--secondary">
            Browse all products
          </Link>
        </div>
      )}
    </>
  );
}
export function FilterForm({ category }: { category: string }) {
  const params = useSearchParams();
  const [price, setPrice] = useState(params.get("price") ?? "");
  return (
    <form action={`/c/${category}`} className="pm-filters pm-stack">
      <h1 className="pm-h3">Filter collection</h1>
      <label className="pm-field">
        Price
        <select
          className="pm-input"
          name="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        >
          <option value="">All prices</option>
          <option value="under500">Under ₹500</option>
          <option value="mid">₹500–₹1,500</option>
          <option value="premium">₹1,500–₹3,000</option>
          <option value="over3000">₹3,000+</option>
        </select>
      </label>
      <label className="pm-field">
        Sort
        <select
          className="pm-input"
          name="sort"
          defaultValue={params.get("sort") ?? ""}
        >
          <option value="">Relevance</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Rating</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          name="stock"
          value="1"
          defaultChecked={params.get("stock") === "1"}
        />{" "}
        In stock only
      </label>
      <button className="pm-btn pm-btn--primary">Show products</button>
      <Link href={`/c/${category}`}>Clear filters</Link>
    </form>
  );
}
