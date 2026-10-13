"use client";

import AddFileModal from "@/components/AddFileModal";
import Sidebar from "@/components/Sidebar";
import SingleMatchCard from "@/components/SingleMatchCard";
import { SearchResult } from "@/types/commonTypes";
import {
  CheckCircle2,
  CircleAlert,
  Database,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState("");
  const [threshold, setThreshold] = useState(80);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function clearSearch() {
    setName("");
    setDate("");
    setThreshold(80);
    setResults(null);
    setStatus("");
    nameInputRef.current?.focus();
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          name,
          dob: date,
          minimum_score: threshold,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }
      setResults(data);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Search failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_right,#e0e7ff,transparent_34%),#f8fafc] lg:flex-row">
      <Sidebar />
      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
          <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldAlert className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-wide">
                  COMPLIANCE WORKSPACE
                </span>
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Watchlist screening
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                Review potential sanctions and watchlist matches with
                transparent scoring and supporting evidence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <Upload className="h-4 w-4" />
              Upload watchlist
            </button>
          </header>

          <section className="mt-8 rounded-2xl border border-indigo-100 bg-white/90 p-3 shadow-xl shadow-indigo-100/40 backdrop-blur sm:p-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Search a person or entity"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
                {name && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                aria-busy={loading}
                className="rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="mr-2 inline-block h-4 w-4 animate-spin align-[-0.15em]"
                  />
                )}
                {loading ? "Searching..." : "Search records"}
              </button>
            </form>
            <div className="mt-3 flex flex-col gap-2 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2">
                <span className="font-medium text-slate-600">
                  Date of birth
                </span>
                <input
                  type="text"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value.replace(/[^\d/\-]/g, "").slice(0, 10),
                    )
                  }
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  aria-label="Date of birth (DD/MM/YYYY)"
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="font-medium text-slate-600">
                  Minimum score
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="accent-indigo-600"
                />
                <span className="w-8 font-semibold text-indigo-600">
                  {threshold}%
                </span>
              </label>
              {(name || date || threshold !== 80 || results) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center gap-1.5 self-start font-semibold text-slate-500 transition hover:text-indigo-600 sm:self-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear search
                </button>
              )}
            </div>
          </section>

          {status && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <CircleAlert className="h-4 w-4" />
              {status}
            </p>
          )}

          {results && (
            <section className="mt-10">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                    Screening report
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    Results for “{results.query.name}”
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Normalized as{" "}
                    <span className="font-medium text-slate-700">
                      {results.query.normalized_name}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-slate-900">
                      {results.matches_found}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Potential matches
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-indigo-600">
                      {results.query.minimum_score}%
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Threshold used
                    </p>
                  </div>
                </div>
              </div>

              {results.matches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-14 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                  <h3 className="mt-3 text-lg font-semibold text-emerald-950">
                    No potential matches found
                  </h3>
                  <p className="mt-1 text-sm text-emerald-800/70">
                    This search did not meet the configured minimum score.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {results.matches.map((match) => (
                    <SingleMatchCard key={match.unique_id} match={match} />
                  ))}
                </div>
              )}
            </section>
          )}

          {!results && !loading && (
            <div className="mt-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Database className="h-7 w-7" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">
                Search your watchlist to begin an investigation
              </p>
            </div>
          )}
        </div>
      </div>

      <AddFileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
