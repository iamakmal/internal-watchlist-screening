import { requireRole } from "@/app/lib/require-auth";
import BatchScreen from "./BatchScreen";

export default async function BatchScreenPage() {
  await requireRole(["ADMIN", "ANALYST"]);
  return <BatchScreen />;
}
