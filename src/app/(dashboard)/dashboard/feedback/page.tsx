"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TipoMensaje = "sugerencia" | "reporte";

const TIPOS: { value: TipoMensaje; label: string; desc: string; icon: string }[] = [
  {
    value: "sugerencia",
    label: "Sugerencia",
    desc: "Una idea para mejorar MediComprende",
    icon: "💡",
  },
  {
    value: "reporte",
    label: "Reportar error",
    desc: "Algo no funciona como debería",
    icon: "🔧",
  },
];

export default function FeedbackPage() {
  const [tipo, setTipo] = useState<TipoMensaje | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo || mensaje.trim().length < 10) return;

    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tipo === "sugerencia" ? "Sugerencia" : "Reportar error",
          message: mensaje,
          contact: email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar tu mensaje.");
        return;
      }

      setEnviado(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="page-enter max-w-lg mx-auto text-center py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-16 h-16 rounded-full bg-celeste-100 flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-celeste-600">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-warm-950 mb-2">
            ¡Gracias por tu mensaje!
          </h2>
          <p className="text-warm-500 text-sm leading-relaxed">
            Tu {tipo === "sugerencia" ? "sugerencia" : "reporte"} nos ayuda a mejorar.
            Lo revisamos y te respondemos si es necesario.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-warm-950">Ideas y comentarios</h1>
        <p className="text-warm-500 text-sm mt-1">
          Ayudanos a mejorar MediComprende con tus sugerencias o reportando errores.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-azul-200/60 p-6 space-y-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Tipo de mensaje */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-3">
            ¿Qué tipo de mensaje es?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {TIPOS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                  tipo === t.value
                    ? "border-cta-500 bg-cta-50/50 shadow-sm"
                    : "border-azul-200/60 bg-white hover:border-azul-300 hover:bg-azul-50/30"
                }`}
              >
                <span className="text-xl block mb-1.5">{t.icon}</span>
                <span className={`text-sm font-semibold block ${
                  tipo === t.value ? "text-cta-700" : "text-warm-900"
                }`}>
                  {t.label}
                </span>
                <span className="text-xs text-warm-500 mt-0.5 block leading-snug">
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-warm-700 mb-1.5">
            Contanos más
          </label>
          <textarea
            id="mensaje"
            rows={5}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder={
              tipo === "sugerencia"
                ? "Contanos tu idea para mejorar..."
                : "Describí el error que encontraste..."
            }
            className="w-full px-3.5 py-2.5 bg-white border border-azul-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm resize-none"
            required
            minLength={10}
          />
          <p className="text-xs text-warm-400 mt-1.5 text-right">
            {mensaje.length} caracteres{mensaje.length > 0 && mensaje.length < 10 ? " (mínimo 10)" : ""}
          </p>
        </div>

        {/* Contacto - solo email */}
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-warm-700 mb-1.5">
            ¿Cómo te contactamos?
          </label>
          <div className="flex items-center gap-2 bg-azul-50/50 rounded-xl px-3.5 py-1.5 border border-azul-200/60 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-azul-500 flex-shrink-0">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4l-10 8L2 4" />
            </svg>
            <span className="text-xs text-warm-500">
              Solo necesitamos tu email para responderte
            </span>
          </div>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-3.5 py-2.5 bg-white border border-azul-200 rounded-xl text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-cta-500/30 focus:border-cta-500 transition-all text-sm"
          />
          <p className="text-xs text-warm-400 mt-1.5">Opcional — si querés que te respondamos</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={!tipo || mensaje.trim().length < 10 || enviando}
          className="w-full bg-cta-500 hover:bg-cta-600 disabled:bg-azul-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all active:scale-[0.98] text-sm"
        >
          {enviando ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              Enviando…
            </span>
          ) : (
            "Enviar mensaje"
          )}
        </button>
      </motion.form>
    </div>
  );
}
