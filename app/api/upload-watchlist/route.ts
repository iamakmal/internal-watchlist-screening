import { NextResponse } from "next/server";

const API_GATEWAY_URL = process.env.AWS_API_GATEWAY_URL;

async function callGateway(action: "get-upload-url" | "validate") {
  const res = await fetch(API_GATEWAY_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
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

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json(
      { error: "Only CSV files are allowed" },
      { status: 400 },
    );
  }

  try {
    // 1. Get presigned URL
    const { upload_url } = await callGateway("get-upload-url");

    // 2. Upload to S3
    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": "text/csv" },
      body: file,
    });
    if (!putRes.ok) throw new Error(`S3 upload failed (${putRes.status})`);

    // 3. Validate
    const report = await callGateway("validate");

    return NextResponse.json(report);
  } catch (error) {
    console.error("Upload pipeline failed:", error);
    return NextResponse.json(
      { error: "Upload or validation failed. Please try again." },
      { status: 502 },
    );
  }
}
