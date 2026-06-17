"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import AOS from "aos";
import ComoFunciona from "@/components/ComoFunciona";
import Preguntas from "@/components/Preguntas";

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 text-sm"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-azul-100 flex items-center justify-center text-azul-600">
        {icon}
      </span>
      <span className="text-warm-700">{text}</span>
    </motion.div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const testimonials = [
  { text: "Por fin entendí qué decía mi resonancia. Nunca pensé que fuera tan sencillo.", name: "Carolina M." },
  { text: "Lo usé con el informe de mi papá. Ahora sabemos qué preguntarle al médico.", name: "Andrés F." },
];

function TestimonialCard({ text, name, delay }: { text: string; name: string; delay: number }) {
  return (
    <motion.div
      className="bg-white/70 backdrop-blur-sm border border-azul-200/50 rounded-xl p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-warm-700 leading-relaxed">"{text}"</p>
      <p className="text-xs text-warm-500 font-medium mt-2">{name}</p>
    </motion.div>
  );
}

function DecorativeBlob({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full opacity-30 blur-3xl pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

function DotPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
      aria-hidden="true"
    >
      <defs>
        <pattern id="login-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-dots)" />
    </svg>
  );
}

function FloatingPills() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-[15%] right-[10%] w-24 h-10 bg-azul-200/40 rounded-full animate-float-slow blur-sm" />
      <div className="absolute bottom-[25%] left-[5%] w-32 h-8 bg-cta-200/30 rounded-full animate-float-delayed blur-sm" />
      <div className="absolute top-[40%] left-[20%] w-20 h-6 bg-celeste-200/40 rounded-full animate-float blur-sm" />
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-azul-600">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function GoogleSignInCard() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-6px_rgba(0,0,0,0.08)] border border-warm-200/60 p-8 sm:p-10 w-full"
    >
      <div className="text-center mb-7">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-azul-50 to-azul-100 flex items-center justify-center mx-auto mb-4 ring-1 ring-azul-200/50">
          <ShieldIcon />
        </div>
        <h2 className="font-display font-bold text-2xl text-warm-950 mb-1.5">Iniciar sesión</h2>
        <p className="text-[15px] text-warm-600 leading-relaxed max-w-xs mx-auto">
          Accedé a tu historial de estudios con tu cuenta de Google
        </p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-warm-50 text-warm-800 font-semibold px-5 py-3 rounded-xl border border-warm-200 transition-all active:scale-[0.97] text-[15px] disabled:opacity-60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_-6px_rgba(0,0,0,0.12)] hover:border-warm-300"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {loading ? "Conectando…" : "Continuar con Google"}
      </button>

      <p className="text-center text-sm text-warm-600 mt-6">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-cta-600 hover:text-cta-500 font-semibold transition-colors">
          Crear cuenta gratis
        </Link>
      </p>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative lg:min-h-[calc(100vh-4rem)] lg:flex lg:items-center pt-20 pb-16 md:pb-24 overflow-hidden bg-gradient-to-br from-warm-50 via-azul-50/40 to-white">
      <DecorativeBlob className="top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-cta-200/25" />
      <DecorativeBlob className="bottom-[-15%] left-[-8%] w-[35rem] h-[35rem] bg-azul-200/25" />
      <DecorativeBlob className="top-[40%] left-[30%] w-[20rem] h-[20rem] bg-celeste-200/20" />
      <DotPattern />
      <FloatingPills />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-azul-100/60 border border-azul-200/60 rounded-full text-xs font-semibold text-azul-700 mb-6 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-azul-500 animate-pulse-glow" />
                Sin costo • Siempre gratis
              </div>
              <h1 className="font-display font-extrabold text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.08] text-warm-950 mb-5 text-balance tracking-[-0.03em]">
                Tu informe médico,{" "}
                <span className="text-cta-600">en palabras simples</span>
              </h1>
              <p className="text-[18px] md:text-[19px] text-warm-700 max-w-xl leading-[1.65]">
                Subí tu estudio y deja que la IA traduzca cada término, hallazgo y resultado
                a lenguaje claro. Sin vueltas, sin alarmas.
              </p>
            </div>

            <div className="space-y-3" data-aos="fade-up" data-aos-delay="200">
              <BenefitItem icon={<CheckIcon />} text="Subí tu PDF en segundos" />
              <BenefitItem icon={<CheckIcon />} text="Analizamos con IA de Google" />
              <BenefitItem icon={<CheckIcon />} text="Recibí una explicación clara al instante" />
            </div>

            <motion.div
              className="flex flex-wrap gap-6 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { value: "10K+", label: "estudios analizados" },
                { value: "4.9", label: "valoración" },
                { value: "0", label: "costo • siempre gratis" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="font-bold text-lg text-warm-950">{stat.value}</span>
                  <span className="text-xs text-warm-500">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" data-aos="fade-up" data-aos-delay="300">
              <TestimonialCard {...testimonials[0]} delay={0.6} />
              <TestimonialCard {...testimonials[1]} delay={0.7} />
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-cta-500 hover:bg-cta-600 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-[0.97] text-[15px] shadow-[0_4px_14px_-4px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_-8px_rgba(79,70,229,0.45)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear cuenta gratis
              </Link>
              <button
                type="button"
                onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 text-warm-700 hover:text-warm-900 font-medium text-[15px] px-4 py-3 transition-colors cursor-pointer"
              >
                Cómo funciona
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-warm-500 border-t border-warm-200/60 pt-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-celeste-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
              <span>Confidencial. Tus datos nunca se comparten.</span>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:pl-6">
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

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-azul-500 border-t-transparent rounded-full animate-spin" />
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
