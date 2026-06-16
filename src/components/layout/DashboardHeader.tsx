"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Resumen",
  "/dashboard/upload": "Subir estudio",
  "/dashboard/compare": "Comparar estudios",
  "/dashboard/alerts": "Alertas",
  "/dashboard/family": "Perfiles familiares",
  "/dashboard/settings": "Configuración",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard";

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-azul-200/60">
      <h1 className="font-display font-semibold text-lg text-warm-950">
        {title}
      </h1>
      <Link
        href="/dashboard/upload"
        className="inline-flex items-center gap-2 bg-cta-500 hover:bg-cta-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-cta-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nuevo estudio
      </Link>
    </header>
  );
}
