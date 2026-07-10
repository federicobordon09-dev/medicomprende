"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AOS from "aos";
import ComoFunciona from "@/components/ComoFunciona";
import Preguntas from "@/components/Preguntas";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white brutal-border-2 px-3 py-2">
      <span className="flex-shrink-0 w-6 h-6 bg-ink text-accent flex items-center justify-center">
        <CheckIcon />
      </span>
      <span className="text-sm font-mono font-bold text-ink uppercase">{text}</span>
    </div>
  );
}

const testimonials = [
  { text: "Por fin entendí qué decía mi resonancia. Nunca pensé que fuera tan sencillo.", name: "Carolina M." },
  { text: "Lo usé con el informe de mi papá. Ahora sabemos qué preguntarle al médico.", name: "Andrés F." },
];

function TestimonialCard({ text, name }: { text: string; name: string }) {
  return (
    <div className="bg-white brutal-card p-4">
      <p className="text-sm text-ink leading-relaxed font-medium">"{text}"</p>
      <p className="text-xs text-ink/60 font-mono font-bold uppercase mt-2">— {name}</p>
    </div>
  );
}

function GoogleSignInCard() {
  return (
    <div className="bg-accent brutal-border-2 brutal-shadow p-6 sm:p-8 w-full">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-ink text-accent brutal-border-2 mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      </div>
      <h2 className="font-display font-bold text-2xl text-ink uppercase mb-2">
        Iniciá sesión
      </h2>
      <p className="text-sm text-ink/70 mb-6 leading-relaxed font-mono">
        Accedé a tu cuenta para ver tus análisis guardados.
      </p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full brutal-btn brutal-btn--white text-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span className="truncate">Continuar con Google</span>
      </button>
      <p className="text-xs text-ink/60 text-center mt-4 font-mono">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-ink font-bold underline decoration-2">
          Registrate gratis
        </Link>
      </p>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[80dvh] flex items-center py-16 sm:py-20 px-4 sm:px-6 overflow-hidden bg-paper">
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-3 space-y-6">
            <span className="brutal-tag">Sin costo • Confidencial</span>

            <h1 className="font-display font-bold text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] text-ink uppercase">
              Entendé tu informe médico{" "}
              <span className="bg-ink text-accent px-2">en palabras simples</span>
            </h1>
            <p className="text-[18px] md:text-[19px] text-ink/70 max-w-xl leading-[1.5]">
              Subí tu estudio y dejá que la IA traduzca cada término, hallazgo y resultado
              a lenguaje claro. Sin vueltas, sin alarmas.
            </p>

            <div className="grid sm:grid-cols-1 gap-2">
              <BenefitItem text="Subí tu PDF en segundos" />
              <BenefitItem text="Analizamos con IA de Google" />
              <BenefitItem text="Explicación clara al instante" />
            </div>

            <div className="flex flex-wrap gap-4 lg:gap-6 brutal-border-2 bg-white px-4 py-3">
              {[
                { value: "Miles de", label: "estudios analizados" },
                { value: "4.9", label: "valoración" },
                { value: "Gratis", label: "plan disponible" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg text-ink">{stat.value}</span>
                  <span className="text-xs text-ink/60 font-mono uppercase">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <TestimonialCard {...testimonials[0]} />
              <TestimonialCard {...testimonials[1]} />
            </div>

            <div className="flex items-center gap-3 text-sm text-ink/70 font-mono brutal-border-2 bg-white px-3 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
              <span>Confidencial. Tus datos nunca se comparten.</span>
            </div>
          </div>

          <div className="lg:col-span-2 lg:pt-10 min-w-0">
            <GoogleSignInCard />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper">
        <div className="w-8 h-8 border-4 border-ink border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <div data-aos="fade-up">
        <ComoFunciona />
      </div>
      <div data-aos="fade-up">
        <Preguntas />
      </div>
    </>
  );
}
