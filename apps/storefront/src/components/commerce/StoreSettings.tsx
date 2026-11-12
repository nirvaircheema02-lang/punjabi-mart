"use client";

import { useState } from "react";
import { api, json } from "@/lib/api";
import type { ShopSettings } from "@/lib/commerce/types";
import { Field, Notice } from "./Forms";

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  resolved: boolean;
};
export type Operations = {
  settings: ShopSettings;
  messages: Message[];
  subscribers: number;
};

export function StoreSettings({
  settings,
  saved,
}: {
  settings: ShopSettings;
  saved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(
        "/manage/settings",
        json("PATCH", {
          freeDeliveryThreshold: Number(form.get("freeDeliveryThreshold")),
          deliveryFee: Number(form.get("deliveryFee")),
          commission: Number(form.get("commission")),
          supportEmail: form.get("supportEmail"),
          serviceablePrefixes: String(form.get("serviceablePrefixes"))
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          checkoutEnabled: form.get("checkoutEnabled") === "on",
          codEnabled: form.get("codEnabled") === "on",
        }),
      );
      await saved();
      setNotice("Store settings saved.");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="pm-management-card">
      <h2>Ordering and delivery</h2>
      <p>
        {settings.demo
          ? "Demo mode is enabled. Existing demo listings remain available."
          : "Live mode is enabled."}
      </p>
      <Notice error>{error}</Notice>
      <Notice>{notice}</Notice>
      <form onSubmit={submit}>
        <div className="pm-form-grid">
          <Field
            name="freeDeliveryThreshold"
            label="Free delivery above ₹"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={settings.freeDeliveryThreshold}
          />
          <Field
            name="deliveryFee"
            label="Delivery fee below threshold ₹"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={settings.deliveryFee}
          />
          <Field
            name="commission"
            label="Default seller commission %"
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            defaultValue={settings.commission}
          />
          <Field
            name="supportEmail"
            label="Support email"
            type="email"
            defaultValue={settings.supportEmail}
          />
          <Field
            name="serviceablePrefixes"
            label="Delivery pincode prefixes, separated by commas"
            defaultValue={settings.serviceablePrefixes.join(", ")}
          />
        </div>
        <p>
          Example: 141 permits pincodes beginning with 141. Leave empty to
          disable all delivery areas.
        </p>
        <label>
          <input
            name="checkoutEnabled"
            type="checkbox"
            defaultChecked={settings.checkoutEnabled}
          />{" "}
          Allow orders
        </label>
        <label>
          <input
            name="codEnabled"
            type="checkbox"
            defaultChecked={settings.codEnabled}
          />{" "}
          Offer cash on delivery
        </label>
        <button className="pm-btn pm-btn--primary" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </form>
    </section>
  );
}

export function SupportInbox({
  messages,
  subscribers,
  act,
  busy,
}: {
  messages: Message[];
  subscribers: number;
  act: (path: string, body: unknown) => Promise<void>;
  busy: boolean;
}) {
  return (
    <section>
      <h2>Customer messages</h2>
      <p>{subscribers} newsletter subscribers</p>
      {!messages.length && <p>No customer messages yet.</p>}
      {messages.map((message) => (
        <article className="pm-management-card" key={message.id}>
          <h3>{message.name}</h3>
          <a href={`mailto:${message.email}`}>{message.email}</a>
          <p style={{ whiteSpace: "pre-wrap" }}>{message.message}</p>
          <button
            className="pm-btn"
            disabled={busy}
            onClick={() =>
              void act(`/manage/messages/${message.id}`, {
                resolved: !message.resolved,
              })
            }
          >
            {message.resolved ? "Reopen" : "Mark resolved"}
          </button>
        </article>
      ))}
    </section>
  );
}
