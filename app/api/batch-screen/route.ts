import { authenticatedApi } from "@/app/lib/api-client";
import { ApiError, errorResponse } from "@/app/lib/api-errors";
import { getCurrentUser } from "@/app/lib/current-user";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

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

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `File size must be between 1 byte and ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      },
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
    const { upload_url, file_key } = await authenticatedApi<{
      upload_url: string;
      file_key: string;
    }>({ action: "get-batch-upload-url" });

    // 2. Upload to S3
    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": "text/csv" },
      body: file,
    });
    if (!putRes.ok) {
      console.error(`S3 upload failed (${putRes.status})`);
      throw new ApiError(502, "File upload failed");
    }

    // 3. Batch search
    const report = await authenticatedApi({
      action: "batch-screen",
      file_key,
      minimum_score: minimumScore,
    });

    return NextResponse.json(report);
  } catch (error) {
    return errorResponse(error, "Batch screening failed. Please try again.");
  }
}
