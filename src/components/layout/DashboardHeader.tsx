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
    <header className="h-16 flex items-center justify-between pl-14 lg:pl-6 pr-6 bg-paper border-b-[3px] border-ink">
      <h1 className="font-display font-bold text-lg text-ink uppercase tracking-tight">
        {title}
      </h1>
      <Link
        href="/dashboard/upload"
        className="brutal-btn text-xs"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nuevo estudio
      </Link>
    </header>
  );
}
