"use client";
import Link from "next/link";
import { useState } from "react";
import { api, json } from "@/lib/api";
import { Field, Notice } from "@/components/commerce/Forms";
export default function Reset() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="pm-container">
      <section className="pm-section">
        <form
          className="pm-auth pm-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const data = Object.fromEntries(new FormData(e.currentTarget));
            const q = new URLSearchParams(window.location.search);
            try {
              const r = await api<{ message: string }>(
                "/reset-password",
                json("POST", {
                  ...data,
                  email: q.get("email"),
                  token: q.get("token"),
                }),
              );
              setMessage(r.message);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h1 className="pm-h3">Choose a new password</h1>
          <Field
            label="New password"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
          <Field
            label="Confirm password"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
          <Notice error>{error}</Notice>
          <Notice>{message}</Notice>
          {message ? (
            <Link href="/login" className="pm-btn pm-btn--primary">
              Sign in
            </Link>
          ) : (
            <button disabled={busy} className="pm-btn pm-btn--primary">
              {busy ? "Saving…" : "Reset password"}
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
