"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Heart, MapPin, UserCircle, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AccountPage() {
  const router = useRouter();
  const { account, ready, signOut, wishlist, cartCount } = useStore();

  if (!ready) {
    return (
      <div className="pm-container">
        <section className="pm-section">
          <div
            className="pm-skeleton pm-skeleton--text"
            style={{ width: "40%", height: 32 }}
          />
        </section>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="pm-container">
        <section className="pm-section">
          <div className="pm-empty">
            <h1 className="pm-h3">You’re not signed in</h1>
            <p className="pm-body pm-ink-muted">
              Sign in to see orders, addresses and saved items.
            </p>
            <Link
              href="/login"
              className="pm-btn pm-btn--primary pm-btn--prominent"
            >
              Login or create account
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const tiles = [
    {
      href: "/account/orders",
      Icon: Package,
      title: "My orders",
      body: "Track and review past orders",
    },
    {
      href: "/wishlist",
      Icon: Heart,
      title: "Wishlist",
      body: `${wishlist.length} saved items`,
    },
    {
      href: "/account/addresses",
      Icon: MapPin,
      title: "Addresses",
      body: "Delivery addresses",
    },
    {
      href: "/account/profile",
      Icon: UserCircle,
      title: "Profile",
      body: "Name and contact details",
    },
  ];

  return (
    <div className="pm-container">
      <section className="pm-section">
        <div className="pm-section__head">
          <div>
            <h1 className="pm-h2">{account.name}</h1>
            <p className="pm-small pm-ink-muted">
              {account.email} · {cartCount} items in cart
            </p>
          </div>
          <button
            className="pm-btn pm-btn--secondary pm-btn--compact"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>

        {account.role !== "customer" && (
          <Link
            className="pm-btn pm-btn--primary"
            href={account.role === "admin" ? "/admin" : "/seller"}
          >
            Open {account.role === "admin" ? "admin" : "seller"} dashboard
          </Link>
        )}
        <Link className="pm-btn" href="/sell">
          Sell with PunjabiMarts / application status
        </Link>
        <div className="pm-trustgrid">
          {tiles.map(({ href, Icon, title, body }) => (
            <Link
              key={href}
              href={href}
              className="pm-pillar"
              style={{ textDecoration: "none" }}
            >
              <span className="pm-pillar__icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <strong className="pm-body">{title}</strong>
              <p className="pm-small pm-ink-muted">{body}</p>
            </Link>
          ))}
        </div>

        <p
          className="pm-field__message"
          style={{ marginTop: "var(--space-6)" }}
        >
          Your account, addresses and orders are securely stored with your
          account.
        </p>
      </section>
    </div>
  );
}
