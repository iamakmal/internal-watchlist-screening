"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { forgotPasswordSchema } from "@/app/lib/validation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setError(null);
    setMessage(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setEmailError(result.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to request a password reset. Please try again.",
        );
        return;
      }

      router.push(`/reset-password?email=${encodeURIComponent(result.data.email)}`);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Account recovery
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-wide text-indigo-600">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email and we&apos;ll send you a password reset code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="you@team.com"
            />
            {emailError && <p className="text-sm text-red-600">{emailError}</p>}
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {message && <p role="status" className="text-sm text-green-600">{message}</p>}

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
            {loading ? "Sending code..." : "Send reset code"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
