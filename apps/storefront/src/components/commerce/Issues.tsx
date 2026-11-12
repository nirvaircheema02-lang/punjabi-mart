"use client";

import { useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import type { OrderLine, Shipment } from "@/lib/commerce/types";
import { Field, Notice } from "./Forms";

type Issue = {
  id: number;
  shipment_id: number;
  product_id: string;
  variant: string | null;
  reason: string;
  remedy: string;
  status: string;
  customer_note: string;
  seller_note: string | null;
  admin_note: string | null;
  refund_paise: number;
  refund_reference: string | null;
  replacement_tracking: string | null;
};
const transitions: Record<string, string[]> = {
  submitted: ["needs_info", "approved_replacement", "refund_due", "rejected"],
  needs_info: ["approved_replacement", "refund_due", "rejected"],
  approved_replacement: ["replacement_shipped", "refund_due"],
  replacement_shipped: ["closed"],
  refund_due: ["refunded"],
  refunded: ["closed"],
};

export function CustomerIssues({
  shipment,
  line,
}: {
  shipment: Shipment;
  line: OrderLine;
}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<Issue[]>("/issues")
      .then((items) => {
        if (active) setIssues(items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const issue = issues.find(
    (item) =>
      item.shipment_id === shipment.id &&
      item.product_id === line.productId &&
      item.variant === (line.variant ?? null),
  );
  if (shipment.status !== "delivered") return null;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      setIssues(
        await api<Issue[]>(
          "/issues",
          json("POST", {
            shipmentId: shipment.id,
            productId: line.productId, variant: line.variant ?? null,
            reason: form.get("reason"),
            remedy: form.get("remedy"),
            note: form.get("note"),
          }),
        ),
      );
      setOpen(false);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="pm-issue-customer">
      {issue ? (
        <p className="pm-small">
          Issue #{issue.id}: {issue.status.replaceAll("_", " ")}
          {issue.replacement_tracking
            ? ` · Replacement tracking: ${issue.replacement_tracking}`
            : ""}
          {issue.refund_reference
            ? ` · Refund reference: ${issue.refund_reference}`
            : ""}
          {issue.admin_note ? ` · ${issue.admin_note}` : ""}
        </p>
      ) : (
        <button
          className="pm-btn pm-btn--secondary"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close issue form" : `Report an issue with ${line.title}`}
        </button>
      )}
      {open && !issue && (
        <form className="pm-panel pm-stack" onSubmit={submit}>
          <h3 className="pm-h4">Tell us what went wrong</h3>
          <label className="pm-field">
            Reason
            <select className="pm-input" name="reason" required>
              <option value="damaged">Damaged</option>
              <option value="defective">Defective</option>
              <option value="wrong_item">Wrong item or size</option>
              <option value="not_as_described">Not as described</option>
              <option value="late">Late delivery</option>
            </select>
          </label>
          <label className="pm-field">
            Preferred solution
            <select className="pm-input" name="remedy">
              <option value="replacement">Replacement</option>
              <option value="refund">Refund</option>
            </select>
          </label>
          <label className="pm-field">
            What happened?
            <textarea
              className="pm-input"
              name="note"
              rows={3}
              minLength={10}
              maxLength={2000}
              required
            />
          </label>
          <Notice error>{error}</Notice>
          <button className="pm-btn pm-btn--primary" disabled={busy}>
            {busy ? "Submitting…" : "Submit issue"}
          </button>
          <p className="pm-caption">
            We review every request. This form does not issue a refund
            automatically.
          </p>
        </form>
      )}
    </div>
  );
}

export function ManageIssues({ admin }: { admin: boolean }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api<Issue[]>("/issues")
      .then((items) => {
        if (active) setIssues(items);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function update(event: React.FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = admin
      ? {
          status: form.get("status"),
          adminNote: form.get("adminNote"),
          refundAmount: form.get("refundAmount")
            ? Number(form.get("refundAmount"))
            : null,
          refundReference: form.get("refundReference"),
          replacementTracking: form.get("replacementTracking"),
        }
      : { sellerNote: form.get("sellerNote") };
    try {
      setIssues(await api<Issue[]>(`/issues/${id}`, json("PATCH", payload)));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Customer issues</h2>
      <Notice error>{error}</Notice>
      {!issues.length && <p>No reported issues yet.</p>}
      {issues.map((issue) => (
        <article className="pm-management-card" key={issue.id}>
          <h3>
            Issue #{issue.id} · {issue.status.replaceAll("_", " ")}
          </h3>
          <p>
            Order item: {issue.product_id} · {issue.variant ?? "Standard"}
          </p>
          <p>
            {issue.reason.replaceAll("_", " ")} · Asked for {issue.remedy}
          </p>
          <p>{issue.customer_note}</p>
          {issue.seller_note && <p>Seller: {issue.seller_note}</p>}
          {issue.admin_note && <p>Owner: {issue.admin_note}</p>}
          {issue.refund_reference && (
            <p>Refund reference: {issue.refund_reference}</p>
          )}
          {issue.replacement_tracking && (
            <p>Replacement tracking: {issue.replacement_tracking}</p>
          )}
          <form
            className="pm-stack"
            onSubmit={(event) => update(event, issue.id)}
          >
            {admin ? (
              <>
                <label>
                  Status
                  <select name="status" className="pm-input" required>
                    {(transitions[issue.status] ?? []).map((value) => (
                      <option key={value} value={value}>
                        {value.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Decision or next step
                  <textarea
                    name="adminNote"
                    className="pm-input"
                    rows={2}
                    minLength={5}
                    required
                  />
                </label>
                <Field
                  label="Actual refund amount ₹ (when marking refunded)"
                  name="refundAmount"
                  type="number"
                  min={0}
                  step="0.01"
                />
                <Field
                  label="Transfer reference (when marking refunded)"
                  name="refundReference"
                />
                <Field
                  label="Replacement tracking (when shipped)"
                  name="replacementTracking"
                />
              </>
            ) : (
              <label>
                Seller response
                <textarea
                  name="sellerNote"
                  className="pm-input"
                  rows={2}
                  minLength={5}
                  required
                />
              </label>
            )}
            {(!admin || (transitions[issue.status] ?? []).length > 0) && (
              <button className="pm-btn pm-btn--secondary" disabled={busy}>
                Save response
              </button>
            )}
          </form>
        </article>
      ))}
    </section>
  );
}
