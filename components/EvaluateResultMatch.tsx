import { EvaluationDetails, EvaluationResponse } from "@/types/commonTypes";
import MatchTable from "./MatchTable";

interface props {
  detail: EvaluationDetails;
  report: EvaluationResponse;
}
export default function EvaluateResultMatches({ detail, report }: props) {
  const result = report.results.find(
    (candidate) =>
      candidate.row === detail.row_number &&
      candidate.reference_id === detail.reference_id,
  );

  if (!result) {
    return (
      <p className="text-sm text-rose-700">
        The screening response for this evaluation row was not returned.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4 text-sm">
        <p className="font-semibold text-slate-900">{result.input.name}</p>
        <p className="mt-1 text-slate-500">
          Reference {result.reference_id} · {result.matches_found}{" "}
          {result.matches_found === 1 ? "match" : "matches"}
        </p>
      </div>
      {result.matches.length === 0 ? (
        <p className="text-sm text-slate-500">No screening matches found.</p>
      ) : (
        <MatchTable matches={result.matches} />
      )}
    </div>
  );
}
