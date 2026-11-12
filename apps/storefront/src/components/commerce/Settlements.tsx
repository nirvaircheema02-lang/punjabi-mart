"use client";

import { useCallback, useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import { Field, Notice } from "./Forms";

type Summary = {
  sellerId: string;
  shop: string;
  earned: number;
  refunded: number;
  held: number;
  paid: number;
  available: number;
  overpaid: number;
};
type Payout = {
  id: number;
  seller_id: string;
  amount_paise: number;
  reference: string;
  created_at: string;
};
type Data = { summary: Summary[]; payouts: Payout[] };
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );
export function Settlements({ admin }: { admin: boolean }) {
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    async () => setData(await api<Data>("/settlements")),
    [],
  );
  useEffect(() => {
    let active = true;
    api<Data>("/settlements")
      .then((value) => {
        if (active) setData(value);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function record(
    event: React.FormEvent<HTMLFormElement>,
    sellerId: string,
  ) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      setData(
        await api<Data>(
          "/settlements/payouts",
          json("POST", {
            sellerId,
            amount: Number(form.get("amount")),
            reference: form.get("reference"),
            note: form.get("note"),
          }),
        ),
      );
      event.currentTarget.reset();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Seller settlements</h2>
      <p>
        Balances include delivered orders with recorded COD collection. Open
        issues are held. Recording a payout does not transfer money.
      </p>
      <Notice error>{error}</Notice>
      <button
        className="pm-btn pm-btn--secondary"
        onClick={() => void load().catch((error) => setError(error.message))}
      >
        Refresh balances
      </button>
      {!data ? (
        <p role="status">Loading balances…</p>
      ) : (
        <>
          {data.summary.map((row) => (
            <article className="pm-management-card" key={row.sellerId}>
              <h3>{row.shop}</h3>
              <dl className="pm-settlement-grid">
                {[
                  ["Earned", row.earned],
                  ["Refunded", row.refunded],
                  ["Held", row.held],
                  ["Already paid", row.paid],
                  ["Available", row.available],
                  ["Overpaid adjustment", row.overpaid],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{money(value as number)}</dd>
                  </div>
                ))}
              </dl>
              {admin && row.available > 0 && (
                <form
                  onSubmit={(event) => record(event, row.sellerId)}
                  className="pm-stack"
                >
                  <p>
                    Record an actual bank or cash payout after completing it.
                  </p>
                  <div className="pm-form-grid">
                    <Field
                      label="Amount ₹"
                      name="amount"
                      type="number"
                      min="0.01"
                      max={row.available}
                      step="0.01"
                      required
                    />
                    <Field
                      label="Payment reference"
                      name="reference"
                      required
                      maxLength={100}
                    />
                    <Field
                      label="Note (optional)"
                      name="note"
                      maxLength={1000}
                    />
                  </div>
                  <button className="pm-btn pm-btn--primary" disabled={busy}>
                    Record payout
                  </button>
                </form>
              )}
            </article>
          ))}
          <h3>Recorded payouts</h3>
          {!data.payouts.length && <p>None yet.</p>}
          {data.payouts.map((payout) => (
            <p key={payout.id}>
              {payout.seller_id} · {money(payout.amount_paise / 100)} ·{" "}
              {payout.reference} ·{" "}
              {new Date(payout.created_at).toLocaleDateString("en-IN")}
            </p>
          ))}
        </>
      )}
    </section>
  );
}
