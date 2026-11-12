"use client";

import Link from "next/link";
import { useState } from "react";
import { api, json } from "@/lib/api";
// Lucide 1.47 removed all brand icons (trademark). Generic marks with accessible
// labels are used instead — which also keeps us honest: these are placeholders
// until the real accounts exist.
import { ChevronDown, AtSign, MessageCircle, Send } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

/**
 * Marketplace footer. Six link columns on desktop; on mobile each column
 * collapses into an accordion so the footer doesn't become an endless scroll.
 *
 * Payment marks are deliberately generic text — no provider logos until the
 * gateway is actually contracted. Showing a Razorpay or Visa mark before that
 * is a claim we can't back.
 */

const columns = [
  {
    title: "Shop",
    links: [
      ["Turbans", "/c/turbans"],
      ["Patkas", "/c/patka"],
      ["Phulkari", "/c/phulkari"],
      ["Jutti", "/c/jutti"],
      ["Kurta Pajama", "/c/kurta-pajama"],
      ["Jewellery", "/c/jewellery"],
      ["Home & Gifting", "/c/gifts"],
      ["Pantry", "/c/pantry"],
    ],
  },
  {
    title: "Wedding & Ceremonies",
    links: [
      ["Roka", "/ceremony/roka"],
      ["Shagun", "/ceremony/shagun"],
      ["Sahe Chithi", "/ceremony/sahe-chithi"],
      ["Haldi", "/ceremony/haldi"],
      ["Mehendi", "/ceremony/mehendi"],
      ["Jaggo", "/ceremony/jaggo"],
      ["Chura", "/ceremony/chura"],
      ["Wedding", "/ceremony/wedding"],
    ],
  },
  {
    title: "Customer Care",
    links: [
      ["Contact us", "/help/contact"],
      ["FAQs", "/help/faqs"],
      ["Shipping", "/help/shipping"],
      ["Returns", "/help/returns"],
      ["Track order", "/help/tracking"],
      ["Size guide", "/help/size-guide"],
    ],
  },
  {
    title: "About",
    links: [
      ["About PunjabiMarts", "/about"],
      ["Our sellers", "/about/sellers"],
      ["Our story", "/about/story"],
      ["Journal", "/journal"],
      ["About our imagery", "/photo-credits"],
    ],
  },
  {
    title: "Sell on PunjabiMarts",
    links: [
      ["Become a seller", "/sell"],
      ["Seller login", "/seller/login"],
      ["Seller help", "/sell/help"],
    ],
  },
  {
    title: "Policies",
    links: [
      ["Privacy", "/policies/privacy"],
      ["Terms", "/policies/terms"],
      ["Returns policy", "/policies/returns"],
      ["Shipping policy", "/policies/shipping"],
    ],
  },
];

export function Footer() {
  const [open, setOpen] = useState<string | null>(null);
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <footer className="pm-footer" data-theme="inverse">
      <div className="pm-container">
        <div className="pm-footer__top">
          <div className="pm-footer__brand">
            <BrandLogo footer />
            <p
              className="pm-small pm-ink-muted"
              style={{ marginTop: "var(--space-3)", maxWidth: "34ch" }}
            >
              Punjabi products, crafts and everyday goods from our own catalogue
              and approved partner shops.
            </p>
            <div className="pm-footer__social">
              <span
                className="pm-iconbtn"
                title="Instagram page is being prepared"
                aria-label="Instagram page is being prepared"
              >
                <AtSign size={18} aria-hidden="true" />
              </span>
              <span
                className="pm-iconbtn"
                title="WhatsApp support is being prepared"
                aria-label="WhatsApp support is being prepared"
              >
                <MessageCircle size={18} aria-hidden="true" />
              </span>
              <button
                type="button"
                className="pm-iconbtn"
                aria-label="Share PunjabiMarts"
                title="Share PunjabiMarts"
                onClick={async () => {
                  try {
                    if (navigator.share)
                      await navigator.share({
                        title: "PunjabiMarts",
                        url: location.origin,
                      });
                    else {
                      await navigator.clipboard.writeText(location.origin);
                      setNewsletterStatus("Website link copied.");
                    }
                  } catch {
                    /* Sharing was dismissed. */
                  }
                }}
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <nav className="pm-footer__cols" aria-label="Footer">
            {columns.map((col) => {
              const isOpen = open === col.title;
              return (
                <div
                  key={col.title}
                  className="pm-footer__col"
                  data-open={isOpen}
                >
                  {/* Button on mobile (accordion), plain heading on desktop. */}
                  <button
                    className="pm-footer__coltitle"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : col.title)}
                  >
                    {col.title}
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className="pm-footer__chev"
                    />
                  </button>
                  <ul className="pm-footer__list">
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        <Link href={href}>{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="pm-footer__newsletter">
          <div>
            <strong className="pm-body-lg">New pieces, occasionally</strong>
            <p className="pm-small pm-ink-muted">
              Craft stories and new arrivals. No daily offers.
            </p>
          </div>
          <form
            className="pm-footer__form"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const email = new FormData(form).get("email");
              setSubmitting(true);
              setNewsletterStatus("");
              try {
                const result = await api<{ message: string }>(
                  "/subscribe",
                  json("POST", { email, consent: true }),
                );
                setNewsletterStatus(result.message);
                form.reset();
              } catch (error) {
                setNewsletterStatus((error as Error).message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <label className="pm-visually-hidden" htmlFor="nl">
              Email address
            </label>
            <input
              className="pm-input"
              id="nl"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
            <button
              className="pm-btn pm-btn--primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Subscribe"}
            </button>
          </form>
          <p role="status" aria-live="polite" className="pm-small">
            {newsletterStatus}
          </p>
        </div>

        <div className="pm-footer__bottom">
          <p className="pm-caption pm-ink-muted">
            © {new Date().getFullYear()} PunjabiMarts. All rights reserved.
          </p>
          {/* Generic until a gateway is contracted — no provider logos. */}
          <p className="pm-caption pm-ink-muted">
            Checkout currently offers COD where eligible.
          </p>
          <p className="pm-caption pm-ink-muted">
            Demo storefront · AI-generated catalogue imagery · Payments in test
            mode.
          </p>
        </div>
      </div>
    </footer>
  );
}
