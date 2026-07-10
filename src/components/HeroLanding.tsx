"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hero } from "@/data/contenido";

export default function HeroLanding() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 sm:pb-20 overflow-hidden bg-ink">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-paper) 1px, transparent 1px), linear-gradient(90deg, var(--color-paper) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink via-transparent to-transparent" aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center transition-all duration-700 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <span className="brutal-tag mb-6">{hero.badge}</span>

        <h1 className="font-display font-bold text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] text-paper uppercase tracking-tight mb-5 max-w-4xl">
          Subí tu informe médico y{" "}
          <span className="bg-accent text-ink px-2 inline-block mt-1">enterate qué dice</span>
        </h1>

        <p className="text-base sm:text-xl text-paper/70 leading-relaxed mb-8 max-w-xl font-mono">
          {hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="brutal-btn text-base px-8 py-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Crear cuenta gratis
          </Link>
          <Link
            href="/login"
            className="brutal-btn brutal-btn--white text-base px-6 py-4"
          >
            Iniciar sesión
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </Link>
        </div>

        <p className="text-xs text-paper/50 mt-5 max-w-md font-mono uppercase">
          Herramienta educativa. No reemplaza la consulta con un profesional.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          {[
            { value: "Miles de", label: "estudios analizados" },
            { value: "4.9", label: "valoración" },
            { value: "Gratis", label: "plan disponible" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 bg-paper brutal-border-2 px-4 py-2">
              <span className="font-display font-bold text-lg text-ink">{stat.value}</span>
              <span className="text-xs text-ink/60 font-mono uppercase">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
