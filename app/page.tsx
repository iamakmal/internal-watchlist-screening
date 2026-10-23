import { redirect } from "next/navigation";
import { requireAuth } from "./lib/require-auth";

export default async function Home() {
  await requireAuth();

  redirect("/single-screen");
}
