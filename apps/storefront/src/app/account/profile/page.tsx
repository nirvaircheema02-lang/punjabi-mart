"use client";
import { useState } from "react";
import { api, json } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Field, Notice } from "@/components/commerce/Forms";
import { AccountGate } from "@/components/commerce/AccountGate";
export default function Profile() {
  const { account, refresh } = useStore();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(
    e: React.FormEvent<HTMLFormElement>,
    path: string,
    method: string,
  ) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(
        path,
        json(method, Object.fromEntries(new FormData(e.currentTarget))),
      );
      setMessage("Changes saved.");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="pm-container pm-section">
      <AccountGate>
        <h1 className="pm-h2">Your profile</h1>
        <Notice error>{error}</Notice>
        <Notice>{message}</Notice>
        <div className="pm-form-grid">
          <form
            className="pm-panel pm-stack"
            onSubmit={(e) => save(e, "/profile", "PATCH")}
          >
            <Field
              key={account?.name}
              label="Name"
              name="name"
              defaultValue={account?.name}
              required
              maxLength={100}
            />
            <Field
              label="Account email"
              value={account?.email ?? ""}
              readOnly
            />
            <button className="pm-btn pm-btn--primary" disabled={busy}>
              Save profile
            </button>
          </form>
          <form
            className="pm-panel pm-stack"
            onSubmit={(e) => save(e, "/password", "POST")}
          >
            <h2 className="pm-h4">Change password</h2>
            <Field
              label="Current password"
              name="current_password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Field
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
            <Field
              label="Confirm new password"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
            <button className="pm-btn pm-btn--secondary" disabled={busy}>
              Update password
            </button>
          </form>
        </div>
      </AccountGate>
    </div>
  );
}
