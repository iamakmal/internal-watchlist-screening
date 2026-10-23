import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 },
      );
    }
    if (error.status === 403) {
      return NextResponse.json(
        { error: "You do not have permission." },
        { status: 403 },
      );
    }
    if (error.status >= 500) {
      console.error("Upstream error:", error.status, error.message);
      return NextResponse.json(
        { error: "Lambda function is unavailable. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return NextResponse.json(
      { error: "The request timed out. Try again." },
      { status: 504 },
    );
  }

  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
