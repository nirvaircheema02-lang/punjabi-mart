"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Truck, RotateCcw, Store } from "lucide-react";
import { AddControl } from "./AddControl";
import { VariantSelector } from "./VariantSelector";
import { useStore } from "@/lib/store";
import {
  discountPercent,
  formatINR,
  type Product,
  type Seller,
} from "@/lib/mock-data";

/**
 * PDP buy panel. Holds the variant selection state so the add control can
 * only fire once a choice has been made — a sized or length-based product
 * must never add silently.
 *
 * Single primary CTA, deliberately: twin equally-weighted Add/Buy buttons
 * cause decision paralysis on higher-priced items, and this catalogue runs up
 * to ₹11,500.
 */
export function PdpPanel({
  product,
  attribution,
  seller,
}: {
  product: Product;
  attribution: string;
  seller: Seller | null;
}) {
  const [variant, setVariant] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [pinState, setPinState] = useState<string | null>(null);
  const { inWishlist, toggleWishlist, ready } = useStore();
  const saved = ready && inWishlist(product.id);
  const off = discountPercent(product);

  const attrs: Array<[string, string | undefined]> = [
    ["Fabric", product.fabric],
    ["Length", product.length],
    ["Width", product.width],
    ["Colour", product.colour],
    ["Material", product.material],
    ["Care", product.care],
    ["Dimensions", product.dimensions],
    ["Ceremony", product.ceremony],
    ["Customisable", product.customisable ? "Yes, on request" : undefined],
  ];
  const shown = attrs.filter(([, v]) => Boolean(v));

  return (
    <div className="pm-pdp__panel">
      <div>
        <h1 className="pm-h3">{product.title}</h1>
        <p
          className="pm-small pm-ink-muted"
          style={{ marginTop: "var(--space-1)" }}
        >
          Sold by {attribution}
        </p>
      </div>

      <div className="pm-price pm-price--lg">
        <span className="pm-price__current">{formatINR(product.price)}</span>
        <span className="pm-price__mrp">{formatINR(product.mrp)}</span>
        <span className="pm-price__off">{off}% off</span>
      </div>

      {product.rating && (
        <div className="pm-rating">
          <span className="pm-rating__star">★</span> {product.rating}{" "}
          <span className="pm-ink-muted">({product.reviewCount} reviews)</span>
        </div>
      )}

      {!product.inStock && (
        <span className="pm-badge pm-badge--warning">Out of stock</span>
      )}

      {product.requiresVariant && product.variant && (
        <VariantSelector
          variant={product.variant}
          variantStocks={product.variantStocks}
          onChange={(primary, secondary) =>
            setVariant(
              primary && (!product.variant?.secondary || secondary)
                ? [primary, secondary].filter(Boolean).join(" · ")
                : null,
            )
          }
        />
      )}

      <div className="pm-pdp__cta">
        <div style={{ flex: 1, minWidth: 0 }}>
          <AddControl
            productId={product.id}
            slug={product.slug}
            requiresVariant={product.requiresVariant}
            placement="inline"
            emphasis="primary"
            disabled={!product.inStock}
            selectedVariant={variant}
            variantLabel={
              product.variant
                ? `Select ${product.variant.label.replace(/^Select /i, "")} above`
                : "Select options"
            }
          />
        </div>
        <button
          className="pm-btn pm-btn--secondary"
          aria-pressed={saved}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart
            size={16}
            aria-hidden="true"
            fill={saved ? "currentColor" : "none"}
          />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="pm-field" style={{ maxWidth: "320px" }}>
        <label className="pm-label" htmlFor="pin">
          Check delivery
        </label>
        <div className="pm-pincode-control">
          <input
            className="pm-input"
            id="pin"
            placeholder="6-digit pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            aria-describedby="pin-status"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              setPinState(null);
            }}
          />
          <button
            className="pm-btn pm-btn--secondary"
            onClick={() =>
              setPinState(
                /^\d{6}$/.test(pincode)
                  ? "Valid format. Delivery availability is confirmed at checkout."
                  : "Enter a valid 6-digit pincode",
              )
            }
          >
            Check
          </button>
        </div>
        <p id="pin-status" className="pm-field__message" role="status">
          {pinState ?? "Enter your delivery pincode."}
        </p>
      </div>

      {product.description && (
        <div>
          <h2 className="pm-h4">About this product</h2>
          <p
            className="pm-body pm-ink-secondary"
            style={{ marginTop: "var(--space-2)" }}
          >
            {product.description}
          </p>
        </div>
      )}

      {product.includes && product.includes.length > 0 && (
        <div>
          <h2 className="pm-h4">What’s included</h2>
          <ul className="pm-speclist">
            {product.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      )}

      {shown.length > 0 && (
        <div>
          <h2 className="pm-h4">Details</h2>
          <dl className="pm-specs">
            {shown.map(([k, v]) => (
              <div key={k} className="pm-specs__row">
                <dt className="pm-small pm-ink-muted">{k}</dt>
                <dd className="pm-small">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="pm-pdp__assure">
        <span>
          <Truck size={16} aria-hidden="true" /> Pan-India delivery
        </span>
        <span>
          <RotateCcw size={16} aria-hidden="true" /> Returns where eligible
        </span>
      </div>

      {seller && (
        <div className="pm-seller-block">
          <span className="pm-small pm-ink-muted">
            <Store size={14} aria-hidden="true" /> Seller
          </span>
          <strong className="pm-body-lg">{seller.name}</strong>
          <span className="pm-small pm-ink-muted">
            {seller.city} · since {seller.since}
          </span>
          <p className="pm-small pm-ink-secondary">{seller.speciality}</p>
          <Link
            href={`/s/${seller.id}`}
            className="pm-viewall"
            style={{ marginTop: "var(--space-2)" }}
          >
            Visit shop
          </Link>
        </div>
      )}
    </div>
  );
}
