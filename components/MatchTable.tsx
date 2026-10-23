"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { displayList, dobStatusStyle, formatDate } from "@/app/lib/commonUtils";
import { Match } from "@/types/commonTypes";

interface Props {
  matches: Match[];
  pageSize?: number;
}

function scoreClass(score: number) {
  if (score >= 90) return "bg-rose-50 text-rose-700 ring-rose-600/20";
  if (score >= 70) return "bg-amber-50 text-amber-700 ring-amber-600/20";
  return "bg-slate-100 text-slate-700 ring-slate-500/20";
}

export default function MatchTable({ matches, pageSize = 10 }: Props) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleMatches = matches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">Matched name</th>
              <th className="px-4 py-3">Watchlist ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Date of birth</th>
              <th className="px-4 py-3">DOB status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleMatches.map((match) => {
              const score = Math.max(0, Math.min(100, match.final_score));
              const dobStatus = dobStatusStyle(match.dob_status);
              return (
                <tr key={match.unique_id} className="align-top">
                  <td colSpan={7} className="p-0">
                    <details className="group">
                      <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_1.4fr_1fr_0.9fr_0.75fr_1.15fr_1fr] items-center px-4 py-4 text-slate-700 transition hover:bg-indigo-50/50 [&::-webkit-details-marker]:hidden">
                        <span className="text-slate-400">
                          <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
                        </span>
                        <span className="font-semibold text-slate-900">
                          {match.matched_name}
                          <span className="mt-1 block text-xs font-normal text-slate-500">
                            {displayList(match.name_type)}
                          </span>
                        </span>
                        <span className="font-mono text-xs">{match.unique_id}</span>
                        <span>{match.designation_type}</span>
                        <span
                          className={`inline-flex w-fit rounded-full px-2.5 py-1 font-semibold ring-1 ring-inset ${scoreClass(score)}`}
                        >
                          {score.toFixed(1)}%
                        </span>
                        <span>
                          {match.date_of_birth.length > 0
                            ? match.date_of_birth.map(formatDate).join(", ")
                            : "Not available"}
                        </span>
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${dobStatus.className}`}
                        >
                          {dobStatus.label}
                        </span>
                      </summary>
                      <div className="grid gap-4 border-t border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-3 sm:p-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Name score
                          </p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {match.name_score.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Alias strength
                          </p>
                          <p className="mt-1 text-slate-700">
                            {displayList(match.alias_strength)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Regimes
                          </p>
                          <p className="mt-1 text-slate-700">
                            {displayList(match.regime_names)}
                          </p>
                        </div>
                        <div className="sm:col-span-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Match rationale
                          </p>
                          <p className="mt-1 text-slate-700">
                            {displayList(match.reasons)}
                          </p>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {matches.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, matches.length)} of {matches.length}{" "}
          matches
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => value - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="min-w-20 text-center text-xs font-semibold">
            Page {currentPage} of {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => value + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
