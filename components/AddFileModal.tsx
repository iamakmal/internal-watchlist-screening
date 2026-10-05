import { useRef, useState } from "react";
import Modal from "./Modal";
import { FileUp } from "lucide-react";
import { AWS_API_GATEWAY_URL, ValidationIssue } from "@/types/commonTypes";
import ReportCard from "./ReportCard";
import IssuesAccordion from "./IssuesAccordion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SummaryReport {
  metadata: { report_date: string };
  summary: {
    total_rows: number;
    parsed_rows: number;
    loaded_rows: number;
    skipped_rows: number;
    failed_rows: number;
    unique_entities: number;
    subjects_with_multiple_rows: number;
  };
  issues: [ValidationIssue];
}

const format = (n: number) => n.toLocaleString();

export default function AddFileModal({ isOpen, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  function selectFile(file: File) {
    setSelectedFile(file);
    setStatus("");
    setReport(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.toLowerCase().endsWith(".csv")) {
      selectFile(file);
    } else {
      setStatus("Please drop a .csv file.");
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setStatus("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setReport(null);
    setStatus(`Uploading ${selectedFile.name}...`);

    try {
      // 1. Get presigned URL
      const urlRes = await fetch(AWS_API_GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-upload-url" }),
      });
      if (!urlRes.ok)
        throw new Error(`Could not get Upload URL (${urlRes.status})`);
      const { upload_url } = await urlRes.json();

      // 2. Upload to S3
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": "text/csv" },
        body: selectedFile,
      });
      if (!putRes.ok) throw new Error(`S3 upload failed (${putRes.status})`);

      // 3. Validate
      setStatus("Validating...");
      const validateRes = await fetch(AWS_API_GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate" }),
      });
      if (!validateRes.ok)
        throw new Error(`Validation failed (${validateRes.status})`);

      const reportData: SummaryReport = await validateRes.json();
      setReport(reportData);
      setStatus(`${selectedFile.name} uploaded successfully.`);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed. Check the file and try again.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleClose() {
    if (loading) return;
    setSelectedFile(null);
    setReport(null);
    setStatus("");
    setDragging(false);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  }

  const summary = report?.summary;
  const issues = report?.issues;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload watchlist">
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
          <FileUp size={32} className="text-indigo-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-900">
          {selectedFile
            ? selectedFile.name
            : "Click to upload or drag and drop"}
        </p>
        <p className="mt-1 text-xs text-gray-500">CSV files only</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={handleClose}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Close
        </button>
        <button
          type="button"
          disabled={loading || !selectedFile}
          onClick={handleUpload}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {report && summary && (
        <div className="mt-6 border-t border-gray-500 pt-6">
          <h3 className="mb-3 font-semibold text-gray-900">Summary Report</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ReportCard
              title="Report Date"
              data={report.metadata.report_date?.replaceAll("-", " ")}
            />
            <ReportCard title="Total Rows" data={format(summary.total_rows)} />
            <ReportCard
              title="Parsed Rows"
              data={format(summary.parsed_rows)}
              tone="success"
            />
            <ReportCard
              title="Loaded Rows"
              data={format(summary.loaded_rows)}
              tone="success"
            />
            <ReportCard
              title="Failed Rows"
              data={format(summary.failed_rows)}
              tone={summary.failed_rows > 0 ? "danger" : "success"}
            />
            <ReportCard
              title="Skipped Rows"
              data={format(summary.skipped_rows)}
              tone={summary.skipped_rows > 0 ? "warning" : "success"}
            />
            <ReportCard
              title="Unique Entities"
              data={format(summary.unique_entities)}
            />
            <ReportCard
              title="Subjects With Multiple Rows"
              data={format(summary.subjects_with_multiple_rows)}
            />
          </div>
        </div>
      )}
      {report && issues && issues.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-gray-900">
            Issues Identified
          </h3>
          <IssuesAccordion issues={issues} />
        </div>
      )}
    </Modal>
  );
}
