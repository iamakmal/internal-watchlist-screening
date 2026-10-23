import { requireRole } from "@/app/lib/require-auth";
import EvaluateScreen from "./EvaluateScreen";

export default async function EvaluateScreenPage() {
  await requireRole(["ADMIN"]);
  return <EvaluateScreen />;
}