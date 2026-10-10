"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileUp,
  Fingerprint,
  ShieldAlert,
  Tag,
  Upload,
  XCircle,
} from "lucide-react";
import ReportCard from "@/components/ReportCard";
import Sidebar from "@/components/Sidebar";
import {
  EvaluationDetails,
  EvaluationResponse,
  Match,
} from "@/types/commonTypes";

function format(value: number) {
  return value.toLocaleString();
}

function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function statusStyle(status: string) {
  switch (status) {
    case "MATCH":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "PARTIAL_MATCH":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "NEAR_MATCH":
      return "bg-orange-50 text-orange-700 ring-orange-600/20";
    case "NO_MATCH":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-500/20";
  }
}

function evaluationStatusStyle(status: EvaluationDetails["status"]) {
  switch (status) {
    case "TRUE_POSITIVE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "TRUE_POSITIVE_WITH_FALSE_ALARMS":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "FALSE_NEGATIVE":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    case "FALSE_POSITIVE":
      return "bg-orange-50 text-orange-700 ring-orange-600/20";
    case "TRUE_NEGATIVE":
      return "bg-slate-100 text-slate-700 ring-slate-500/20";
  }
}

function evaluationStatusLabel(status: EvaluationDetails["status"]) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function MatchSummary({ match }: { match: Match }) {
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
            className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle(match.dob_status)}`}
          >
            {match.dob_status || "Not available"}
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

function ResultMatches({
  detail,
  report,
}: {
  detail: EvaluationDetails;
  report: EvaluationResponse;
}) {
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
        <div className="grid gap-4 lg:grid-cols-2">
          {result.matches.map((match) => (
            <MatchSummary
              key={`${detail.row_number}-${match.unique_id}`}
              match={match}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvaluatePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<EvaluationResponse | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [threshold, setThreshold] = useState(80);

  function selectFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setStatus("Please select a .csv file.");
      return;
    }
    setSelectedFile(file);
    setReport(null);
    setStatus("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) selectFile(file);
  }

  async function handleEvaluate() {
    if (!selectedFile) {
      setStatus("Please select a CSV file first.");
      return;
    }
    setLoading(true);
    setReport(null);
    setStatus(`Uploading and evaluating ${selectedFile.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("minimum_score", String(threshold));
      const response = await fetch("/api/batch-screen", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed (${response.status})`);
      }
      if (!data || data.is_evaluation !== true || !data.evaluation) {
        throw new Error("The API did not return an evaluation report.");
      }
      setReport(data as EvaluationResponse);
      setStatus(`${selectedFile.name} evaluated successfully.`);
    } catch (error) {
      console.error("Evaluation failed:", error);
      setStatus("Evaluation failed. Check the file and try again.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_right,#e0e7ff,transparent_34%),#f8fafc] lg:flex-row">
      <Sidebar />
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          <header>
            <div className="flex items-center gap-2 text-indigo-600">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide">
                COMPLIANCE WORKSPACE
              </span>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              Evaluate screening
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Upload labelled screening data to measure how accurately the
              watchlist search finds expected matches.
            </p>
          </header>

          <section className="mt-8 rounded-2xl border border-indigo-100 bg-white/90 p-4 shadow-xl shadow-indigo-100/40 backdrop-blur sm:p-6">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                dragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/50"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <FileUp className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                {selectedFile
                  ? selectedFile.name
                  : "Click to upload or drag and drop"}
              </p>
              <p className="mt-1 text-xs text-slate-500">CSV files only</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-medium text-slate-600">
                  Minimum score
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(event) => setThreshold(Number(event.target.value))}
                  disabled={loading}
                  aria-label="Minimum score"
                  className="accent-indigo-600"
                />
                <span className="w-8 font-semibold text-indigo-600">
                  {threshold}%
                </span>
              </label>
              <button
                type="button"
                disabled={loading || !selectedFile}
                onClick={handleEvaluate}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {loading ? "Evaluating..." : "Evaluate results"}
              </button>
            </div>
          </section>

          {report && (
            <section className="mt-10 space-y-10">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-950">
                  Evaluation summary
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <ReportCard
                    title="Correctly found"
                    data={format(report.evaluation.metrics.true_positives)}
                    tone="success"
                  />
                  <ReportCard
                    title="Missed"
                    data={format(report.evaluation.metrics.false_negatives)}
                    tone={
                      report.evaluation.metrics.false_negatives > 0
                        ? "danger"
                        : "success"
                    }
                  />
                  <ReportCard
                    title="False alarms"
                    data={format(report.evaluation.metrics.false_positives)}
                    tone={
                      report.evaluation.metrics.false_positives > 0
                        ? "warning"
                        : "success"
                    }
                  />
                  <ReportCard
                    title="Correctly clear"
                    data={format(report.evaluation.metrics.true_negatives)}
                    tone="success"
                  />
                  <ReportCard
                    title="Precision"
                    data={`${(report.evaluation.metrics.precision * 100).toFixed(1)}%`}
                  />
                  <ReportCard
                    title="Recall"
                    data={`${(report.evaluation.metrics.recall * 100).toFixed(1)}%`}
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-950">
                  Evaluation details
                </h2>
                {report.evaluation.details.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <AlertCircle className="h-5 w-5 text-slate-400" />
                    No evaluation details were returned.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="w-10 px-4 py-3" />
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Expected</th>
                            <th className="px-4 py-3">Found?</th>
                            <th className="px-4 py-3">False alarms</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {report.evaluation.details.map((detail) => (
                            <tr
                              key={`${detail.row_number}-${detail.reference_id}`}
                            >
                              <td colSpan={6} className="p-0">
                                <details className="group">
                                  <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_1.25fr_1.5fr_0.75fr_1fr_1.5fr] items-center px-4 py-4 text-slate-700 transition hover:bg-indigo-50/50 [&::-webkit-details-marker]:hidden">
                                    <span className="text-slate-400">
                                      <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                      {detail.reference_id}
                                    </span>
                                    <span>
                                      {detail.expected_match_id ||
                                        "No match expected"}
                                    </span>
                                    <span>
                                      {detail.expected_match_found ? (
                                        <CheckCircle2
                                          className="h-5 w-5 text-emerald-600"
                                          aria-label="Found"
                                        />
                                      ) : (
                                        <XCircle
                                          className="h-5 w-5 text-rose-500"
                                          aria-label="Not found"
                                        />
                                      )}
                                    </span>
                                    <span>
                                      {detail.false_alarm_ids.length > 0
                                        ? detail.false_alarm_ids.join(", ")
                                        : "None"}
                                    </span>
                                    <span
                                      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${evaluationStatusStyle(detail.status)}`}
                                    >
                                      {evaluationStatusLabel(detail.status)}
                                    </span>
                                  </summary>
                                  <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5">
                                    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Full screening matches · Row{" "}
                                      {detail.row_number}
                                    </p>
                                    <ResultMatches
                                      detail={detail}
                                      report={report}
                                    />
                                  </div>
                                </details>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-950">
                  Errors
                </h2>
                {report.errors.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" />
                    No errors were reported.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.errors.map((error) => (
                      <article
                        key={`${error.row}-${error.reference_id}`}
                        className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950"
                      >
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                        <div className="min-w-0 text-sm">
                          <p className="font-semibold">
                            Row {error.row} · {error.reference_id}
                          </p>
                          <p className="mt-1">{error.message}</p>
                          <code className="mt-2 block text-xs text-rose-700">
                            {error.code}
                          </code>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
