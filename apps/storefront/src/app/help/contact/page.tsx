"use client";

import { useState } from "react";
import { api, json } from "@/lib/api";
import { Field, Notice } from "@/components/commerce/Forms";

export default function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api<{ message: string }>(
        "/contact",
        json("POST", Object.fromEntries(new FormData(form))),
      );
      setMessage(result.message);
      form.reset();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="pm-container pm-section">
      <h1 className="pm-h2">Contact PunjabiMarts</h1>
      <p>Include your order number if you need help with an order.</p>
      <form className="pm-stack" onSubmit={submit}>
        <Field
          label="Name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={190}
        />
        <label className="pm-field">
          <span className="pm-label">Message</span>
          <textarea
            className="pm-input"
            name="message"
            rows={5}
            minLength={10}
            maxLength={5000}
            required
          />
        </label>
        <Notice error>{error}</Notice>
        <Notice>{message}</Notice>
        <button className="pm-btn pm-btn--primary" disabled={busy}>
          {busy ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
