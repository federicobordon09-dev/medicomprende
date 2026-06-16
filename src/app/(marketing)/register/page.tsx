"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── Decorative blob ── */
function DecorativeBlob({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full opacity-30 blur-3xl pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

/* ── Dot pattern ── */
function DotPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" aria-hidden="true">
      <defs>
        <pattern id="register-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#register-dots)" />
    </svg>
  );
}

/* ── Benefit item ── */
function BenefitItem({ text }: { text: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 text-sm"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-azul-100 flex items-center justify-center text-azul-600">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="text-warm-600">{text}</span>
    </motion.div>
  );
}

/* ── Register form ── */
function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear la cuenta.");
        return;
      }

      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl border border-warm-200 p-7 sm:p-8 w-full"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center mb-6">
        <h2 className="font-display font-bold text-xl text-warm-950 mb-1">Crear cuenta gratis</h2>
        <p className="text-sm text-warm-500">Empezá a entender tus estudios médicos</p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-warm-50 text-warm-800 font-medium px-5 py-2.5 rounded-xl border border-warm-200 transition-all active:scale-[0.98] text-sm disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {googleLoading ? "Conectando…" : "Continuar con Google"}
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-warm-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-warm-400">o con email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-warm-700 mb-1.5">Nombre</label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
            placeholder="Tu nombre"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
            placeholder="tu@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-warm-700 mb-1.5">Contraseña</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
          />
        </div>

        {error && (
          <motion.div
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-sm text-red-700"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cta-500 hover:bg-cta-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
        >
          {loading ? "Creando cuenta…" : "Crear cuenta gratis"}
        </button>
      </form>

      <p className="text-center text-sm text-warm-500 mt-6">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-cta-600 hover:text-cta-500 font-medium">
          Iniciar sesión
        </Link>
      </p>
    </motion.div>
  );
}

/* ── Main page ── */
export default function RegisterPage() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center pt-16 pb-12 overflow-hidden bg-gradient-to-br from-warm-50 via-azul-50/60 to-white">
      {/* Decorative */}
      <DecorativeBlob className="top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-cta-200/30" />
      <DecorativeBlob className="bottom-[-15%] left-[-8%] w-[35rem] h-[35rem] bg-azul-200/30" />
      <DecorativeBlob className="top-[40%] left-[30%] w-[20rem] h-[20rem] bg-celeste-200/20" />
      <DotPattern />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* ── Left: Value proposition ── */}
          <div className="order-2 lg:order-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-azul-100/60 border border-azul-200/60 rounded-full text-xs font-medium text-azul-700 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-azul-500 animate-pulse-glow" />
                Sin costo • Siempre gratis
              </div>
              <h1 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] leading-[1.12] text-warm-950 mb-4 text-balance">
                Creá tu cuenta y empezá a{" "}
                <span className="text-cta-600">entender tu salud</span>
              </h1>
              <p className="text-base md:text-lg text-warm-500 max-w-lg leading-relaxed">
                Registrate gratis y accedé a tu historial de estudios. Guardá tus informes,
                compará resultados en el tiempo y compartilos con tu familia.
              </p>
            </motion.div>

            <div className="space-y-3">
              <BenefitItem text="Guardá todos tus estudios en un solo lugar" />
              <BenefitItem text="Compará resultados anteriores para ver tu evolución" />
              <BenefitItem text="Creá perfiles familiares para gestionar juntos" />
              <BenefitItem text="Recibí alertas sobre valores fuera de rango" />
            </div>
          </div>

          {/* ── Right: Register form ── */}
          <div className="order-1 lg:order-2 lg:pl-4">
            <RegisterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
