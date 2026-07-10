"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="w-12 h-12 bg-accent text-ink brutal-border-2 flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeDasharray="50" strokeDashoffset="50" />
            </svg>
          </div>
          <p className="text-ink/60 font-mono text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
