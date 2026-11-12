"use client";

import Link from "next/link";
import { Trash2, Heart } from "lucide-react";
import { ProductImage } from "@/components/ds/ProductImage";
import { productImages } from "@/lib/product-images";
import { assetIfPresent } from "@/lib/image-availability";
import { useStore } from "@/lib/store";
import {
  attributionFor,
  categories,
  formatINR,
  type Product,
} from "@/lib/mock-data";

/**
 * Cart — the multi-seller split made visible.
 *
 * One customer order may contain a platform-owned item plus items from two
 * sellers. The customer sees ONE order, but shipments group by fulfiller and
 * we say so up front rather than surprising them with three parcels later.
 */
export default function CartPage() {
  const { cart, setQty, removeFromCart, saveWishlist, ready, products } =
    useStore();

  const lines = cart
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.productId) }))
    .filter((l): l is typeof l & { product: Product } => Boolean(l.product));

  if (!ready) {
    return (
      <div className="pm-container">
        <section className="pm-section">
          <div
            className="pm-skeleton pm-skeleton--text"
            style={{ width: "30%", height: 32 }}
          />
        </section>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="pm-container">
        <section className="pm-section">
          <div className="pm-empty">
            <h1 className="pm-h3">Your cart is empty</h1>
            <p className="pm-body pm-ink-muted">
              Start with something from our shops.
            </p>
            <div className="pm-empty__grid">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.slug}
                  href={`/c/${c.slug}`}
                  className="pm-empty__tile"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const groups = new Map<string, typeof lines>();
  for (const line of lines) {
    const key = attributionFor(line.product);
    groups.set(key, [...(groups.get(key) ?? []), line]);
  }

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const savings = lines.reduce(
    (s, l) => s + (l.product.mrp - l.product.price) * l.qty,
    0,
  );

  return (
    <div className="pm-container">
      <section className="pm-section">
        <div className="pm-section__head">
          <h1 className="pm-h2">Your cart</h1>
          <span className="pm-small pm-ink-muted">{lines.length} items</span>
        </div>

        <div className="pm-cart">
          <div className="pm-cart__lines">
            <p
              className="pm-small pm-ink-muted"
              style={{ marginBottom: "var(--space-3)" }}
            >
              {groups.size === 1
                ? "Arriving in 1 parcel."
                : `Arriving in ${groups.size} separate parcels — items ship from different shops.`}
            </p>

            {[...groups.entries()].map(([fulfiller, items]) => (
              <div key={fulfiller} className="pm-cart__group">
                <div className="pm-cart__grouphead">
                  <strong className="pm-small">{fulfiller}</strong>
                  <span className="pm-badge">Parcel</span>
                </div>

                {items.map((l) => (
                  <div
                    key={`${l.productId}-${l.variant ?? ""}`}
                    className="pm-cartline"
                  >
                    <Link
                      href={`/product?slug=${encodeURIComponent(l.product.slug)}`}
                      className="pm-cartline__art"
                    >
                      <ProductImage
                        asset={
                          l.product.image
                            ? { src: l.product.image, alt: l.product.title }
                            : assetIfPresent(productImages[l.product.id])
                        }
                        fallbackKind={l.product.art}
                        fallbackSeed={l.product.id}
                        sizes="96px"
                      />
                    </Link>
                    <div className="pm-cartline__body">
                      <Link
                        href={`/product?slug=${encodeURIComponent(l.product.slug)}`}
                        className="pm-cartline__title"
                      >
                        {l.product.title}
                      </Link>
                      {l.variant && (
                        <span className="pm-small pm-ink-muted">
                          {l.variant}
                        </span>
                      )}
                      {l.product.packSize && (
                        <span className="pm-small pm-ink-muted">
                          {l.product.packSize}
                        </span>
                      )}
                      <div className="pm-price">
                        <span className="pm-price__current">
                          {formatINR(l.product.price)}
                        </span>
                        <span className="pm-price__mrp">
                          {formatINR(l.product.mrp)}
                        </span>
                      </div>
                      <div className="pm-cartline__tools">
                        <button
                          className="pm-btn pm-btn--tertiary pm-btn--compact"
                          onClick={() => {
                            saveWishlist(l.productId);
                            removeFromCart(l.productId, l.variant);
                          }}
                        >
                          <Heart size={14} aria-hidden="true" /> Save for later
                        </button>
                        <button
                          className="pm-btn pm-btn--tertiary pm-btn--compact"
                          onClick={() => removeFromCart(l.productId, l.variant)}
                        >
                          <Trash2 size={14} aria-hidden="true" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="pm-cartline__qty">
                      <div
                        className="pm-add__stepper"
                        role="group"
                        aria-label={`Quantity for ${l.product.title}`}
                      >
                        <button
                          className="pm-add__step"
                          aria-label="Decrease"
                          onClick={() =>
                            setQty(l.productId, l.qty - 1, l.variant)
                          }
                        >
                          −
                        </button>
                        <span className="pm-add__count">{l.qty}</span>
                        <button
                          className="pm-add__step"
                          aria-label="Increase"
                          disabled={l.qty >= 20}
                          onClick={() =>
                            setQty(l.productId, l.qty + 1, l.variant)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <aside className="pm-summary">
            <h2 className="pm-h4">Summary</h2>
            <div className="pm-summary__row">
              <span>Subtotal</span>
              <strong>{formatINR(subtotal)}</strong>
            </div>
            <div className="pm-summary__row">
              <span>You save</span>
              <strong style={{ color: "var(--savings-ink)" }}>
                {formatINR(savings)}
              </strong>
            </div>
            <div className="pm-summary__row">
              <span>Delivery</span>
              <strong>Calculated at checkout</strong>
            </div>
            <div className="pm-summary__row pm-summary__row--total">
              <span>Total</span>
              <strong>{formatINR(subtotal)}</strong>
            </div>
            <Link
              href="/checkout"
              className="pm-btn pm-btn--primary pm-btn--prominent pm-btn--block"
            >
              Proceed to checkout
            </Link>
            <p className="pm-field__message">
              Delivery and availability are confirmed at checkout.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
