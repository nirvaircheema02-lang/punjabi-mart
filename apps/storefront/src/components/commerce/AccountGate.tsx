"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { ready, account, error } = useStore();
  const pathname = usePathname();
  if (!ready) return <p role="status">Loading your account…</p>;
  if (!account)
    return (
      <div className="pm-empty">
        <h1 className="pm-h3">Sign in to continue</h1>
        <p>
          {error ||
            "Your orders and saved addresses are linked to your account."}
        </p>
        <Link
          className="pm-btn pm-btn--primary"
          href={`/login?next=${encodeURIComponent(pathname)}`}
        >
          Sign in
        </Link>
      </div>
    );
  return children;
}
