"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { navGroups, categories, ceremonies } from "@/lib/taxonomy";
import { useStore } from "@/lib/store";
import { BrandLogo } from "./BrandLogo";

/**
 * Header. Search stays the dominant utility; the catalogue is large enough now
 * that a mega menu is genuinely warranted rather than decorative — 19
 * categories cannot sit in a flat navbar.
 */
export function Header() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const dialog = drawerRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const { cartCount, wishlist, account, ready } = useStore();

  return (
    <header className="pm-header">
      <div className="pm-container">
        <div className="pm-header__bar">
          <button
            className="pm-iconbtn pm-header__menubtn"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            href="/"
            className="pm-header__logo"
            aria-label="PunjabiMarts home"
          >
            <BrandLogo priority />
          </Link>

          <form action="/search" className="pm-header__search" role="search">
            <label className="pm-visually-hidden" htmlFor="site-search">
              Search products
            </label>
            <div className="pm-searchbox">
              <Search
                size={18}
                aria-hidden="true"
                className="pm-searchbox__icon"
              />
              <input
                id="site-search"
                name="q"
                type="search"
                enterKeyHint="search"
                className="pm-input pm-searchbox__input"
                placeholder="Search juttis, phulkari, gifts, pantry…"
              />
            </div>
          </form>

          <div className="pm-header__actions">
            <Link
              href={account ? "/account" : "/login"}
              className="pm-iconbtn"
              title={account ? "Account" : "Login / Sign up"}
              aria-label={account ? "Account" : "Login or sign up"}
            >
              <User size={20} aria-hidden="true" />
              <span className="pm-iconbtn__label">
                {ready && account ? "Account" : "Login"}
              </span>
            </Link>
            <Link
              href="/wishlist"
              className="pm-iconbtn"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={20} aria-hidden="true" />
              {ready && wishlist.length > 0 && (
                <span className="pm-badgecount">{wishlist.length}</span>
              )}
            </Link>
            <Link
              href="/cart"
              className="pm-iconbtn"
              title="Cart"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {ready && cartCount > 0 && (
                <span className="pm-badgecount">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop mega nav */}
        <nav className="pm-nav" aria-label="Main">
          {navGroups.map((g) => {
            const cats = categories.filter((c) => c.group === g.slug);
            const isOpen = openGroup === g.slug;
            return (
              <div
                key={g.slug}
                className="pm-nav__item"
                onMouseEnter={() => setOpenGroup(g.slug)}
                onMouseLeave={() => setOpenGroup(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setOpenGroup(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setOpenGroup(null);
                    event.currentTarget.querySelector("button")?.focus();
                  }
                }}
              >
                <button
                  className="pm-nav__trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup(isOpen ? null : g.slug)}
                >
                  {g.name}
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="pm-mega">
                    <div className="pm-mega__grid">
                      {cats.map((c) => (
                        <div key={c.slug} className="pm-mega__col">
                          <Link href={`/c/${c.slug}`} className="pm-mega__head">
                            {c.name}
                          </Link>
                          <ul className="pm-mega__list">
                            {c.children.slice(0, 7).map((s) => (
                              <li key={s.slug}>
                                <Link href={`/c/${c.slug}?sub=${s.slug}`}>
                                  {s.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {g.slug === "wedding" && (
                        <div className="pm-mega__col pm-mega__col--feature">
                          <span className="pm-mega__head">
                            Shop by ceremony
                          </span>
                          <ul className="pm-mega__list">
                            {ceremonies.slice(0, 8).map((c) => (
                              <li key={c.slug}>
                                <Link href={`/ceremony/${c.slug}`}>
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Link href="/about/sellers" className="pm-nav__trigger">
            Sellers
          </Link>
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <dialog
          ref={drawerRef}
          id="mobile-navigation"
          className="pm-drawer"
          aria-label="Menu"
          onCancel={() => setMobileOpen(false)}
        >
          <div className="pm-drawer__head">
            <span className="pm-h4">Browse</span>
            <button
              className="pm-iconbtn"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="pm-drawer__body">
            <p className="pm-label">Shop by ceremony</p>
            <div className="pm-drawer__chips">
              {ceremonies.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ceremony/${c.slug}`}
                  className="pm-rail__item"
                  onClick={() => setMobileOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
            </div>
            {navGroups.map((g) => (
              <div key={g.slug} className="pm-drawer__group">
                <p className="pm-label">{g.name}</p>
                <ul className="pm-drawer__list">
                  {categories
                    .filter((c) => c.group === g.slug)
                    .map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/c/${c.slug}`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </dialog>
      )}
    </header>
  );
}
