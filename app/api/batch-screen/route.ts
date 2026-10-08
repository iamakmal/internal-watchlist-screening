import { NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.AWS_API_GATEWAY_URL;

async function callGateway(
  action: "get-batch-upload-url" | "batch-search",
  data: Record<string, unknown> = {},
) {
  const res = await fetch(API_GATEWAY_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  if (!res.ok) throw new Error(`Gateway "${action}" failed (${res.status})`);
  return res.json();
}

export async function POST(request: Request) {
  if (!API_GATEWAY_URL) {
    return NextResponse.json(
      { error: "Server is not configured" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const minimumScoreValue = formData.get("minimum_score");
  const minimumScore =
    typeof minimumScoreValue === "string" ? Number(minimumScoreValue) : 80;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json(
      { error: "Only CSV files are allowed" },
      { status: 400 },
    );
  }
  if (
    !Number.isFinite(minimumScore) ||
    minimumScore < 0 ||
    minimumScore > 100
  ) {
    return NextResponse.json(
      { error: "Minimum score must be between 0 and 100" },
      { status: 400 },
    );
  }

  try {
    // 1. Get presigned URL
    const { upload_url, file_key } = await callGateway("get-batch-upload-url");

    // 2. Upload to S3
    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": "text/csv" },
      body: file,
    });
    if (!putRes.ok) throw new Error(`S3 upload failed (${putRes.status})`);

    // 3. Batch search
    const report = await callGateway("batch-search", {
      file_key,
      minimum_score: minimumScore,
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Upload pipeline failed:", error);
    return NextResponse.json(
      { error: "Upload or validation failed. Please try again." },
      { status: 502 },
    );
  }
}
