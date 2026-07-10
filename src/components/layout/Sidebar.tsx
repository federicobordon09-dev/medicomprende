"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/dashboard/subir", label: "Subir estudio", icon: "upload" },
  { href: "/dashboard/comparar", label: "Comparar", icon: "compare" },
  { href: "/dashboard/alertas", label: "Alertas", icon: "bell" },
  { href: "/dashboard/familia", label: "Perfiles", icon: "users" },
  { href: "/dashboard/chatear", label: "Chat con IA", icon: "chat" },
  { href: "/dashboard/configuracion", label: "Configuración", icon: "settings" },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  upload: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  compare: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => setPlan(data.plan || "free"))
      .catch(() => setPlan("free"));
  }, [session]);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 bg-ink brutal-border-2 flex items-center justify-center text-paper"
        aria-label="Abrir menú"
        style={{ display: mobileOpen ? "none" : undefined }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-ink text-paper flex flex-col transition-transform duration-300 border-r-[3px] border-ink ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between p-4 border-b-[3px] border-paper/20">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-display font-bold text-lg uppercase tracking-tight text-paper">Medi</span>
            <span className="font-display font-bold text-lg uppercase tracking-tight bg-accent text-ink px-1">Comprende</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 bg-paper/10 hover:bg-paper/20 flex items-center justify-center text-paper flex-shrink-0 brutal-border-2"
            aria-label="Cerrar menú"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-mono font-bold uppercase tracking-tight transition-all brutal-border-2 ${
                  isActive
                    ? "bg-accent text-ink"
                    : "bg-transparent text-paper/70 hover:text-ink hover:bg-accent"
                }`}
              >
                {ICONS[item.icon]}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-[3px] border-paper/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-accent text-ink brutal-border-2 flex items-center justify-center text-xs font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-paper">{session?.user?.name || "Usuario"}</p>
              <p className="text-xs text-paper/50 truncate">{session?.user?.email}</p>
            </div>
            {plan && (
              plan === "pro" ? (
                <span className="text-[10px] font-bold bg-accent text-ink px-2 py-1 brutal-border-2">PRO</span>
              ) : (
                <Link href="/pricing" className="text-[10px] font-bold bg-paper/10 text-paper hover:bg-accent hover:text-ink px-2 py-1 brutal-border-2 transition-colors">
                  GRATIS
                </Link>
              )
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-mono font-bold uppercase text-paper/70 hover:text-ink hover:bg-accent brutal-border-2 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Salir
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-ink/60 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
