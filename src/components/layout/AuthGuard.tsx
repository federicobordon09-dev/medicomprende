"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated" && !PUBLIC_ROUTES.includes(pathname)) {
      signIn(undefined, { callbackUrl: pathname });
    }
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sk-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-coral-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-warm-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
