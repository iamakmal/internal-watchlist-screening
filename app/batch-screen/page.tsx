"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileUp,
  Fingerprint,
  ShieldAlert,
  Upload,
  XCircle,
} from "lucide-react";
import ReportCard from "@/components/ReportCard";
import Sidebar from "@/components/Sidebar";
import { BatchScreenResponse, Match } from "@/types/commonTypes";

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

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
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

export default function BatchScreen() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<BatchScreenResponse | null>(null);
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

  async function handleUpload() {
    if (!selectedFile) {
      setStatus("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setReport(null);
    setStatus(`Uploading and screening ${selectedFile.name}...`);

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

      setReport(data as BatchScreenResponse);
      setStatus(`${selectedFile.name} screened successfully.`);
    } catch (error) {
      console.error("Batch screening failed:", error);
      setStatus("Batch screening failed. Check the file and try again.");
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
              Batch screening
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Upload a CSV to screen multiple watchlist subjects and review
              every result in one report.
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
                onClick={handleUpload}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {loading ? "Screening..." : "Upload and screen"}
              </button>
            </div>
          </section>

          {report && (
            <section className="mt-10 space-y-10">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-950">
                  Screening report
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <ReportCard
                    title="Total rows"
                    data={format(report.summary.total_rows)}
                  />
                  <ReportCard
                    title="Screened"
                    data={format(report.summary.screened_rows)}
                    tone="success"
                  />
                  <ReportCard
                    title="Failed"
                    data={format(report.summary.failed_rows)}
                    tone={report.summary.failed_rows > 0 ? "danger" : "success"}
                  />
                  <ReportCard
                    title="With matches"
                    data={format(report.summary.rows_with_matches)}
                    tone="warning"
                  />
                  <ReportCard
                    title="Without matches"
                    data={format(report.summary.rows_without_matches)}
                  />
                  <ReportCard
                    title="Minimum score"
                    data={`${report.summary.minimum_score}%`}
                  />
                </div>
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

              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-950">
                  Match responses
                </h2>
                {report.results.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <AlertCircle className="h-5 w-5 text-slate-400" />
                    No screened responses were returned.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {report.results.map((result) => (
                      <section
                        key={`${result.row}-${result.reference_id}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                              Row {result.row} · {result.reference_id}
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-slate-950">
                              {result.input.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              Normalized as {result.input.normalized_name}
                              {result.input.date_of_birth &&
                                ` · DOB ${formatDate(result.input.date_of_birth)}`}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                            {result.matches_found}{" "}
                            {result.matches_found === 1 ? "match" : "matches"}
                          </span>
                        </div>

                        {result.matches.length === 0 ? (
                          <p className="mt-4 text-sm text-slate-500">
                            No potential matches found for this row.
                          </p>
                        ) : (
                          <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            {result.matches.map((match) => (
                              <MatchSummary
                                key={`${result.row}-${match.unique_id}`}
                                match={match}
                              />
                            ))}
                          </div>
                        )}
                      </section>
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
