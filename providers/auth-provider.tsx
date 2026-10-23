"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { AuthUser } from "@/types/auth";

type AuthContextType = {
  user: AuthUser;
  isAdmin: boolean;
  isAnalyst: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: AuthUser;
}) {
  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user.role === "ADMIN",
        isAnalyst: user.role === "ANALYST",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
