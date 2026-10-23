import { redirect } from "next/navigation";
import { getCurrentUser } from "./current-user";
import { Role } from "@/types/auth";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect("/single-screen");
  }

  return user;
}
