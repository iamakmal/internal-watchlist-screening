import { authenticatedApi } from "@/app/lib/api-client";
import { errorResponse } from "@/app/lib/api-errors";
import { getCurrentUser } from "@/app/lib/current-user";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const searchSchema = z.object({
  action: z.literal("search"),
  name: z.string().trim().min(1),
  dob: z.string().optional(),
  minimum_score: z.number().min(0).max(100).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await request.json().catch(() => null);
    const parsed = searchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const result = await authenticatedApi(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error, "Screening failed. Please try again.");
  }
}
