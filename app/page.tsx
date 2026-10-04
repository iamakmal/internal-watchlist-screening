"use client";

import AddFileModal from "@/components/AddFileModal";
import { AWS_API_GATEWAY_URL } from "@/types/commonTypes";
import { Search, Upload, ShieldAlert } from "lucide-react";
import { useState } from "react";

type Match = { name: string; score: number; reason: string };

function scoreStyle(score: number) {
  if (score >= 90)
    return {
      badge: "bg-red-50 text-red-700 ring-red-600/20",
      bar: "bg-red-500",
    };
  if (score >= 70)
    return {
      badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
      bar: "bg-amber-500",
    };
  return {
    badge: "bg-gray-100 text-gray-700 ring-gray-500/20",
    bar: "bg-gray-400",
  };
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch(
        `${AWS_API_GATEWAY_URL}/search?q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error();
      setResults(await res.json());
    } catch {
      setStatus("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600">
              <ShieldAlert size={22} />
              <span className="text-sm font-medium">Compliance</span>
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              Watchlist Screening
            </h1>
            <p className="mt-2 max-w-lg text-gray-600">
              Screen names against sanctions lists. Built for compliance teams,
              investigators, and journalists.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Upload size={16} />
            Upload CSV
          </button>
        </header>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-8 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a name or entity"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {status && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {status}
          </p>
        )}

        {/* Results */}
        {results && (
          <section className="mt-8">
            <p className="mb-3 text-sm text-gray-500">
              {results.length} {results.length === 1 ? "match" : "matches"}{" "}
              found
            </p>

            {results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-500">
                No matches found.
              </div>
            ) : (
              <ul className="space-y-3">
                {results.map((m, i) => {
                  const s = scoreStyle(m.score);
                  return (
                    <li
                      key={i}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{m.name}</p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {m.reason}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.badge}`}
                        >
                          {m.score}%
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${s.bar}`}
                          style={{ width: `${m.score}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>

      <AddFileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
