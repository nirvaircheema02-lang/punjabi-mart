"use client";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Address } from "@/lib/commerce/types";
export function Field({
  label,
  error,
  hint,
  trailing,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  trailing?: React.ReactNode;
}) {
  const generated = useId();
  const id = props.id ?? generated;
  return (
    <div className="pm-field">
      <label className="pm-label" htmlFor={id}>
        {label}
      </label>
      <div
        className={`pm-input-wrap${trailing ? " pm-input-wrap--trailing" : ""}`}
      >
        <input
          {...props}
          id={id}
          className={`pm-input ${props.className ?? ""}`}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={
            [props["aria-describedby"], error || hint ? `${id}-message` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {trailing}
      </div>
      {(error || hint) && (
        <span
          id={`${id}-message`}
          className="pm-field__message"
          data-state={error ? "error" : undefined}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
export function PasswordField({
  label = "Password",
  ...props
}: React.ComponentProps<typeof Field>) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...props}
      label={label}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          disabled={props.disabled}
          className="pm-password-toggle"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? (
            <EyeOff size={20} aria-hidden="true" />
          ) : (
            <Eye size={20} aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return children ? (
    <p
      className={`pm-notice${error ? " pm-notice--error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  ) : null;
}
export const emptyAddress: Address = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};
export function AddressFields({
  value,
  onChange,
}: {
  value: Address;
  onChange: (a: Address) => void;
}) {
  return (
    <div className="pm-form-grid">
      {(
        [
          ["name", "Full name", "name"],
          ["phone", "Mobile number", "tel"],
          ["line1", "House, street and area", "address-line1"],
          ["line2", "Landmark (optional)", "address-line2"],
          ["city", "City", "address-level2"],
          ["state", "State", "address-level1"],
          ["pincode", "Pincode", "postal-code"],
        ] as const
      ).map(([key, label, autocomplete]) => (
        <Field
          key={key}
          label={label}
          name={key}
          value={value[key] ?? ""}
          autoComplete={autocomplete}
          required={key !== "line2"}
          maxLength={key === "phone" ? 10 : key === "pincode" ? 6 : 200}
          type={key === "phone" ? "tel" : "text"}
          inputMode={["phone", "pincode"].includes(key) ? "numeric" : "text"}
          pattern={
            key === "phone"
              ? "[6-9][0-9]{9}"
              : key === "pincode"
                ? "[1-9][0-9]{5}"
                : undefined
          }
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        />
      ))}
    </div>
  );
}
