"use client";

import { AuthProvider } from "@/lib/auth/use-auth";

/** Client-side providers mounted at the root so /login and the dashboard share auth state. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
