"use client";
import { useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Address } from "@/lib/commerce/types";
import {
  AddressFields,
  emptyAddress,
  Notice,
} from "@/components/commerce/Forms";
import { AccountGate } from "@/components/commerce/AccountGate";
export default function Addresses() {
  const { account } = useStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [value, setValue] = useState<Address>(emptyAddress);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (account)
      api<Address[]>("/addresses")
        .then(setAddresses)
        .catch((e) => setError(e.message));
  }, [account]);
  return (
    <div className="pm-container pm-section">
      <AccountGate>
        <h1 className="pm-h2">Delivery addresses</h1>
        <Notice error>{error}</Notice>
        <div className="pm-form-grid">
          {addresses.map((a) => (
            <article className="pm-panel pm-stack" key={a.id}>
              <strong>{a.name}</strong>
              <p>
                {a.line1}, {a.line2} {a.city}, {a.state} {a.pincode}
              </p>
              <p>{a.phone}</p>
              <div className="pm-actions">
                <button
                  className="pm-btn pm-btn--secondary"
                  onClick={() => setValue(a)}
                >
                  Edit
                </button>
                <button
                  disabled={busy}
                  className="pm-btn pm-btn--tertiary"
                  onClick={async () => {
                    if (!confirm("Delete this address?")) return;
                    setBusy(true);
                    try {
                      setAddresses(
                        await api<Address[]>(`/addresses/${a.id}`, {
                          method: "DELETE",
                        }),
                      );
                      if (value.id === a.id) setValue(emptyAddress);
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
        <form
          className="pm-panel pm-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              setAddresses(
                await api<Address[]>("/addresses", json("POST", value)),
              );
              setValue(emptyAddress);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="pm-h4">{value.id ? "Edit address" : "Add address"}</h2>
          <AddressFields value={value} onChange={setValue} />
          <div className="pm-actions">
            <button disabled={busy} className="pm-btn pm-btn--primary">
              {busy ? "Saving…" : "Save address"}
            </button>
            {value.id && (
              <button
                type="button"
                className="pm-btn pm-btn--secondary"
                onClick={() => setValue(emptyAddress)}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </AccountGate>
    </div>
  );
}
