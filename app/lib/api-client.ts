import "server-only";
import { getAccessToken } from "./auth";
import { ApiError } from "./api-errors";

export async function authenticatedApi<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const url = process.env.AWS_API_GATEWAY_URL;
  if (!url) {
    throw new Error("AWS_API_GATEWAY_URL is not defined");
  }

  const token = await getAccessToken();
  console.log("token", token);
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  console.log("response", response);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error ?? payload?.message;
    throw new ApiError(
      response.status,
      typeof message === "string" ? message : "API request failed",
    );
  }

  return response.json() as Promise<T>;
}
