"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import { useStore } from "@/lib/store";
import { ProductEditor } from "./ProductEditor";
import type { Shop, ManagedProduct } from "@/lib/commerce/management";
import type { Order } from "@/lib/commerce/types";
import { AccountGate } from "./AccountGate";
import { Field, Notice } from "./Forms";
import "./management.css";
import { ManageIssues } from "./Issues";
import { Settlements } from "./Settlements";
import { StoreSettings, SupportInbox, type Operations } from "./StoreSettings";
type Data = Operations & {
  products: ManagedProduct[];
  orders: Order[];
  shops: Shop[];
};
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );
const transitions: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped"],
  shipped: ["delivered"],
};
export function Management() {
  const { account } = useStore();
  return <ManagementContent key={account?.id ?? "guest"} />;
}
function ManagementContent() {
  const { account, refresh } = useStore();
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("Products");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<ManagedProduct | "new" | null>(null);
  const staff = account?.role === "admin" || account?.role === "seller";
  const admin = account?.role === "admin";
  const reload = useCallback(async () => {
    setData(await api<Data>("/manage"));
  }, []);
  useEffect(() => {
    let active = true;
    if (staff)
      api<Data>("/manage")
        .then((value) => {
          if (active) setData(value);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [staff, account?.id]);
  async function act(path: string, body: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(path, json("PATCH", body));
      await reload();
      await refresh();
      setNotice("Changes saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AccountGate>
      <div className="pm-management">
        <header>
          <div>
            <p className="pm-muted">
              PunjabiMarts · {admin ? "Store administration" : "Seller centre"}
            </p>
            <h1 className="pm-h2">
              {admin ? "Manage your store" : "Manage your shop"}
            </h1>
            <p>
              Products, stock and fulfilment in one place. Demo listings remain
              available.
            </p>
          </div>
          <Link className="pm-btn" href="/">
            View storefront ↗
          </Link>
        </header>
        {!staff ? (
          <Notice error>This account does not have management access.</Notice>
        ) : (
          <>
            <Notice error>{error}</Notice>
            <Notice>{notice}</Notice>
            <nav aria-label="Management sections">
              {[
                "Products",
                "Orders",
                ...(admin ? ["Shops", "Settings", "Messages"] : []),
              ].map((t) => (
                <button
                  className="pm-btn"
                  aria-pressed={tab === t}
                  onClick={() => {
                    setTab(t);
                    setEditor(null);
                  }}
                  key={t}
                >
                  {t}
                </button>
              ))}
              <button
                className="pm-btn"
                disabled={busy}
                onClick={() => reload().catch((e) => setError(e.message))}
              >
                Refresh
              </button>
            </nav>
            {!data ? (
              <p role="status">Loading store…</p>
            ) : (
              <>
                <div className="pm-management-stats">
                  <div>
                    <strong>{data.products.length}</strong>Products
                  </div>
                  <div>
                    <strong>
                      {
                        data.products.filter((p) => p.status === "pending")
                          .length
                      }
                    </strong>
                    Awaiting approval
                  </div>
                  <div>
                    <strong>{data.orders.length}</strong>Recent orders (up to
                    300)
                  </div>
                  <div>
                    <strong>
                      {data.products.filter((p) => (p.stock ?? 0) < 5).length}
                    </strong>
                    Low stock products
                  </div>
                </div>
                {tab === "Issues" && <ManageIssues admin={admin} />}
                {tab === "Settlements" && <Settlements admin={admin} />}
                {tab === "Products" && (
                  <>
                    <div className="pm-management-toolbar">
                      <Field
                        label="Find a product"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <button
                        className="pm-btn pm-btn--primary"
                        onClick={() => setEditor("new")}
                      >
                        Add product
                      </button>
                    </div>
                    {editor && (
                      <ProductEditor
                        key={editor === "new" ? "new" : editor.id}
                        product={editor === "new" ? undefined : editor}
                        shops={data.shops}
                        admin={admin}
                        close={() => setEditor(null)}
                        saved={async () => {
                          await reload();
                          await refresh();
                          setEditor(null);
                          setNotice("Product saved.");
                        }}
                      />
                    )}
                    <div className="pm-management-table">
                      <table>
                        <caption>Product catalogue</caption>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Owner</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.products
                            .filter((p) =>
                              p.title
                                .toLowerCase()
                                .includes(query.toLowerCase()),
                            )
                            .map((p) => (
                              <tr key={p.id}>
                                <td>
                                  {p.title}
                                  {p.isDemo && <small>Demo</small>}
                                </td>
                                <td>
                                  {p.sellerId
                                    ? data.shops.find(
                                        (s) => s.id === p.sellerId,
                                      )?.name
                                    : "PunjabiMarts (own)"}
                                </td>
                                <td>{money(p.price)}</td>
                                <td>{p.stock}</td>
                                <td>{p.status}</td>
                                <td>
                                  <button
                                    className="pm-btn"
                                    onClick={() => setEditor(p)}
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {tab === "Settings" && admin && (
                  <StoreSettings
                    settings={data.settings}
                    saved={async () => {
                      await reload();
                      await refresh();
                    }}
                  />
                )}
                {tab === "Messages" && admin && (
                  <SupportInbox
                    messages={data.messages}
                    subscribers={data.subscribers}
                    act={act}
                    busy={busy}
                  />
                )}
                {tab === "Shops" &&
                  data.shops.map((s) => (
                    <section className="pm-management-card" key={s.id}>
                      <h2>{s.name}</h2>
                      <p>
                        Status: {s.status} · Commission:{" "}
                        {s.commission_bps === null
                          ? "Default"
                          : `${s.commission_bps / 100}%`}
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          void act(`/manage/shops/${s.id}`, {
                            status: f.get("status"),
                            commission:
                              f.get("commission") === ""
                                ? null
                                : Number(f.get("commission")),
                          });
                        }}
                      >
                        <label>
                          Status{" "}
                          <select name="status" defaultValue={s.status}>
                            {["pending", "approved", "suspended"].map((v) => (
                              <option key={v}>{v}</option>
                            ))}
                          </select>
                        </label>
                        <Field
                          label="Commission % (blank uses default)"
                          name="commission"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          defaultValue={
                            s.commission_bps === null
                              ? ""
                              : s.commission_bps / 100
                          }
                        />
                        <button
                          className="pm-btn pm-btn--primary"
                          disabled={busy}
                        >
                          Save shop
                        </button>
                      </form>
                    </section>
                  ))}
                {tab === "Orders" && (
                  <>
                    {!data.orders.length && <p>No orders yet.</p>}
                    {data.orders.map((o) => (
                      <section className="pm-management-card" key={o.id}>
                        <h2>Order {o.id.slice(0, 8)}</h2>
                        <p>
                          {new Date(o.created_at).toLocaleDateString()} ·{" "}
                          {money(o.total)} · {o.payment_status}
                          {o.is_demo ? " · Demo order" : ""}
                        </p>
                        <p>
                          {o.address.name} · {o.address.phone}
                          <br />
                          {[
                            o.address.line1,
                            o.address.line2,
                            o.address.city,
                            o.address.state,
                            o.address.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {o.shipments.map((s) => (
                          <div className="pm-management-shipment" key={s.id}>
                            <h3>
                              {s.seller_id
                                ? data.shops.find(
                                    (shop) => shop.id === s.seller_id,
                                  )?.name
                                : "PunjabiMarts"}{" "}
                              · {s.status}
                            </h3>
                            <ul>
                              {s.lines.map((l, i) => (
                                <li key={i}>
                                  {l.title} {l.variant} × {l.qty} ·{" "}
                                  {money(l.price * l.qty)} · Commission{" "}
                                  {money(l.commission)}
                                </li>
                              ))}
                            </ul>
                            {s.tracking && (
                              <p>
                                {s.carrier}: {s.tracking}
                              </p>
                            )}
                            {transitions[s.status] && (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const f = new FormData(e.currentTarget);
                                  if (
                                    f.get("status") === "cancelled" &&
                                    !window.confirm(
                                      "Cancel this shipment and restore its stock?",
                                    )
                                  )
                                    return;
                                  void act(
                                    `/manage/shipments/${s.id}`,
                                    Object.fromEntries(f),
                                  );
                                }}
                              >
                                <label>
                                  Next status{" "}
                                  <select name="status">
                                    {transitions[s.status].map((v) => (
                                      <option key={v}>{v}</option>
                                    ))}
                                  </select>
                                </label>
                                {s.status === "packed" && (
                                  <>
                                    <Field
                                      label="Courier"
                                      name="carrier"
                                      required
                                    />
                                    <Field
                                      label="Tracking number"
                                      name="tracking"
                                      required
                                    />
                                  </>
                                )}
                                <button className="pm-btn" disabled={busy}>
                                  Update shipment
                                </button>
                              </form>
                            )}
                          </div>
                        ))}
                        {admin &&
                          o.payment === "cod" &&
                          o.payment_status !== "collected" &&
                          o.shipments.some((s) => s.status === "delivered") &&
                          o.shipments.every((s) =>
                            ["delivered", "cancelled"].includes(s.status),
                          ) && (
                            <button
                              className="pm-btn"
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Confirm you have received the COD payment?",
                                  )
                                )
                                  void act(`/manage/orders/${o.id}/payment`, {
                                    status: "collected",
                                  });
                              }}
                            >
                              Record COD collected
                            </button>
                          )}
                      </section>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AccountGate>
  );
}
