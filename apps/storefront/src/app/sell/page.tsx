"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import { useStore } from "@/lib/store";
import { AccountGate } from "@/components/commerce/AccountGate";
import { Field, Notice } from "@/components/commerce/Forms";

type Application = {
  name: string;
  status: "pending" | "approved" | "suspended";
};

export default function SellPage() {
  const { account } = useStore();
  const [application, setApplication] = useState<Application | null>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (account)
      api<{ application: Application | null }>("/seller-application")
        .then((result) => {
          if (active) setApplication(result.application);
        })
        .catch((error) => {
          if (active) setError(error.message);
        });
    return () => {
      active = false;
    };
  }, [account?.id, account]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      await api("/seller-application", json("POST", data));
      setApplication({ name: String(data.name), status: "pending" });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountGate>
      <div className="pm-container pm-section">
        <h1 className="pm-h2">Sell with PunjabiMarts</h1>
        <p>
          Tell us about your shop. We review every application before enabling
          product submissions.
        </p>
        <Notice error>{error}</Notice>
        {application ? (
          <section className="pm-section">
            <h2 className="pm-h3">{application.name}</h2>
            <p>
              Application status: <strong>{application.status}</strong>
            </p>
            {application.status === "approved" ? (
              <Link href="/seller" className="pm-btn pm-btn--primary">
                Open seller centre
              </Link>
            ) : (
              <p>
                {application.status === "pending"
                  ? "Your application is with the store owner. Check back here for an update."
                  : "Your shop is currently suspended. Contact the store owner before listing more products."}
              </p>
            )}
          </section>
        ) : account?.role === "admin" ? (
          <Link href="/admin">Open admin panel</Link>
        ) : application === undefined ? (
          <p role="status">Loading application…</p>
        ) : (
          <form onSubmit={submit} className="pm-section">
            <div className="pm-form-grid">
              <Field name="name" label="Shop name" required maxLength={150} />
              <Field name="city" label="City" required maxLength={100} />
              <Field
                name="speciality"
                label="What do you sell?"
                required
                maxLength={500}
              />
              <Field
                name="since"
                label="Year established"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                required
              />
              <Field
                name="story"
                label="About your shop (optional)"
                maxLength={2000}
              />
            </div>
            <button className="pm-btn pm-btn--primary" disabled={busy}>
              {busy ? "Submitting…" : "Submit application"}
            </button>
          </form>
        )}
      </div>
    </AccountGate>
  );
}
