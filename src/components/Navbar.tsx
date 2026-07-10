"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { site } from "@/data/contenido";

export default function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isLandingPage = pathname === "/";
  const showMarketingNav = isLoginPage || isLandingPage;
  const showLoginButton = !isLoginPage && pathname !== "/register" && !pathname.startsWith("/dashboard");
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-16 z-50 bg-ink border-b-[3px] border-ink"
      aria-label="Navegación principal"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group min-h-11" aria-label="Ir al inicio">
          <span className="font-display font-bold text-lg uppercase tracking-tight text-paper">Medi</span>
          <span className="font-display font-bold text-lg uppercase tracking-tight bg-accent text-ink px-1">Comprende</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {showMarketingNav && (
            <>
              {isLandingPage && (
                <>
                  <button
                    onClick={() => scrollTo("como-funciona")}
                    className="hidden sm:inline-flex text-xs sm:text-sm font-mono font-bold uppercase px-3 py-2.5 min-h-11 items-center text-paper/70 hover:text-accent transition-colors"
                  >
                    Cómo funciona
                  </button>
                  <button
                    onClick={() => scrollTo("planes")}
                    className="hidden sm:inline-flex text-xs sm:text-sm font-mono font-bold uppercase px-3 py-2.5 min-h-11 items-center text-paper/70 hover:text-accent transition-colors"
                  >
                    Planes
                  </button>
                  <button
                    onClick={() => scrollTo("faq")}
                    className="hidden sm:inline-flex text-xs sm:text-sm font-mono font-bold uppercase px-3 py-2.5 min-h-11 items-center text-paper/70 hover:text-accent transition-colors"
                  >
                    FAQ
                  </button>
                </>
              )}
              <Link
                href="/pricing"
                className="hidden sm:inline-flex text-xs sm:text-sm font-mono font-bold uppercase px-3 py-2.5 min-h-11 items-center text-paper/70 hover:text-accent transition-colors"
              >
                Precios
              </Link>
            </>
          )}

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 brutal-border-2 transition-colors"
              >
                <div className="w-7 h-7 bg-accent flex items-center justify-center text-ink text-xs font-bold">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-paper brutal-border-2 brutal-shadow z-50 overflow-hidden">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-mono font-bold uppercase text-ink hover:bg-accent"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/subir"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-mono font-bold uppercase text-ink hover:bg-accent"
                      >
                        Subir estudio
                      </Link>
                      <Link
                        href="/dashboard/configuracion"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-mono font-bold uppercase text-ink hover:bg-accent"
                      >
                        Configuración
                      </Link>
                      <hr className="border-ink" />
                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="w-full text-left px-4 py-3 text-sm font-mono font-bold uppercase text-accent-2 hover:bg-accent-2 hover:text-white"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : showLoginButton ? (
            <Link
              href="/login"
              className="brutal-btn text-xs ml-2"
            >
              Iniciar sesión
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
