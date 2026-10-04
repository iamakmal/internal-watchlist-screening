import { useRef, useState } from "react";
import Modal from "./Modal";
import { FileUp } from "lucide-react";
import { AWS_API_GATEWAY_URL } from "@/types/commonTypes";
import ReportCard from "./ReportCard";

interface props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFileModal({ isOpen, onClose }: props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setStatus("");
    setReport("");
  }

  async function handleUpload() {
    if (!selectedFile) {
      setStatus("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setStatus(`Uploading ${selectedFile.name}...`);

    try {
      // 1. Get Presigned URL
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

      const reportData = await validateRes.json();
      console.log(reportData);
      if (!validateRes.ok)
        throw new Error(`Validation failed (${validateRes.status})`);

      setReport(JSON.stringify(reportData, null, 2));
      setStatus(`${selectedFile.name} uploaded.`);
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
    setReport("");
    setStatus("");
    setLoading(false);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="File Upload">
      <div className="w-full p-20 flex flex-col border-2 border-dashed border-gray-400 rounded-2xl items-center justify-center">
        <div className="justify-center items-center gap-4">
          <button onClick={() => fileRef.current?.click()}>
            <div className="flex flex-col justify-center items-center">
              <div className="w-20 h-20 rounded-full bg-gray-400/20">
                <div className="flex justify-center items-center h-full w-full">
                  <FileUp size={45} color="#9CA3AF" />
                </div>
              </div>
              {selectedFile ? (
                <p className="text-gray-600 text-sm mt-2">
                  {selectedFile.name}
                </p>
              ) : (
                <p className="text-gray-600 text-sm mt-2">
                  Click to upload the CSV file
                </p>
              )}
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="rounded bg-black px-4 py-2 text-white my-4 disabled:opacity-50"
          onClick={handleUpload}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button
          type="button"
          disabled={loading}
          className="rounded bg-white px-4 py-2 text-black border border-gray-500 my-4 disabled:opacity-50"
          onClick={handleClose}
        >
          {"Close"}
        </button>
      </div>
      <div className="flex w-full flex-wrap gap-4">
        <ReportCard title="Report Date" data="12/15/2026" />
        <ReportCard title="Total Rows" data="58450" />
        <ReportCard title="Loaded Rows" data="58450" />
        <ReportCard title="Failed Rows" data="0" />
        <ReportCard title="Unique Entities" data="6339" />
        <ReportCard title="Subjects With Multiple Rows" data="3272" />
        <ReportCard title="Subjects With Warnings" data="0" />
        <ReportCard title="Warnings Count" data="0" />
        {report && (
          <div className="mt-3 text-sm text-gray-600">
            <p>Report:</p>
            <pre className="bg-gray-100 p-2 rounded">{report}</pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
