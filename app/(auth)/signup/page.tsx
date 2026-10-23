"use client";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { signupSchema } from "@/app/lib/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [existingAccountEmail, setExistingAccountEmail] = useState<
    string | null
  >(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setFormError(null);
    setExistingAccountEmail(null);
    setSuccessMessage(null);

    const result = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "name") setNameError(issue.message);
        if (field === "email") setEmailError(issue.message);
        if (field === "password") setPasswordError(issue.message);
        if (field === "confirmPassword") {
          setConfirmPasswordError(issue.message);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          setExistingAccountEmail(result.data.email);
        }
        setFormError(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to create your account. Please try again.",
        );
        return;
      }

      router.push(
        `/confirm-signup?email=${encodeURIComponent(result.data.email)}`,
      );
    } catch {
      setFormError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Create account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-wide text-indigo-600 ">
            Join Compliance Workspace
          </h1>
          <p className="mt-2 text-sm  text-slate-500">Set up your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Your name"
            />
            {nameError && <p className="text-sm text-red-600">{nameError}</p>}
          </div>
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
              placeholder="you@example.com"
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
            />
            {confirmPasswordError && (
              <p className="text-sm text-red-600">{confirmPasswordError}</p>
            )}
          </div>
          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}
          {existingAccountEmail && (
            <p className="text-sm text-center text-slate-600">
              Already signed up but haven&apos;t verified your email?
              <Link
                href={`/confirm-signup?email=${encodeURIComponent(existingAccountEmail)}`}
                className="block text-sm font-medium text-blue-600 hover:underline"
              >
                Confirm your account
              </Link>
            </p>
          )}
          {successMessage && (
            <p role="status" className="text-sm text-green-600">
              {successMessage}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
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
