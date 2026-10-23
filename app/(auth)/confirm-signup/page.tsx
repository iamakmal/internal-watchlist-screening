"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  confirmSignupSchema,
  resendConfirmationSchema,
} from "@/app/lib/validation";

export default function ConfirmSignupPage() {
  return (
    <Suspense>
      <ConfirmSignupForm />
    </Suspense>
  );
}

function ConfirmSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [codeDigits, setCodeDigits] = useState<string[]>(() =>
    Array.from({ length: 6 }, () => ""),
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const code = codeDigits.join("");

  useEffect(() => {
    if (resendCooldown === 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  function updateCode(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setCodeDigits((current) =>
        current.map((digit, digitIndex) => (digitIndex === index ? "" : digit)),
      );
      return;
    }

    setCodeDigits((current) => {
      const next = [...current];
      digits
        .slice(0, 6 - index)
        .split("")
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      return next;
    });
    inputRefs.current[Math.min(index + digits.length, 5)]?.focus();
  }

  function handleCodeKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (digits) updateCode(0, digits);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCodeError(null);
    setError(null);
    setResendMessage(null);

    const result = confirmSignupSchema.safeParse({ email, code });
    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === "code") setCodeError(issue.message);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/confirm-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to confirm your account. Please try again.",
        );
        return;
      }

      router.push("/login?confirmed=true");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResendMessage(null);

    const result = resendConfirmationSchema.safeParse({ email });
    if (!result.success) {
      setError("A valid email address is required to resend the code.");
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to resend the confirmation code. Please try again.",
        );
        return;
      }

      setCodeDigits(Array.from({ length: 6 }, () => ""));
      setResendMessage(payload?.message);
      setResendCooldown(30);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Confirm account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-wide text-indigo-600">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the 6-digit code we sent to finish creating your account.
          </p>
          <p className="mt-2 text-sm font-bold text-slate-700">
            {email || "No email address provided"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between gap-2">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  required
                  maxLength={1}
                  value={digit}
                  aria-label={`Confirmation code digit ${index + 1}`}
                  onChange={(e) => updateCode(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={handleCodePaste}
                  className="h-12 w-11 rounded-xl border border-slate-300 text-center text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ))}
            </div>
            {codeError && <p className="text-sm text-red-600">{codeError}</p>}
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-center text-red-600 whitespace-pre"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <LoaderCircle
                aria-hidden="true"
                className="mr-2 inline-block h-4 w-4 animate-spin align-[-0.15em]"
              />
            )}
            {loading ? "Confirming..." : "Confirm account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          {resendMessage && (
            <p role="status" className="mb-2 text-green-600">
              {resendMessage}
            </p>
          )}

          {resendLoading ? (
            <span>Sending...</span>
          ) : resendCooldown > 0 ? (
            <span className="text-slate-500">
              Resend code in {resendCooldown}s
            </span>
          ) : (
            <div>
              <span>Didn&apos;t receive the code? </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || resendLoading}
                className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Resend code
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already confirmed?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
