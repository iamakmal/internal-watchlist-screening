import { CalendarDays, ChevronRight, Fingerprint, Tag } from "lucide-react";
import { displayList, dobStatusStyle } from "@/app/lib/commonUtils";
import { Match } from "@/types/commonTypes";

interface props {
  match: Match;
}

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

export default function MatchCard({ match }: props) {
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
            <CalendarDays className="h-5 w-5 text-indigo-500 shrink-0" />
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
