"use client";

import AddFileModal from "@/components/AddFileModal";
import { SearchResult, Match } from "@/types/commonTypes";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  Fingerprint,
  RotateCcw,
  Search,
  ShieldAlert,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

function scoreStyle(score: number) {
  if (score >= 90) {
    return {
      badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
      bar: "bg-rose-500",
      label: "High confidence",
    };
  }
  if (score >= 70) {
    return {
      badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
      bar: "bg-amber-500",
      label: "Review recommended",
    };
  }
  return {
    badge: "bg-slate-100 text-slate-700 ring-slate-500/20",
    bar: "bg-slate-400",
    label: "Low confidence",
  };
}

function dobStatusStyle(status: string) {
  switch (status) {
    case "MATCH":
      return {
        label: "Exact match",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      };
    case "PARTIAL_MATCH":
      return {
        label: "Partial match",
        className: "bg-amber-50 text-amber-700 ring-amber-600/20",
      };
    case "NEAR_MATCH":
      return {
        label: "Near match",
        className: "bg-orange-50 text-orange-700 ring-orange-600/20",
      };
    case "NO_MATCH":
      return {
        label: "No match",
        className: "bg-rose-50 text-rose-700 ring-rose-600/20",
      };
    case "NOT_PROVIDED":
      return {
        label: "Not provided",
        className: "bg-slate-100 text-slate-700 ring-slate-500/20",
      };
    case "INVALID_INPUT":
      return {
        label: "Invalid input",
        className: "bg-rose-50 text-rose-700 ring-rose-600/20",
      };
    case "NOT_AVAILABLE":
      return {
        label: "Not available",
        className: "bg-slate-100 text-slate-700 ring-slate-500/20",
      };
    default:
      return {
        label: status || "Not available",
        className: "bg-slate-100 text-slate-700 ring-slate-500/20",
      };
  }
}

function displayList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Not available";
}

function MatchCard({ match }: { match: Match }) {
  const score = Math.max(0, Math.min(100, match.final_score));
  const style = scoreStyle(score);
  const dobStatus = dobStatusStyle(match.dob_status);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                <Fingerprint className="h-3.5 w-3.5" />
                {match.unique_id}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                {match.designation_type}
              </span>
            </div>
            <h3 className="truncate text-xl font-semibold tracking-tight text-slate-950">
              {match.matched_name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Name type: {displayList(match.name_type)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-inset ${style.badge}`}
            >
              {score.toFixed(1)}%
            </span>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {style.label}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Overall match score</span>
            <span>{score.toFixed(1)} / 100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${style.bar}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Date of birth
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            {displayList(match.date_of_birth)}
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${dobStatus.className}`}
            >
              {dobStatus.label}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Name similarity
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {match.name_score.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Alias strength: {displayList(match.alias_strength.map(String))}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Regimes
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.regime_names.length > 0 ? (
                match.regime_names.map((regime) => (
                  <span
                    key={regime}
                    className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                  >
                    {regime}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">Not available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Match rationale
        </p>
        <ul className="space-y-2">
          {match.reasons.length > 0 ? (
            match.reasons.map((reason) => (
              <li
                key={reason}
                className="flex gap-2 text-sm leading-5 text-slate-600"
              >
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                {reason}
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-500">No rationale provided.</li>
          )}
        </ul>
      </div>
    </article>
  );
}

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
      if (!res.ok) throw new Error();
      setResults(await res.json());
    } catch {
      setStatus("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0e7ff,transparent_34%),#f8fafc]">
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
              Review potential sanctions and watchlist matches with transparent
              scoring and supporting evidence.
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
              className="rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search records"}
            </button>
          </form>
          <div className="mt-3 flex flex-col gap-2 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">
              <span className="font-medium text-slate-600">Date of birth</span>
              <input
                type="text"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value.replace(/[^\d/\-]/g, "").slice(0, 10))
                }
                placeholder="DD/MM/YYYY"
                maxLength={10}
                aria-label="Date of birth (DD/MM/YYYY)"
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="font-medium text-slate-600">Minimum score</span>
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
                  <MatchCard key={match.unique_id} match={match} />
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

      <AddFileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
