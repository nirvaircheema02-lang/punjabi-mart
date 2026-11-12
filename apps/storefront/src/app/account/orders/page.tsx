"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/commerce/types";
import { formatINR } from "@/lib/mock-data";
import { AccountGate } from "@/components/commerce/AccountGate";
import { Notice } from "@/components/commerce/Forms";
export default function Orders() {
  const { account, refresh } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState("");
  useEffect(() => {
    if (account)
      api<Order[]>("/orders")
        .then(setOrders)
        .catch((e) => setError(e.message))
        .finally(() => setLoaded(true));
  }, [account]);
  return (
    <div className="pm-container pm-section">
      <AccountGate>
        <div className="pm-section__head">
          <h1 className="pm-h2">Your orders</h1>
          <Link href="/account">Account</Link>
        </div>
        <Notice error>{error}</Notice>
        {!loaded ? (
          <p role="status">Loading orders…</p>
        ) : !orders.length ? (
          <div className="pm-empty">
            <h2 className="pm-h3">No orders yet</h2>
            <Link className="pm-btn pm-btn--primary" href="/search">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="pm-stack">
            {orders.map((o) => (
              <article className="pm-panel pm-stack" key={o.id}>
                <div className="pm-section__head">
                  <div>
                    <h2 className="pm-h4">{o.id}</h2>
                    <p className="pm-small">
                      {new Date(o.created_at).toLocaleDateString("en-IN")} ·{" "}
                      {o.is_demo ? "Test order · " : ""}COD {o.payment_status}
                    </p>
                  </div>
                  <strong>{formatINR(o.total)}</strong>
                </div>
                {o.shipments.map((s) => (
                  <div className="pm-order-shipment" key={s.id}>
                    <strong className="pm-badge">{s.status}</strong>
                    {s.lines.map((l, i) => (
                      <p key={i}>
                        <Link
                          href={`/product?slug=${encodeURIComponent(l.slug)}`}
                        >
                          {l.title}
                        </Link>{" "}
                        {l.variant && `· ${l.variant}`} × {l.qty}
                      </p>
                    ))}
                    {s.tracking && (
                      <p>
                        Carrier: {s.carrier} · Tracking: {s.tracking}
                      </p>
                    )}
                  </div>
                ))}
                <p className="pm-small">
                  Delivery to {o.address.name}, {o.address.line1},{" "}
                  {o.address.city} {o.address.pincode}
                </p>
                {o.shipments.every((s) =>
                  ["placed", "confirmed", "cancelled"].includes(s.status),
                ) &&
                  o.shipments.some((s) => s.status !== "cancelled") && (
                    <button
                      className="pm-btn pm-btn--secondary"
                      disabled={busy === o.id}
                      onClick={async () => {
                        if (!window.confirm("Cancel this order?")) return;
                        setBusy(o.id);
                        setError("");
                        try {
                          setOrders(
                            await api<Order[]>(
                              `/orders/${o.id}/cancel`,
                              json("POST", {}),
                            ),
                          );
                          void refresh();
                        } catch (e) {
                          setError((e as Error).message);
                        } finally {
                          setBusy("");
                        }
                      }}
                    >
                      {busy === o.id ? "Cancelling…" : "Cancel order"}
                    </button>
                  )}
              </article>
            ))}
          </div>
        )}
      </AccountGate>
    </div>
  );
}
