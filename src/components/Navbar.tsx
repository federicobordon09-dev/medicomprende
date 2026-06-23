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
      className="fixed top-0 left-0 right-0 h-16 z-50 bg-azul-950 shadow-lg"
      aria-label="Navegación principal"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group min-h-11" aria-label="Ir al inicio">
          <Image
            src="/assets/images/logo_01.png"
            alt={site.name}
            width={36}
            height={36}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-display font-semibold text-base sm:text-lg text-white">
            {site.name}
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {showMarketingNav && (
            <>
              {isLandingPage && (
                <>
                  <button
                    onClick={() => scrollTo("como-funciona")}
                    className="hidden sm:inline-flex text-xs sm:text-sm font-medium px-3 py-2.5 min-h-11 items-center rounded-lg text-white/80 hover:text-white transition-colors"
                  >
                    Cómo funciona
                  </button>
                  <button
                    onClick={() => scrollTo("planes")}
                    className="hidden sm:inline-flex text-xs sm:text-sm font-medium px-3 py-2.5 min-h-11 items-center rounded-lg text-white/80 hover:text-white transition-colors"
                  >
                    Planes
                  </button>
                  <button
                    onClick={() => scrollTo("faq")}
                    className="hidden sm:inline-flex text-xs sm:text-sm font-medium px-3 py-2.5 min-h-11 items-center rounded-lg text-white/80 hover:text-white transition-colors"
                  >
                    FAQ
                  </button>
                </>
              )}
              <Link
                href="/pricing"
                className="hidden sm:inline-flex text-xs sm:text-sm font-medium px-3 py-2.5 min-h-11 items-center rounded-lg text-white/80 hover:text-white transition-colors"
              >
                Precios
              </Link>
            </>
          )}

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-cta-500 flex items-center justify-center text-white text-xs font-bold">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-azul-100 z-50 overflow-hidden">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-warm-700 hover:bg-azul-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/upload"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-warm-700 hover:bg-azul-50"
                      >
                        Subir estudio
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-warm-700 hover:bg-azul-50"
                      >
                        Configuración
                      </Link>
                      <hr className="border-azul-100" />
                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
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
              className="text-xs sm:text-sm font-semibold px-4 py-2.5 min-h-11 flex items-center rounded-xl bg-cta-500 hover:bg-cta-600 text-white transition-all active:scale-[0.97] ml-2"
            >
              Iniciar sesión
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
