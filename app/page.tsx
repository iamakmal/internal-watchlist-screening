"use client";

import AddFileModal from "@/components/AddFileModal";
import { AWS_API_GATEWAY_URL } from "@/types/commonTypes";
import { useRef, useState } from "react";

type Match = { name: string; score: number; reason: string };

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
    <main className="p-6">
      <h1 className="mb-2 text-4xl font-semibold">Watchlist Screening</h1>
      <p className="text-gray-600 text-2xl mb-6">
        Screening tool for compliance teams, investigators, and journalists.
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="border border-gray-300 px-4 py-2 mb-4"
        >
          Upload CSV
        </button>
      </div>
      <form
        onSubmit={handleSearch}
        className="flex justify-between  max-w-1/2 gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a name or entity"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}

      {results && (
        <ul className="mt-6 divide-y border-y">
          {results.length === 0 && <li className="py-3">No matches found.</li>}
          {results.map((m, i) => (
            <li key={i} className="flex justify-between py-3">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-gray-600">{m.reason}</p>
              </div>
              <span className="text-sm">{m.score}%</span>
            </li>
          ))}
        </ul>
      )}
      <AddFileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
