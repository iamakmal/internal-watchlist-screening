"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { resetPasswordSchema } from "@/app/lib/validation";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [codeDigits, setCodeDigits] = useState<string[]>(() =>
    Array.from({ length: 6 }, () => ""),
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const code = codeDigits.join("");

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

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
      digits.slice(0, 6 - index).split("").forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      return next;
    });
    inputRefs.current[Math.min(index + digits.length, 5)]?.focus();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (digits) updateCode(0, digits);
  }

  async function requestResetCode() {
    setError(null);
    setResendLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(typeof payload?.error === "string" ? payload.error : "Unable to resend the code.");
        return;
      }
      setCodeDigits(Array.from({ length: 6 }, () => ""));
      setCooldown(30);
      setError("A new reset code has been sent.");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setCodeError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setError(null);
    const result = resetPasswordSchema.safeParse({
      email,
      code,
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === "code") setCodeError(issue.message);
        if (issue.path[0] === "newPassword") setPasswordError(issue.message);
        if (issue.path[0] === "confirmPassword") setConfirmPasswordError(issue.message);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(typeof payload?.error === "string" ? payload.error : "Unable to reset your password.");
        return;
      }
      router.push("/login?reset=true");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Account recovery</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-wide text-indigo-600">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter the code sent to</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{email || "your email address"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-1 block text-sm font-medium text-slate-700">Reset code</p>
            <div className="flex justify-between gap-2">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  id={`reset-code-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  required
                  value={digit}
                  aria-label={`Reset code digit ${index + 1}`}
                  onChange={(e) => updateCode(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  onPaste={handlePaste}
                  className="h-12 w-11 rounded-xl border border-slate-300 text-center text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ))}
            </div>
            {codeError && <p className="text-sm text-red-600">{codeError}</p>}
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input id="newPassword" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="••••••••" />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="••••••••" />
            {confirmPasswordError && <p className="text-sm text-red-600">{confirmPasswordError}</p>}
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <LoaderCircle aria-hidden="true" className="mr-2 inline-block h-4 w-4 animate-spin align-[-0.15em]" />}
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button type="button" onClick={requestResetCode} disabled={loading || resendLoading || cooldown > 0} className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400">
            {resendLoading ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>
        <div className="mt-4 text-center text-sm text-slate-600">
          <Link href="/login" className="font-medium text-blue-600 hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
