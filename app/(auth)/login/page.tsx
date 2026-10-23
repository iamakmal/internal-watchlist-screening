"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { loginSchema } from "@/app/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notConfirmedEmail, setNotConfirmedEmail] = useState<string | null>(
    null,
  );

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setError(null);
    setNotConfirmedEmail(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === "email") setEmailError(issue.message);
        if (issue.path[0] === "password") setPasswordError(issue.message);
      }
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 403) {
          setNotConfirmedEmail(result.data.email);
        }
        setError(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to sign in right now. Please try again.",
        );
        return;
      }
      router.push("/single-screen");
      router.refresh();
    } catch {
      setError("An error occurred while trying to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Welcome back
          </p>
          <div className="flex justify-center items-center gap-2 text-indigo-600 my-4">
            <ShieldAlert className="h-6 w-6" />
            <span className=" text-xl font-semibold tracking-wide">
              COMPLIANCE WORKSPACE
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
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

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {notConfirmedEmail && (
            <p className="text-sm text-center text-slate-600">
              Already signed up but haven&apos;t verified your email?
              <Link
                href={`/confirm-signup?email=${encodeURIComponent(notConfirmedEmail)}`}
                className="block text-sm font-medium text-blue-600 hover:underline"
              >
                Confirm your account
              </Link>
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
