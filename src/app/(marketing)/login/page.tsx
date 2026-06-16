"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import ComoFunciona from "@/components/ComoFunciona";
import Preguntas from "@/components/Preguntas";

/* ── Decorative blob component ── */
function DecorativeBlob({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full opacity-30 blur-3xl pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

/* ── Subtle floating dots pattern (inline SVG) ── */
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

/* ── Floating pill decorations (GSAP-like, done with CSS motion for lightness) ── */
function FloatingPills() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-[15%] right-[10%] w-24 h-10 bg-azul-200/40 rounded-full animate-float-slow blur-sm" />
      <div className="absolute bottom-[25%] left-[5%] w-32 h-8 bg-cta-200/30 rounded-full animate-float-delayed blur-sm" />
      <div className="absolute top-[40%] left-[20%] w-20 h-6 bg-celeste-200/40 rounded-full animate-float blur-sm" />
    </div>
  );
}

/* ── Benefit item ── */
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
      <span className="text-warm-600">{text}</span>
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

/* ── Testimonial mini-card ── */
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
      <p className="text-sm text-warm-600 leading-relaxed">"{text}"</p>
      <p className="text-xs text-warm-400 font-medium mt-2">{name}</p>
    </motion.div>
  );
}

/* ── Forgot Password Modal ── */
function ForgotPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al enviar la solicitud.");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div
        className="bg-white rounded-2xl shadow-xl border border-warm-200 p-6 sm:p-8 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-azul-100 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-azul-600">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-warm-950">¿Olvidaste tu contraseña?</h3>
              <p className="text-sm text-warm-500 mt-1">
                Ingresá tu email y te enviaremos instrucciones para restablecerla.
              </p>
            </div>
      <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} />
      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cta-500 hover:bg-cta-600 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
              >
                {loading ? "Enviando…" : "Enviar instrucciones"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-sm text-warm-500 hover:text-warm-700 py-1 transition-colors"
              >
                Cancelar
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-celeste-100 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-celeste-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg text-warm-950 mb-2">Revisá tu email</h3>
            <p className="text-sm text-warm-500 leading-relaxed">
              Si existe una cuenta con <strong className="text-warm-700">{email}</strong>, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-sm text-cta-500 hover:text-cta-600 font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Login form ── */
function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email o contraseña incorrectos.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
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
        <h2 className="font-display font-bold text-xl text-warm-950 mb-1">Iniciar sesión</h2>
        <p className="text-sm text-warm-500">Accedé a tu historial de estudios</p>
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
          <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
            placeholder="tu@email.com"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-warm-700">Contraseña</label>
            <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-cta-500 hover:text-cta-600 font-medium transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
            placeholder="••••••••"
            required
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
          {loading ? "Iniciando sesión…" : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-center text-sm text-warm-500 mt-6">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-cta-600 hover:text-cta-500 font-medium">
          Crear cuenta gratis
        </Link>
      </p>
    </motion.div>
  );
}

/* ── Main page ── */
export default function LoginPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }, []);

  return (
    <>
      {/* ── Hero + Login ── */}
      <motion.section
        className="relative min-h-[calc(100vh-4rem)] flex items-center pt-16 pb-12 overflow-hidden bg-gradient-to-br from-warm-50 via-sk-50/60 to-white"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Decorative elements */}
        <DecorativeBlob className="top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-cta-200/30" />
        <DecorativeBlob className="bottom-[-15%] left-[-8%] w-[35rem] h-[35rem] bg-azul-200/30" />
        <DecorativeBlob className="top-[40%] left-[30%] w-[20rem] h-[20rem] bg-celeste-200/20" />
        <DotPattern />
        <FloatingPills />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* ── Left: Value proposition ── */}
            <div className="order-2 lg:order-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-azul-100/60 border border-azul-200/60 rounded-full text-xs font-medium text-azul-700 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-azul-500 animate-pulse-glow" />
                  Sin registro • Sin costo • Confidencial
                </div>
                <h1 className="font-display font-extrabold text-[clamp(2rem,5vw,3.2rem)] leading-[1.12] text-warm-950 mb-4 text-balance">
                  Tu informe médico,{" "}
                  <span className="text-cta-600">
                    en palabras que entendés
                  </span>
                </h1>
                <p className="text-base md:text-lg text-warm-500 max-w-lg leading-relaxed">
                  Subí tu estudio y deja que la IA traduzca cada término, hallazgo y resultado a lenguaje simple.
                  Sin vueltas, sin alarmas, sin necesidad de ser médico.
                </p>
              </motion.div>

              {/* Benefits */}
              <div className="space-y-3" data-aos="fade-up" data-aos-delay="200">
                <BenefitItem icon={<CheckIcon />} text="Subí tu PDF en segundos" />
                <BenefitItem icon={<CheckIcon />} text="Analizamos con IA de Google" />
                <BenefitItem icon={<CheckIcon />} text="Recibí una explicación clara al instante" />
              </div>

              {/* Stats / trust row */}
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
                    <span className="text-xs text-warm-400">{stat.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Mini testimonials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" data-aos="fade-up" data-aos-delay="300">
                <TestimonialCard {...testimonials[0]} delay={0.6} />
                <TestimonialCard {...testimonials[1]} delay={0.7} />
              </div>
            </div>

            {/* ── Right: Login form ── */}
            <div className="order-1 lg:order-2 lg:pl-4">
              <LoginForm />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── How it works ── */}
      <div data-aos="fade-up">
        <ComoFunciona />
      </div>

      {/* ── FAQ ── */}
      <div data-aos="fade-up">
        <Preguntas />
      </div>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-warm-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-[clamp(1.5rem,3.5vw,2.2rem)] text-warm-950 mb-3" data-aos="fade-up">
            Empezá ahora, es gratis
          </h2>
          <p className="text-warm-500 mb-6" data-aos="fade-up" data-aos-delay="100">
            No pedimos registro ni tarjeta. Subí tu primer informe y descubrí lo fácil que es entender tu salud.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/register"
              className="w-full sm:w-auto bg-cta-500 hover:bg-cta-600 text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-[0.98] text-sm text-center"
            >
              Crear cuenta gratis
            </Link>
            <button
              onClick={() => document.getElementById("login-form")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto bg-white border border-warm-200 hover:border-warm-300 text-warm-700 font-medium px-8 py-3 rounded-xl transition-all active:scale-[0.98] text-sm text-center"
            >
              Ya tengo cuenta
            </button>
          </motion.div>
        </div>
      </section>

    </>
  );
}
