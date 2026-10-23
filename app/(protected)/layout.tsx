import { AuthProvider } from "@/providers/auth-provider";
import { requireAuth } from "../lib/require-auth";


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <AuthProvider user={user}>
      {children}
    </AuthProvider>
  );
}