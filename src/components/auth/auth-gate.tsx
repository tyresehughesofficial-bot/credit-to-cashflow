"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authConfigured } from "@/lib/auth/client";
import { useAuth } from "@/lib/auth/use-auth";

/** Gates the dashboard. Static-host friendly: client-side redirect to /login.
 *  When auth isn't configured at all, it lets everything through (local/demo). */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAuthed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authConfigured && !loading && !isAuthed) router.replace("/login");
  }, [loading, isAuthed, router]);

  if (!authConfigured) return <>{children}</>;

  if (loading || !isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-gold" /> Loading…
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
