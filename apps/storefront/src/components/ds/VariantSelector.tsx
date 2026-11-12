"use client";

import Link from "next/link";
import { useState } from "react";
import type { VariantGroup } from "@/lib/mock-data";

/**
 * VariantSelector — generalised from the original SizeSelector.
 *
 * Turbans forced this: they need a variant choice (length, shade) but have
 * nothing to do with body sizing. Rather than duplicate the component for a
 * second axis, the label and options are data. Juttis pass sizes, turbans pass
 * lengths + shades, kadas pass Small/Medium/Large — one component.
 *
 * Chips are 52×52 with three visually distinct states (selected / unselected /
 * unavailable). The "diagonal strikethrough" convention for out-of-stock could
 * not be sourced anywhere, so we use an explicit disabled treatment plus a
 * text note instead of inheriting folklore.
 */
export function VariantSelector({
  variant,
  variantStocks,
  onChange,
}: {
  variant: VariantGroup;
  variantStocks?: Record<string, number>;
  onChange?: (primary: string | null, secondary: string | null) => void;
}) {
  const [primary, setPrimary] = useState<string | null>(null);
  const [secondary, setSecondary] = useState<string | null>(null);
  const oos = variant.outOfStock ?? [];
  const available = (primary: string, secondary?: string | null) => {
    if (!variantStocks) return !oos.includes(primary);
    if (secondary) return (variantStocks[`${primary} · ${secondary}`] ?? 0) > 0;
    return variant.secondary
      ? variant.secondary.options.some(
          (value) => (variantStocks[`${primary} · ${value}`] ?? 0) > 0,
        )
      : (variantStocks[primary] ?? 0) > 0;
  };

  const pick = (p: string | null, s: string | null) => {
    setPrimary(p);
    setSecondary(s);
    onChange?.(p, s);
  };

  return (
    <div className="pm-variant">
      <div className="pm-variant__head">
        <span className="pm-label">{variant.label}</span>
        {/* Only sized goods need a size guide; a turban length doesn't. */}
        {/^select size$/i.test(variant.label) && (
          <Link
            href="/help/size-guide"
            className="pm-btn pm-btn--tertiary pm-btn--compact"
          >
            Size guide
          </Link>
        )}
      </div>

      <div className="pm-sizes" role="group" aria-label={variant.label}>
        {variant.options.map((o) => {
          const unavailable = !available(o);
          return (
            <button
              key={o}
              className="pm-size"
              aria-pressed={primary === o}
              disabled={unavailable}
              title={unavailable ? "Out of stock" : undefined}
              onClick={() =>
                pick(o, secondary && available(o, secondary) ? secondary : null)
              }
            >
              {o}
            </button>
          );
        })}
      </div>

      {variant.secondary && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <span className="pm-label">{variant.secondary.label}</span>
          <div
            className="pm-shades"
            role="group"
            aria-label={variant.secondary.label}
          >
            {variant.secondary.options.map((s) => (
              <button
                key={s}
                disabled={
                  primary
                    ? !available(primary, s)
                    : !variant.options.some((value) => available(value, s))
                }
                title={
                  primary && !available(primary, s) ? "Out of stock" : undefined
                }
                className="pm-shade"
                aria-pressed={secondary === s}
                onClick={() => pick(primary, s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="pm-field__message">
        {primary
          ? `${primary}${secondary ? ` · ${secondary}` : ""} selected`
          : oos.length
            ? `${oos.join(", ")} currently out of stock`
            : `Choose ${variant.label.replace(/^Select /i, "")} to continue`}
      </p>
    </div>
  );
}
