"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { hero } from "@/data/contenido";

export default function HeroLanding() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-azul-950 via-azul-900 to-azul-950">
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <Image
          src="/assets/images/banner_01.png"
          alt="Fondo decorativo de MediComprende"
          fill
          className="object-cover opacity-[0.04]"
          sizes="100vw"
          priority
        />
      </div>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[12%] left-[8%] w-64 h-64 rounded-full bg-cta-500/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 rounded-full bg-celeste-500/8 blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[20%] w-2 h-2 rounded-full bg-cta-300/40 animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-[30%] left-[15%] w-1.5 h-1.5 rounded-full bg-celeste-300/40 animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <div
          className={`inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 mb-6 transition-all duration-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-celeste-400" />
          <span className="text-xs font-medium text-azul-200 tracking-wide">{hero.badge}</span>
        </div>

        <h1
          className={`font-display font-extrabold text-[clamp(2rem,5vw,3.8rem)] leading-[1.08] text-white mb-4 max-w-3xl transition-all duration-700 delay-100 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Subí tu informe médico y{" "}
          <span className="relative inline-block">
            <span className="text-cta-400 relative z-10">enterate qué dice</span>
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-cta-500/20 rounded-full blur-sm -z-0" />
          </span>
        </h1>

        <p
          className={`text-base sm:text-lg text-azul-200/80 leading-relaxed mb-8 max-w-xl transition-all duration-700 delay-200 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {hero.subtitle}
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-300 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-cta-500 hover:bg-cta-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl text-base active:scale-[0.97] transition-all duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Crear cuenta gratis
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-azul-300 hover:text-white font-medium px-6 py-4 rounded-xl transition-colors"
          >
            Iniciar sesión
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </Link>
        </div>

        <p className="text-xs text-azul-400/60 mt-4 max-w-md transition-all duration-700 delay-350">
          Esta es una herramienta educativa. No reemplaza la consulta con un profesional de la salud.
        </p>

        <div
          className={`flex flex-wrap items-center justify-center gap-6 mt-12 transition-all duration-700 delay-500 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {[
                { value: "Miles de", label: "estudios analizados" },
                { value: "4.9", label: "valoración" },
                { value: "Plan", label: "gratuito disponible" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">{stat.value}</span>
              <span className="text-xs text-azul-300">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
