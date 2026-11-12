"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { api, ApiError, json } from "@/lib/api";
import type { Account } from "@/lib/commerce/types";
import { Field, PasswordField, Notice } from "@/components/commerce/Forms";

type Mode = "login" | "register" | "forgot";
export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useStore();
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    api<{ emailOtpEnabled: boolean }>("/session")
      .then((data) => setOtpEnabled(data.emailOtpEnabled))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function changeMode(next: Mode) {
    setMode(next);
    setError("");
    setFields({});
    setMessage("");
    setCodeSent(false);
    setMethod("password");
  }
  function finish(user: Account) {
    signIn(user);
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext =
      next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\");
    router.push(
      safeNext && next
        ? next
        : user.role === "admin"
          ? "/admin"
          : user.role === "seller"
            ? "/seller"
            : "/account",
    );
  }
  async function sendCode() {
    const data = await api<{ message: string; retryAfter: number }>(
      "/otp/request",
      json("POST", { email }),
    );
    setCodeSent(true);
    setMessage(data.message);
    setCooldown(data.retryAfter);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const validation: Record<string, string> = {};
    for (const input of Array.from(form.elements)) {
      if (input instanceof HTMLInputElement && !input.validity.valid)
        validation[input.name] = input.validity.valueMissing
          ? "This field is required."
          : input.type === "email"
            ? "Enter a valid email address."
            : input.name === "code"
              ? "Enter the six-digit code."
              : "Use at least 10 characters.";
    }
    if (mode === "register" && values.password !== values.password_confirmation)
      validation.password_confirmation = "Passwords do not match.";
    setFields(validation);
    setError("");
    setMessage("");
    if (Object.keys(validation).length) {
      setError("Please check the highlighted fields.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "forgot") {
        const data = await api<{ message: string }>(
          "/forgot-password",
          json("POST", { email }),
        );
        setMessage(data.message);
      } else if (mode === "login" && method === "otp") {
        if (!codeSent) await sendCode();
        else
          finish(
            (
              await api<{ user: Account }>(
                "/otp/verify",
                json("POST", { code: values.code }),
              )
            ).user,
          );
      } else
        finish(
          (
            await api<{ user: Account }>(
              `/${mode}`,
              json("POST", { ...values, email }),
            )
          ).user,
        );
    } catch (error) {
      setError((error as Error).message);
      if (error instanceof ApiError)
        setFields(
          Object.fromEntries(
            Object.entries(error.fields).map(([key, value]) => [key, value[0]]),
          ),
        );
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setBusy(true);
    setError("");
    try {
      await sendCode();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="pm-container pm-section">
      <div className="pm-auth">
        <div className="pm-auth__tabs" aria-label="Account access">
          {(["login", "register"] as const).map((value) => (
            <button
              key={value}
              className="pm-auth__tab"
              aria-pressed={mode === value}
              disabled={busy}
              onClick={() => changeMode(value)}
            >
              {value === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <form
          className="pm-auth__form"
          onSubmit={submit}
          noValidate
          aria-busy={busy}
        >
          <h1 className="pm-h3">
            {mode === "forgot"
              ? "Forgot your password?"
              : mode === "register"
                ? "Create your account"
                : "Welcome back"}
          </h1>
          <p className="pm-small pm-ink-muted">
            {mode === "register"
              ? "Save your favourites, manage addresses and track orders."
              : mode === "forgot"
                ? "Enter your account email to request a password reset link."
                : "Sign in to manage your orders and saved items."}
          </p>
          {mode === "login" && method === "otp" && (
            <p className="pm-small">
              We’ll send a six-digit sign-in code to your account email.
            </p>
          )}
          <fieldset
            disabled={busy}
            className="pm-auth__fields"
            key={`${mode}-${method}`}
          >
            {mode === "register" && (
              <Field
                label="Your name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                error={fields.name}
              />
            )}
            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete={mode === "register" ? "email" : "username"}
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={190}
              value={email}
              readOnly={method === "otp" && codeSent}
              onChange={(event) => {
                setEmail(event.target.value);
                setFields({ ...fields, email: "" });
              }}
              error={fields.email}
            />
            {mode !== "forgot" &&
              (mode === "register" || method === "password") && (
                <PasswordField
                  label="Password"
                  name="password"
                  required
                  minLength={mode === "register" ? 10 : undefined}
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  error={fields.password}
                  hint={
                    mode === "register"
                      ? "At least 10 characters. Spaces and password managers are welcome."
                      : undefined
                  }
                />
              )}
            {mode === "register" && (
              <PasswordField
                label="Confirm password"
                name="password_confirmation"
                required
                minLength={10}
                autoComplete="new-password"
                error={fields.password_confirmation}
              />
            )}
            {mode === "login" && method === "otp" && codeSent && (
              <Field
                label="Six-digit code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                error={fields.code}
                hint="Code expires after 5 minutes."
              />
            )}
          </fieldset>
          {mode === "login" && method === "password" && (
            <button
              className="pm-auth__link pm-auth__forgot"
              type="button"
              disabled={busy}
              onClick={() => changeMode("forgot")}
            >
              Forgot password?
            </button>
          )}
          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              className="pm-notice pm-notice--error"
              role="alert"
            >
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          <Notice>{message}</Notice>
          <button
            className="pm-btn pm-btn--primary pm-btn--block"
            disabled={busy}
          >
            {busy
              ? "Please wait…"
              : mode === "forgot"
                ? "Send reset link"
                : mode === "register"
                  ? "Create account"
                  : method === "otp"
                    ? codeSent
                      ? "Verify & sign in"
                      : "Send email code"
                    : "Sign in"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          {mode === "login" && (
            <details className="pm-auth__alternative">
              <summary>Other ways to sign in</summary>
              <button
                type="button"
                className="pm-auth__link"
                disabled={busy || (method === "password" && !otpEnabled)}
                onClick={() => {
                  setMethod(method === "password" ? "otp" : "password");
                  setError("");
                  setFields({});
                  setMessage("");
                }}
              >
                {method === "password" ? (
                  <Mail size={16} aria-hidden="true" />
                ) : (
                  <KeyRound size={16} aria-hidden="true" />
                )}
                {method === "password"
                  ? "Sign in with an email code"
                  : "Use my password instead"}
              </button>
              {!otpEnabled && (
                <p className="pm-caption pm-ink-muted">
                  Email code sign-in is currently unavailable. Please use your
                  password.
                </p>
              )}
            </details>
          )}
          {mode === "login" && method === "otp" && codeSent && (
            <div className="pm-auth__methods">
              <button
                type="button"
                className="pm-auth__link"
                disabled={busy || cooldown > 0}
                onClick={resend}
              >
                {cooldown ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
              <button
                type="button"
                className="pm-auth__link"
                disabled={busy}
                onClick={() => {
                  setCodeSent(false);
                  setMessage("");
                  setError("");
                  setFields({});
                }}
              >
                Change email
              </button>
            </div>
          )}
          {mode === "login" && (
            <p className="pm-small">
              Don’t have an account?{" "}
              <button
                type="button"
                className="pm-auth__link"
                disabled={busy}
                onClick={() => changeMode("register")}
              >
                Create your account
              </button>
            </p>
          )}
          {mode === "register" && (
            <p className="pm-small">
              Already have an account?{" "}
              <button
                type="button"
                className="pm-auth__link"
                disabled={busy}
                onClick={() => changeMode("login")}
              >
                Sign in
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button
              type="button"
              className="pm-auth__link"
              disabled={busy}
              onClick={() => changeMode("login")}
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
            </button>
          )}
        </form>
        <p className="pm-caption pm-ink-muted">
          By continuing you agree to our{" "}
          <Link href="/policies/terms">Terms</Link> and{" "}
          <Link href="/policies/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
