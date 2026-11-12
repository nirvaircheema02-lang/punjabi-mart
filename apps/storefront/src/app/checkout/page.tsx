"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { api, json } from "@/lib/api";
import { formatINR } from "@/lib/mock-data";
import type { Address, Order } from "@/lib/commerce/types";
import {
  AddressFields,
  emptyAddress,
  Notice,
} from "@/components/commerce/Forms";
interface Quote {
  subtotal: number;
  shipping: number;
  total: number;
  demo: boolean;
  lines: { title: string; qty: number; price: number; variant?: string }[];
}
export default function Checkout() {
  const { cart, account, ready, clearCart, refresh, settings } = useStore();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const key = useRef("");
  useEffect(() => {
    if (account)
      api<Address[]>("/addresses")
        .then(setAddresses)
        .catch((e) => setError(e.message));
  }, [account]);
  const cartKey = JSON.stringify({ cart, address });
  const [quotedCart, setQuotedCart] = useState("");
  async function review(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const q = await api<Quote>(
        "/checkout/quote",
        json("POST", { lines: cart, address }),
      );
      setQuote(q);
      setQuotedCart(cartKey);
      key.current = crypto.randomUUID();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function place() {
    if (!quote) return;
    if (cartKey !== quotedCart) {
      setQuote(null);
      setError("Your cart changed. Please review it again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api<Order>(
        "/orders",
        json("POST", {
          lines: cart,
          address,
          payment: "cod",
          expectedTotal: quote.total,
          idempotencyKey: key.current,
        }),
      );
      setOrder(result);
      clearCart();
      void refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <div className="pm-container pm-section" role="status">
        Loading checkout…
      </div>
    );
  if (!account)
    return (
      <div className="pm-container pm-section">
        <div className="pm-empty">
          <h1 className="pm-h3">Sign in to checkout</h1>
          <p>Your cart is saved on this device.</p>
          <Link href="/login?next=/checkout" className="pm-btn pm-btn--primary">
            Continue to sign in
          </Link>
        </div>
      </div>
    );
  if (order)
    return (
      <div className="pm-container pm-section">
        <div className="pm-empty">
          <h1 className="pm-h2">
            {order.is_demo ? "Test order saved" : "Order received"}
          </h1>
          <p>{order.id}</p>
          <p>
            {order.is_demo
              ? "This is a test order. No payment or dispatch will take place."
              : `Pay ${formatINR(order.total)} on delivery.`}
          </p>
          <Link href="/account/orders" className="pm-btn pm-btn--primary">
            View order & tracking
          </Link>
        </div>
      </div>
    );
  if (!cart.length)
    return (
      <div className="pm-container pm-section">
        <h1 className="pm-h3">Your cart is empty</h1>
        <Link href="/search">Browse products</Link>
      </div>
    );
  return (
    <div className="pm-container pm-section">
      <h1 className="pm-h2">Checkout</h1>
      <Notice>
        {settings?.demo
          ? "Test shop · No real payment or dispatch. Use sample delivery details."
          : null}
      </Notice>
      <div className="pm-cart">
        <form className="pm-panel pm-stack" onSubmit={review}>
          <h2 className="pm-h4">Delivery address</h2>
          {addresses.length > 0 && (
            <label className="pm-field">
              <span className="pm-label">Saved addresses</span>
              <select
                className="pm-input"
                defaultValue=""
                onChange={(e) => {
                  setAddress(
                    addresses.find((a) => String(a.id) === e.target.value) ??
                      emptyAddress,
                  );
                  setQuote(null);
                }}
              >
                <option value="">Use a new address</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.line1} · {a.pincode}
                  </option>
                ))}
              </select>
            </label>
          )}
          <AddressFields
            value={address}
            onChange={(a) => {
              setAddress(a);
              setQuote(null);
            }}
          />
          <Notice error>{error}</Notice>
          <button className="pm-btn pm-btn--secondary" disabled={busy}>
            {busy ? "Checking…" : "Review order & delivery"}
          </button>
        </form>
        <aside className="pm-summary">
          <h2 className="pm-h4">Order summary</h2>
          {quote ? (
            <>
              {quote.lines.map((l, i) => (
                <div className="pm-summary__row" key={i}>
                  <span>
                    {l.title} {l.variant && `(${l.variant})`} × {l.qty}
                  </span>
                  <strong>{formatINR(l.price * l.qty)}</strong>
                </div>
              ))}
              <div className="pm-summary__row">
                <span>Subtotal</span>
                <strong>{formatINR(quote.subtotal)}</strong>
              </div>
              <div className="pm-summary__row">
                <span>Delivery</span>
                <strong>{formatINR(quote.shipping)}</strong>
              </div>
              <div className="pm-summary__row pm-summary__row--total">
                <span>Total</span>
                <strong>{formatINR(quote.total)}</strong>
              </div>
              <p>Cash on delivery</p>
              <button
                className="pm-btn pm-btn--primary pm-btn--block"
                disabled={busy || quotedCart !== cartKey}
                onClick={place}
              >
                {busy
                  ? "Placing order…"
                  : quote.demo
                    ? "Place test order"
                    : "Place order"}
              </button>
              <p className="pm-caption">
                By placing your order, you agree to the{" "}
                <Link href="/policies/terms">terms</Link>.
              </p>
            </>
          ) : (
            <p>
              Enter your delivery address to confirm stock, shipping and the
              final total.
            </p>
          )}
          <Link href="/cart">Back to cart</Link>
        </aside>
      </div>
    </div>
  );
}
