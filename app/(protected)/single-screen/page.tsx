import { requireRole } from "@/app/lib/require-auth";
import SingleScreen from "./SingleScreen";

export default async function SingleScreenPage() {
  await requireRole(["ADMIN", "ANALYST"]);
  return <SingleScreen />;
}