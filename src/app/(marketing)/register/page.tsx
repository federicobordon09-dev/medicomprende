"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function UserPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-azul-600">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function GoogleSignUpCard() {
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
          <UserPlusIcon />
        </div>
        <h2 className="font-display font-bold text-2xl text-warm-950 mb-1.5">Crear cuenta gratis</h2>
        <p className="text-[15px] text-warm-600 leading-relaxed max-w-xs mx-auto">
          Empezá a entender tus estudios médicos con tu cuenta de Google
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
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-cta-600 hover:text-cta-500 font-semibold transition-colors">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 md:pb-24 overflow-hidden bg-gradient-to-br from-warm-50 via-azul-50/40 to-white">
      <div className="absolute rounded-full opacity-30 blur-3xl pointer-events-none top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-cta-200/25" aria-hidden="true" />
      <div className="absolute rounded-full opacity-30 blur-3xl pointer-events-none bottom-[-15%] left-[-8%] w-[35rem] h-[35rem] bg-azul-200/25" aria-hidden="true" />
      <div className="absolute rounded-full opacity-30 blur-3xl pointer-events-none top-[40%] left-[30%] w-[20rem] h-[20rem] bg-celeste-200/20" aria-hidden="true" />
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" aria-hidden="true">
        <defs>
          <pattern id="register-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#register-dots)" />
      </svg>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-7">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-azul-100/60 border border-azul-200/60 rounded-full text-xs font-semibold text-azul-700 mb-6 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-azul-500 animate-pulse-glow" />
                Sin costo • Siempre gratis
              </div>
              <h1 className="font-display font-extrabold text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.08] text-warm-950 mb-5 text-balance tracking-[-0.03em]">
                Creá tu cuenta y empezá a{" "}
                <span className="text-cta-600">entender tu salud</span>
              </h1>
              <p className="text-[18px] md:text-[19px] text-warm-700 max-w-xl leading-[1.65]">
                Registrate gratis y accedé a tu historial de estudios. Guardá tus informes,
                compará resultados en el tiempo y compartilos con tu familia.
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                "Guardá todos tus estudios en un solo lugar",
                "Compará resultados anteriores para ver tu evolución",
                "Creá perfiles familiares para gestionar juntos",
                "Recibí alertas sobre valores fuera de rango",
              ].map((text, i) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-azul-100 flex items-center justify-center text-azul-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-[15px] text-warm-700">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:pl-6">
            <GoogleSignUpCard />
          </div>
        </div>
      </div>
    </section>
  );
}
