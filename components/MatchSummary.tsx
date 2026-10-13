import { ChevronRight, Fingerprint, Tag } from "lucide-react";
import { Match } from "@/types/commonTypes";
import { dobStatusStyle, formatDate } from "@/app/lib/commonUtils";

interface props {
  match: Match;
}

export default function BatchSummary({ match }: props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
              <Fingerprint className="h-3.5 w-3.5" />
              {match.unique_id}
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600">
              {match.designation_type}
            </span>
          </div>
          <h4 className="mt-2 font-semibold text-slate-900">
            {match.matched_name}
          </h4>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700">
          {match.final_score.toFixed(1)}%
        </span>
      </div>

      <div className="m-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Date of birth
          </p>
          <p className="mt-1 font-medium text-slate-700">
            {match.date_of_birth.length > 0
              ? match.date_of_birth.map(formatDate).join(", ")
              : "Not available"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            DOB status
          </p>
          <span
            className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${dobStatusStyle(match.dob_status).className}`}
          >
            {dobStatusStyle(match.dob_status).label || "Not available"}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Name score
          </p>
          <p className="mt-1 font-medium text-slate-700">
            {match.name_score.toFixed(1)}%
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
      {match.reasons.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3">
          {match.reasons.map((reason) => (
            <li key={reason} className="flex gap-2 text-sm text-slate-600">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
