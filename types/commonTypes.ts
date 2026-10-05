export const AWS_API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL ?? "";

export interface ValidationIssue {
  row: number;
  unique_id: string;
  severity: "ERROR" | "WARNING";
  code: string;
  message: string;
}
