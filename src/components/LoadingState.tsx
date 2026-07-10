"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const STEPS = [
  { label: "Recibiendo archivo", icon: "file" },
  { label: "Extrayendo texto", icon: "text" },
  { label: "Analizando con IA", icon: "ai" },
  { label: "Generando resultados", icon: "result" },
];

export default function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 2000 : 2500);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-sm"
      >
        <div className="w-16 h-16 bg-accent text-ink brutal-border-2 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-xl text-ink uppercase tracking-tight mb-2">Analizando estudio</h3>
        <p className="text-sm font-mono text-ink/60 mb-8 max-w-sm mx-auto">
          Esto puede tomar unos segundos. No cerrés esta página.
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-2">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={false}
            animate={{ opacity: i <= step ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 px-3 py-2"
          >
            <motion.div
              animate={i === step ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 1.5, repeat: i === step ? Infinity : 0, ease: "easeInOut" }}
              className={`w-7 h-7 flex items-center justify-center flex-shrink-0 brutal-border-2 ${
                i < step ? "bg-ink text-paper" : i === step ? "bg-accent text-ink" : "bg-paper-2 text-ink/40"
              }`}
            >
              {i < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <div className="w-3 h-3 border-2 border-current" />
              )}
            </motion.div>
            <span className={`text-sm font-mono font-bold uppercase transition-colors duration-300 ${
              i === step ? "text-ink" : i < step ? "text-ink/60" : "text-ink/30"
            }`}>
              {s.label}
            </span>
            {i === step && <div className="ml-auto"><div className="w-4 h-4 border-2 border-ink border-t-transparent animate-spin" /></div>}
            {i < step && (
              <span className="ml-auto text-ink/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-sm mt-5 h-1.5 bg-ink/10">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
