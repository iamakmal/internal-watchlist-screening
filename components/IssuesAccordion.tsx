import React, { useState } from "react";
import {
  AlertTriangle,
  XCircle,
  ChevronDown,
  Terminal,
  Hash,
} from "lucide-react";
import { ValidationIssue } from "@/types/commonTypes";

interface props {
  issues: ValidationIssue[];
}

export default function IssuesAccordion({ issues }: props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      {issues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No validation issues found.
        </div>
      ) : (
        issues.map((issue, index) => {
          const isError = issue.severity === "ERROR";
          const isOpen = openIndex === index;
          const detailsId = `issue-details-${index}`;

          return (
            <section
              key={`${issue.unique_id}-${index}`}
              className={`overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md ${
                isError
                  ? "border-red-200 bg-red-50 text-red-950"
                  : "border-yellow-300 bg-yellow-50 text-yellow-950"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className={`flex w-full items-center gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:gap-4 ${
                  isError
                    ? "focus-visible:ring-red-500"
                    : "focus-visible:ring-yellow-500"
                }`}
                aria-expanded={isOpen}
                aria-controls={detailsId}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isError
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {isError ? (
                    <XCircle className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isError ? "text-red-700" : "text-yellow-800"
                      }`}
                    >
                      {isError ? "Error" : "Warning"}
                    </span>
                    <span
                      className={`text-xs ${
                        isError ? "text-red-700/75" : "text-yellow-800/75"
                      }`}
                    >
                      Row {issue.row}
                    </span>
                  </span>
                  <span className="block text-sm font-medium leading-5 sm:text-[15px]">
                    {issue.message}
                  </span>
                </span>

                <ChevronDown
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  } ${isError ? "text-red-500" : "text-yellow-700"}`}
                  aria-hidden="true"
                />
              </button>

              <div
                id={detailsId}
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`grid grid-cols-1 gap-3 border-t p-4 sm:grid-cols-2 sm:px-[4.5rem] ${
                      isError
                        ? "border-red-200/80 bg-red-100/40"
                        : "border-yellow-300/80 bg-yellow-100/40"
                    }`}
                  >
                    <div className="min-w-0 rounded-lg border border-white/80 bg-white/70 p-3">
                      <div
                        className={`mb-1.5 flex items-center gap-2 text-xs font-semibold ${
                          isError ? "text-red-700/80" : "text-yellow-800/80"
                        }`}
                      >
                        <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                        Error Code
                      </div>
                      <code className="block break-all font-mono text-sm font-semibold text-slate-800">
                        {issue.code}
                      </code>
                    </div>

                    <div className="min-w-0 rounded-lg border border-white/80 bg-white/70 p-3">
                      <div
                        className={`mb-1.5 flex items-center gap-2 text-xs font-semibold ${
                          isError ? "text-red-700/80" : "text-yellow-800/80"
                        }`}
                      >
                        <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                        Unique ID
                      </div>
                      <code className="block break-all font-mono text-sm font-semibold text-slate-800 select-all">
                        {issue.unique_id}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
